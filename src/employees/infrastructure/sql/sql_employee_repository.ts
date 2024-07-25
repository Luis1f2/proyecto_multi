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

    async findById(employeeId: number): Promise<Employee | null> {
        const sql = 'SELECT * FROM employees WHERE id = ?';
        const result = await query(sql, [employeeId]);
        
        if (result) {
            const [rows] = result;
            if ((rows as any[]).length > 0) {
                return new Employee((rows as any[])[0]);
            }
        }
        return null;
    }

    async findAll(): Promise<Employee[]> {
        const sql = 'SELECT * FROM employees';
        const result = await query(sql, []);
        
        if (result) {
            const [rows] = result;
            return (rows as any[]).map(row => new Employee(row));
        }
        return [];
    }
}
