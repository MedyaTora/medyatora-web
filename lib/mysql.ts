import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var medyatoraMysqlPool: mysql.Pool | undefined;
}

const REQUIRED_MYSQL_ENVS = [
  "MYSQL_HOST",
  "MYSQL_DATABASE",
  "MYSQL_USER",
  "MYSQL_PASSWORD",
] as const;

export function hasMysqlConfig() {
  return REQUIRED_MYSQL_ENVS.every((name) => Boolean(process.env[name]));
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable eksik.`);
  }

  return value;
}

export function getMysqlPool() {
  if (!hasMysqlConfig()) {
    throw new Error(
      "MySQL bağlantı ayarları eksik. MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER ve MYSQL_PASSWORD kontrol edilmeli."
    );
  }

  if (!global.medyatoraMysqlPool) {
    global.medyatoraMysqlPool = mysql.createPool({
      host: getRequiredEnv("MYSQL_HOST"),
      port: Number(process.env.MYSQL_PORT || 3306),
      database: getRequiredEnv("MYSQL_DATABASE"),
      user: getRequiredEnv("MYSQL_USER"),
      password: getRequiredEnv("MYSQL_PASSWORD"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "Z",
    });
  }

  return global.medyatoraMysqlPool;
}

export async function executeQuery<T = mysql.RowDataPacket[]>(
  sql: string,
  params: any[] = []
) {
  const pool = getMysqlPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function executeQuerySafe<T = mysql.RowDataPacket[]>(
  sql: string,
  params: any[] = [],
  fallback: T
) {
  if (!hasMysqlConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[MedyaTora] MySQL env eksik olduğu için safe fallback döndürüldü."
      );
    }

    return fallback;
  }

  try {
    return await executeQuery<T>(sql, params);
  } catch (error) {
    console.error("[MedyaTora] MySQL query hatası:", error);
    return fallback;
  }
}