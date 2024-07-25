import { AdminRepository } from '../repositories/admin_repository';
import { Admin } from '../../domain/admins';
import { query } from '../../../database/mysql';
import { ResultSetHeader } from 'mysql2';

export class SqlAdminRepository implements AdminRepository {
  async save(admin: Admin): Promise<Admin> {
    const sql = 'INSERT INTO admin_users (name, email, password, serialNumber) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [admin.name, admin.email, admin.password, admin.serialNumber]);
    
    if (result) {
      const [rows] = result;
      const insertId = (rows as ResultSetHeader).insertId;
      if (typeof insertId === 'number') {
        admin.id = insertId;
        return admin;
      } else {
        throw new Error('Insert ID is not a number');
      }
    } else {
      throw new Error('Error executing query');
    }
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const sql = 'SELECT * FROM admin_users WHERE email = ?';
    const result = await query(sql, [email]);
    
    if (result) {
      const [rows] = result;
      if (rows.length > 0) {
        return new Admin(rows[0]);
      }
    }
    return null;
  }
}
