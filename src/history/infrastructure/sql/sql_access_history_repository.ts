import { AccessHistoryRepository } from '../repositories/access_history_repository';
import { AccessHistory } from '../../domain/access_history';
import { query } from '../../../database/mysql';
import { ResultSetHeader } from 'mysql2';

export class SqlAccessHistoryRepository implements AccessHistoryRepository {
    async save(accessHistory: AccessHistory): Promise<AccessHistory> {
        const sql = 'INSERT INTO access_history (name, lastName, section, entryTime, exitTime, entryPhoto, exitPhoto) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await query(sql, [accessHistory.name, accessHistory.lastName, accessHistory.section, accessHistory.entryTime, accessHistory.exitTime, accessHistory.entryPhoto, accessHistory.exitPhoto]);
        
        if (result) {
            const [rows] = result;
            const insertId = (rows as ResultSetHeader).insertId;
            if (typeof insertId === 'number') {
                accessHistory.id = insertId;
                return accessHistory;
            } else {
                throw new Error('Insert ID is not a number');
            }
        } else {
            throw new Error('Error executing query');
        }
    }

    async findAll(): Promise<AccessHistory[]> {
        const sql = 'SELECT * FROM access_history';
        const result = await query(sql, []);
        
        if (result) {
            const [rows] = result;
            return (rows as any[]).map(row => new AccessHistory(row));
        }
        return [];
    }
}
