import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { getMysqlPool } from "@/lib/mysql";

type ActionType = "approve" | "reject";
type CurrencyCode = "TL" | "USD" | "RUB";
type BalanceColumn = "balance_tl" | "balance_usd" | "balance_rub";

type TopupRequestRow = RowDataPacket & {
  id: number;
  user_id: number;
  request_number: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  currency: string;
  amount: string | number;
  payment_method: string | null;
  support_channel: string | null;
  status: string;
  user_note: string | null;
  admin_note: string | null;
  receipt_sent: number;
  receipt_sent_at: Date | string | null;
  approved_at: Date | string | null;
  rejected_at: Date | string | null;
  created_at: Date | string;
};

type UserBalanceRow = RowDataPacket & {
  id: number;
  email: string;
  full_name: string | null;
  balance_tl: string | number;
  balance_usd: string | number;
  balance_rub: string | number;
};

type ColumnRow = RowDataPacket & {
  Field: string;
};

function isAdminCookieValid(adminCookie: string | undefined) {
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) return false;

  return adminCookie === expectedSecret;
}

function normalizeAction(value: unknown): ActionType | null {
  const action = String(value || "").trim().toLowerCase();

  if (action === "approve") return "approve";
  if (action === "reject") return "reject";

  return null;
}

function normalizeCurrency(value: unknown): CurrencyCode {
  const currency = String(value || "").trim().toUpperCase();

  if (currency === "USD") return "USD";
  if (currency === "RUB") return "RUB";

  return "TL";
}

function getBalanceColumn(currency: CurrencyCode): BalanceColumn {
  if (currency === "USD") return "balance_usd";
  if (currency === "RUB") return "balance_rub";

  return "balance_tl";
}

function safeNumber(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) return 0;

  return Math.round((numberValue + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: number, currency: CurrencyCode) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

async function getTableColumns(connection: PoolConnection, tableName: string) {
  const [rows] = await connection.query<ColumnRow[]>(
    `
    SHOW COLUMNS FROM ${tableName}
    `
  );

  return new Set(rows.map((row) => String(row.Field)));
}

function addInsertValue(
  columns: string[],
  placeholders: string[],
  values: unknown[],
  availableColumns: Set<string>,
  columnName: string,
  value: unknown
) {
  if (!availableColumns.has(columnName)) return;

  columns.push(columnName);
  placeholders.push("?");
  values.push(value);
}

async function insertBalanceTransaction({
  connection,
  userId,
  currency,
  amount,
  beforeBalance,
  afterBalance,
  requestId,
  requestNumber,
}: {
  connection: PoolConnection;
  userId: number;
  currency: CurrencyCode;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  requestId: number;
  requestNumber: string;
}) {
  const columns = await getTableColumns(connection, "balance_transactions");

  const insertColumns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];

  const description = `Bakiye yükleme onayı - ${requestNumber}`;

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "user_id",
    userId
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "transaction_type",
    "balance_topup"
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "currency",
    currency
  );

  addInsertValue(insertColumns, placeholders, values, columns, "amount", amount);

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "balance_before",
    beforeBalance
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "balance_after",
    afterBalance
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "amount_usd",
    currency === "USD" ? amount : 0
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "balance_before_usd",
    currency === "USD" ? beforeBalance : 0
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "balance_after_usd",
    currency === "USD" ? afterBalance : 0
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "description",
    description
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "related_topup_id",
    requestId
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "related_order_id",
    null
  );

  addInsertValue(
    insertColumns,
    placeholders,
    values,
    columns,
    "related_analysis_id",
    null
  );

  if (columns.has("created_at")) {
    insertColumns.push("created_at");
    placeholders.push("NOW()");
  }

  if (insertColumns.length === 0) return;

  await connection.query(
    `
    INSERT INTO balance_transactions (${insertColumns.join(", ")})
    VALUES (${placeholders.join(", ")})
    `,
    values
  );
}

