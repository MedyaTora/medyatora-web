import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getMysqlPool, hasMysqlConfig } from "@/lib/mysql";

type Channel = "whatsapp" | "telegram";
type AdminAction = "approve" | "reject";

type ContactVerificationRequestRow = RowDataPacket & {
  id: number;
  user_id: number;
  channel: Channel;
  contact_value: string;
  verification_code: string;
  status: string;
  admin_note: string | null;
};

type TableColumnRow = RowDataPacket & {
  COLUMN_NAME?: string;
  column_name?: string;
  Field?: string;
};

type QueryConnection = {
  query: (sql: string, values?: unknown[]) => Promise<[unknown, unknown]>;
  execute: (sql: string, values?: unknown[]) => Promise<[unknown, unknown]>;
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
};

function normalizeAction(value: unknown): AdminAction | null {
  const action = String(value || "").trim().toLowerCase();

  if (action === "approve") return "approve";
  if (action === "reject") return "reject";

  return null;
}

function normalizeAdminNote(value: unknown) {
  return String(value || "").trim().slice(0, 500);
}

function boolValue(value: unknown) {
  return value === true || value === 1 || value === "1";
}

async function getTableColumns(
  connection: QueryConnection,
  tableName: string
): Promise<Set<string>> {
  const [rawRows] = await connection.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `,
    [tableName]
  );

  const rows = rawRows as TableColumnRow[];

  return new Set<string>(
    rows
      .map((row: TableColumnRow) =>
        String(row.COLUMN_NAME || row.column_name || row.Field || "")
      )
      .filter(Boolean)
  );
}

function buildApproveRequestSql(columns: Set<string>) {
  const updateParts = ["status = 'approved'"];
  const values: unknown[] = [];

  if (columns.has("admin_note")) {
    updateParts.push("admin_note = ?");
    values.push(null);
  }

  if (columns.has("approved_at")) {
    updateParts.push("approved_at = NOW()");
  }

  if (columns.has("rejected_at")) {
    updateParts.push("rejected_at = NULL");
  }

  if (columns.has("updated_at")) {
    updateParts.push("updated_at = NOW()");
  }

  const sql = `
    UPDATE contact_verification_requests
    SET ${updateParts.join(", ")}
    WHERE id = ?
    LIMIT 1
  `;

  return { sql, values };
}

function buildRejectRequestSql(columns: Set<string>, adminNote: string) {
  const updateParts = ["status = 'rejected'"];
  const values: unknown[] = [];

  if (columns.has("admin_note")) {
    updateParts.push("admin_note = ?");
    values.push(adminNote || "Admin tarafından reddedildi.");
  }

  if (columns.has("rejected_at")) {
    updateParts.push("rejected_at = NOW()");
  }

  if (columns.has("approved_at")) {
    updateParts.push("approved_at = NULL");
  }

  if (columns.has("updated_at")) {
    updateParts.push("updated_at = NOW()");
  }

  const sql = `
    UPDATE contact_verification_requests
    SET ${updateParts.join(", ")}
    WHERE id = ?
    LIMIT 1
  `;

  return { sql, values };
}

function buildUserVerificationUpdate({
  columns,
  channel,
  contactValue,
  shouldGrantBonus,
}: {
  columns: Set<string>;
  channel: Channel;
  contactValue: string;
  shouldGrantBonus: boolean;
}) {
  const updateParts: string[] = [];
  const values: unknown[] = [];

  if (channel === "whatsapp") {
    if (columns.has("whatsapp_verified_at")) {
      updateParts.push("whatsapp_verified_at = NOW()");
    }

    if (columns.has("phone_verified")) {
      updateParts.push("phone_verified = 1");
    }

    if (columns.has("phone_verified_at")) {
      updateParts.push("phone_verified_at = NOW()");
    }

    if (columns.has("phone_number") && contactValue) {
      updateParts.push("phone_number = ?");
      values.push(contactValue);
    }
  }

  if (channel === "telegram") {
    if (columns.has("telegram_verified_at")) {
      updateParts.push("telegram_verified_at = NOW()");
    }

    if (columns.has("telegram_username") && contactValue) {
      updateParts.push("telegram_username = ?");
      values.push(contactValue);
    }
  }

  if (shouldGrantBonus) {
    if (columns.has("balance_usd")) {
      updateParts.push("balance_usd = COALESCE(balance_usd, 0) + 1");
    }

    if (columns.has("contact_bonus_granted_at")) {
      updateParts.push("contact_bonus_granted_at = NOW()");
    }

    if (columns.has("welcome_bonus_claimed")) {
      updateParts.push("welcome_bonus_claimed = 1");
    }
  }

  if (columns.has("updated_at")) {
    updateParts.push("updated_at = NOW()");
  }

  return {
    updateParts,
    values,
  };
}

async function insertBalanceTransactionIfPossible({
  connection,
  columns,
  userId,
  balanceBefore,
  balanceAfter,
  requestId,
}: {
  connection: QueryConnection;
  columns: Set<string>;
  userId: number;
  balanceBefore: number;
  balanceAfter: number;
  requestId: number;
}) {
  if (!columns.has("user_id")) return;

  const insertColumns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];

  function add(column: string, value: unknown) {
    if (!columns.has(column)) return;

    insertColumns.push(column);
    placeholders.push("?");
    values.push(value);
  }

  add("user_id", userId);
  add("transaction_type", "contact_verification_bonus");
  add("currency", "USD");
  add("amount", 1);
  add("balance_before", balanceBefore);
  add("balance_after", balanceAfter);
  add("amount_usd", 1);
  add("balance_before_usd", balanceBefore);
  add("balance_after_usd", balanceAfter);
  add(
    "description",
    `WhatsApp / Telegram iletişim doğrulama bonusu - Talep #${requestId}`
  );
  add("related_order_id", null);

  if (columns.has("created_at")) {
    insertColumns.push("created_at");
    placeholders.push("NOW()");
  }

  if (insertColumns.length === 0) return;

  await connection.execute(
    `
    INSERT INTO balance_transactions (
      ${insertColumns.join(", ")}
    )
    VALUES (
      ${placeholders.join(", ")}
    )
    `,
    values
  );
}

