import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var medyatoraMysqlPool: mysql.Pool | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable eksik.`);
  }

  return value;
}

export function getMysqlPool() {
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