async function sendTelegramAdminNotification({
  action,
  requestNumber,
  userId,
  fullName,
  email,
  amount,
  currency,
}: {
  action: ActionType;
  requestNumber: string;
  userId: number;
  fullName: string | null;
  email: string | null;
  amount: number;
  currency: CurrencyCode;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const title =
    action === "approve"
      ? "✅ Bakiye yükleme onaylandı"
      : "❌ Bakiye yükleme reddedildi";

  const message = [
    title,
    "",
    `Talep No: ${requestNumber}`,
    `Kullanıcı ID: ${userId}`,
    `Ad Soyad: ${fullName || "-"}`,
    `E-posta: ${email || "-"}`,
    `Tutar: ${formatMoney(amount, currency)}`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch {
    // Telegram hatası ana işlemi bozmasın.
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("medyatora_admin")?.value;

  if (!isAdminCookieValid(adminCookie)) {
    return NextResponse.json(
      {
        success: false,
        error: "Admin yetkisi gerekli.",
      },
      { status: 401 }
    );
  }

  const pool = getMysqlPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json().catch(() => null);

    const requestId = Number(body?.request_id || body?.requestId || 0);
    const action = normalizeAction(body?.action);
    const adminNote = String(body?.admin_note || body?.adminNote || "")
      .trim()
      .slice(0, 2000);

    if (!requestId || !Number.isFinite(requestId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçerli bir yatırım talebi bulunamadı.",
        },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz işlem türü.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [requestRows] = await connection.query<TopupRequestRow[]>(
      `
      SELECT
        id,
        user_id,
        request_number,
        full_name,
        email,
        phone_number,
        currency,
        amount,
        payment_method,
        support_channel,
        status,
        user_note,
        admin_note,
        receipt_sent,
        receipt_sent_at,
        approved_at,
        rejected_at,
        created_at
      FROM balance_topup_requests
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [requestId]
    );

    const topupRequest = requestRows[0];

    if (!topupRequest) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Yatırım talebi bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (topupRequest.status !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bu yatırım talebi daha önce işleme alınmış.",
        },
        { status: 409 }
      );
    }

    const currency = normalizeCurrency(topupRequest.currency);
    const amount = safeNumber(topupRequest.amount);

    if (amount <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Yatırım tutarı geçersiz.",
        },
        { status: 400 }
      );
    }

    if (action === "reject") {
      await connection.query<ResultSetHeader>(
        `
        UPDATE balance_topup_requests
        SET
          status = 'rejected',
          admin_note = ?,
          rejected_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
          AND status = 'pending'
        `,
        [
          adminNote || "Dekont doğrulanamadığı için bakiye yükleme reddedildi.",
          requestId,
        ]
      );

      await connection.commit();

      await sendTelegramAdminNotification({
        action,
        requestNumber: topupRequest.request_number,
        userId: Number(topupRequest.user_id),
        fullName: topupRequest.full_name,
        email: topupRequest.email,
        amount,
        currency,
      });

      return NextResponse.json({
        success: true,
        message: "Yatırım talebi reddedildi.",
      });
    }

    const balanceColumn = getBalanceColumn(currency);

    const [userRows] = await connection.query<UserBalanceRow[]>(
      `
      SELECT
        id,
        email,
        full_name,
        balance_tl,
        balance_usd,
        balance_rub
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [topupRequest.user_id]
    );

    const user = userRows[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı bulunamadı.",
        },
        { status: 404 }
      );
    }

    const beforeBalance = safeNumber(user[balanceColumn]);
    const afterBalance = safeNumber(beforeBalance + amount);

    await connection.query<ResultSetHeader>(
      `
      UPDATE users
      SET ${balanceColumn} = ?
      WHERE id = ?
      `,
      [afterBalance, topupRequest.user_id]
    );

    await connection.query<ResultSetHeader>(
      `
      UPDATE balance_topup_requests
      SET
        status = 'approved',
        admin_note = ?,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
        AND status = 'pending'
      `,
      [
        adminNote || "Dekont kontrol edildi, bakiye yükleme onaylandı.",
        requestId,
      ]
    );

    await insertBalanceTransaction({
      connection,
      userId: Number(topupRequest.user_id),
      currency,
      amount,
      beforeBalance,
      afterBalance,
      requestId,
      requestNumber: topupRequest.request_number,
    });

    await connection.commit();

    await sendTelegramAdminNotification({
      action,
      requestNumber: topupRequest.request_number,
      userId: Number(topupRequest.user_id),
      fullName: topupRequest.full_name || user.full_name,
      email: topupRequest.email || user.email,
      amount,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: `${formatMoney(
        amount,
        currency
      )} kullanıcının ${currency} bakiyesine eklendi.`,
      balanceBefore: beforeBalance,
      balanceAfter: afterBalance,
      currency,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // rollback hatası yok sayılır.
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Yatırım talebi işlenemedi.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}