export async function POST(request: Request) {
  if (!hasMysqlConfig()) {
    return NextResponse.json(
      {
        success: false,
        error: "MySQL bağlantısı bulunamadı.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);

  const requestId = Number(body?.request_id || body?.id || 0);
  const action = normalizeAction(body?.action);
  const adminNote = normalizeAdminNote(body?.admin_note);

  if (!requestId || !Number.isFinite(requestId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Geçerli bir doğrulama talep ID değeri gönderilmedi.",
      },
      { status: 400 }
    );
  }

  if (!action) {
    return NextResponse.json(
      {
        success: false,
        error: "Geçerli bir işlem seçilmedi.",
      },
      { status: 400 }
    );
  }

  const pool = getMysqlPool();
  const connection = (await pool.getConnection()) as QueryConnection;

  try {
    await connection.beginTransaction();

    const requestColumns = await getTableColumns(
      connection,
      "contact_verification_requests"
    );

    const userColumns = await getTableColumns(connection, "users");
    const balanceTransactionColumns = await getTableColumns(
      connection,
      "balance_transactions"
    );

    const [rawRequestRows] = await connection.query(
      `
      SELECT
        id,
        user_id,
        channel,
        contact_value,
        verification_code,
        status,
        admin_note
      FROM contact_verification_requests
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [requestId]
    );

    const requestRows = rawRequestRows as ContactVerificationRequestRow[];
    const verificationRequest = requestRows[0];

    if (!verificationRequest) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Doğrulama talebi bulunamadı.",
        },
        { status: 404 }
      );
    }

    if (verificationRequest.status !== "pending") {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Bu doğrulama talebi daha önce sonuçlandırılmış.",
        },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const rejectSql = buildRejectRequestSql(requestColumns, adminNote);

      await connection.execute(rejectSql.sql, [
        ...rejectSql.values,
        verificationRequest.id,
      ]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Doğrulama talebi reddedildi.",
      });
    }

    const [rawUserRows] = await connection.query(
      `
      SELECT
        id,
        balance_usd,
        contact_bonus_granted_at,
        welcome_bonus_claimed
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [verificationRequest.user_id]
    );

    const userRows = rawUserRows as Array<
      RowDataPacket & {
        id: number;
        balance_usd?: string | number | null;
        contact_bonus_granted_at?: string | Date | null;
        welcome_bonus_claimed?: number | boolean | string | null;
      }
    >;

    const user = userRows[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı hesabı bulunamadı.",
        },
        { status: 404 }
      );
    }

    const contactBonusAlreadyGranted = Boolean(
      user.contact_bonus_granted_at || boolValue(user.welcome_bonus_claimed)
    );

    const shouldGrantBonus = !contactBonusAlreadyGranted;

    const balanceBefore = Number(user.balance_usd || 0);
    const balanceAfter = shouldGrantBonus ? balanceBefore + 1 : balanceBefore;

    const approveSql = buildApproveRequestSql(requestColumns);

    await connection.execute(approveSql.sql, [
      ...approveSql.values,
      verificationRequest.id,
    ]);

    const userUpdate = buildUserVerificationUpdate({
      columns: userColumns,
      channel: verificationRequest.channel,
      contactValue: verificationRequest.contact_value,
      shouldGrantBonus,
    });

    if (userUpdate.updateParts.length > 0) {
      await connection.execute(
        `
        UPDATE users
        SET ${userUpdate.updateParts.join(", ")}
        WHERE id = ?
        LIMIT 1
        `,
        [...userUpdate.values, verificationRequest.user_id]
      );
    }

    if (shouldGrantBonus) {
      await insertBalanceTransactionIfPossible({
        connection,
        columns: balanceTransactionColumns,
        userId: verificationRequest.user_id,
        balanceBefore,
        balanceAfter,
        requestId: verificationRequest.id,
      });
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: shouldGrantBonus
        ? "Doğrulama onaylandı ve kullanıcıya 1 USD bonus tanımlandı."
        : "Doğrulama onaylandı. Bu kullanıcı daha önce bonus aldığı için tekrar bonus verilmedi.",
      bonusGranted: shouldGrantBonus,
    });
  } catch (error) {
    await connection.rollback();

    console.error("ADMIN_CONTACT_VERIFICATION_APPROVE_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Doğrulama işlemi sırasında hata oluştu.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}