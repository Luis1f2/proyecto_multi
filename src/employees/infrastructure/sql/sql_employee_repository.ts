import { EmployeeRepository } from '../repositories/employee_repository';
import { Employee } from '../../domain/employee';
import { query } from '../../../database/mysql';
import { ResultSetHeader } from 'mysql2';

export class SqlEmployeeRepository implements EmployeeRepository {
  async save(employee: Employee): Promise<Employee> {
    const sql = 'INSERT INTO employees (name, lastName, idCard, section, accessKey) VALUES (?, ?, ?, ?, ?)';
    const result: any = await query(sql, [employee.name, employee.lastName, employee.idCard, employee.section, employee.accessKey]);

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
    const result: any = await query(sql, [employeeId]);

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
    const result: any = await query(sql, [idCard]);

    if (result) {
      const [rows] = result;
      if (Array.isArray(rows) && rows.length > 0) {
        return new Employee(rows[0]);
      }
    }
    return null;
  }

  async update(employee: Employee): Promise<Employee> {
    const sql = 'UPDATE employees SET name = ?, lastName = ?, idCard = ?, section = ?, accessKey = ? WHERE id = ?';
    await query(sql, [employee.name, employee.lastName, employee.idCard, employee.section, employee.accessKey, employee.id]);
    return employee;
  }

  async delete(employeeId: number): Promise<void> {
    const sql = 'DELETE FROM employees WHERE id = ?';
    await query(sql, [employeeId]);
  }

  async getEmployeeHistory(employeeId: number): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history WHERE employee_id = ? ORDER BY timestamp DESC';
    const result: any = await query(sql, [employeeId]);

    if (result) {
      const [rows] = result;
      return rows;
    }
    return [];
  }

  async getAllEmployeesHistory(): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history ORDER BY timestamp DESC';
    const result: any = await query(sql, []);

    if (result) {
      const [rows] = result;
      return rows;
    }
    return [];
  }

  async findByAccessKey(accessKey: string): Promise<Employee | null> {
    const sql = 'SELECT * FROM employees WHERE accessKey = ?';
    const result: any = await query(sql, [accessKey]);

    if (result) {
      const [rows] = result;
      if (Array.isArray(rows) && rows.length > 0) {
        return new Employee(rows[0]);
      }
    }
    return null;
  }

  async validateAccessKey(idCard: string, accessKey: string): Promise<boolean> {
    const sql = 'SELECT * FROM employees WHERE idCard = ? AND accessKey = ?';
    const result: any = await query(sql, [idCard, accessKey]);

    if (result) {
      const [rows] = result;
      return Array.isArray(rows) && rows.length > 0;
    }
    return false;
  }
}
