import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Signale } from 'signale';

dotenv.config();
const signale = new Signale();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306, // Asegurarse de que el puerto se está leyendo correctamente
  waitForConnections: true,
  connectionLimit: 10,
};

// Crear el pool de conexiones
const pool = mysql.createPool(config);

export async function query(sql: string, params: any[]): Promise<[any, any] | null> {
  try {
    const conn = await pool.getConnection();
    signale.success('Conexión exitosa a la BD');
    const result = await conn.execute(sql, params);
    conn.release();
    return result;
  } catch (error) {
    signale.error('Error al ejecutar la consulta:', error);
    return null;
  }
}
