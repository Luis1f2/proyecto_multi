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

  async findById(employeeId: number): Promise<Employee | null> {
    const sql = 'SELECT * FROM employees WHERE id = ?';
    const result = await query(sql, [employeeId]);

    if (result) {
      const [rows] = result;
      if (Array.isArray(rows) && rows.length > 0) {
        return new Employee(rows[0]);
      }
    }
    return null;
  }

  async findByIdCard(idCard: string): Promise<Employee | null> {
    const sql = 'SELECT * FROM employees WHERE idCard = ?';
    const result = await query(sql, [idCard]);

    if (result) {
      const [rows] = result;
      if (Array.isArray(rows) && rows.length > 0) {
        return new Employee(rows[0]);
      }
    }
    return null;
  }

  async update(employee: Employee): Promise<Employee> {
    const sql = 'UPDATE employees SET name = ?, lastName = ?, idCard = ?, section = ? WHERE id = ?';
    await query(sql, [employee.name, employee.lastName, employee.idCard, employee.section, employee.id]);
    return employee;
  }

  async delete(employeeId: number): Promise<void> {
    const sql = 'DELETE FROM employees WHERE id = ?';
    await query(sql, [employeeId]);
  }
}
