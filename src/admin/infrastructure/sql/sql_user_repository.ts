import { UserRepository } from '../repositories/user_repository';
import { User } from '../../domain/user';
import { query } from '../../../database/mysql';
import { ResultSetHeader } from 'mysql2';

export class SqlUserRepository implements UserRepository {
    async save(user: User): Promise<User> {
        const sql = 'INSERT INTO users (name, email, password, serialNumber) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [user.name, user.email, user.password, user.serialNumber]);
        
        if (result) {
            const [rows, fields] = result;
            const insertId = (rows as ResultSetHeader).insertId;
            user.id = insertId;
            return user;
        } else {
            throw new Error('Error executing query');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const result = await query(sql, [email]);
        
        if (result) {
            const [rows, fields] = result;
            if (rows.length > 0) {
                return new User(rows[0]);
            }
        }
        return null;
    }
}

