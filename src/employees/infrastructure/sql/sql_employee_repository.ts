import { EmployeeRepository } from '../repositories/employee_repository';
import { Employee } from '../../domain/employee';
import { query } from '../../../database/mysql';
import { ResultSetHeader } from 'mysql2';

export class SqlEmployeeRepository implements EmployeeRepository {
    async save(employee: Employee): Promise<Employee> {
        const sql = 'INSERT INTO employees (name, lastName, idCard, section) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [employee.name, employee.lastName, employee.idCard, employee.section]);
        
        if (result) {
            const [rows] = result;
            const insertId = (rows as ResultSetHeader).insertId;
            if (typeof insertId === 'number') {
                employee.id = insertId;
                return employee;
            } else {
                throw new Error('Insert ID is not a number');
            }
        } else {
            throw new Error('Error executing query');
        }
    }

    async delete(employeeId: number): Promise<void> {
        const sql = 'DELETE FROM employees WHERE id = ?';
        await query(sql, [employeeId]);
    }
}
