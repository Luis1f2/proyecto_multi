import { EmployeeRepository } from '../infrastructure/repositories/employee_repository';
import { Employee } from '../domain/employee';
import { query } from '../../database/mysql';

export class EmployeeService {
  constructor(private employeeRepository: EmployeeRepository) {}

  async createEmployee(employeeData: any): Promise<Employee | string> {
    // Verificar si el idCard ya existe
    const existingEmployee = await this.employeeRepository.findByIdCard(employeeData.idCard);
    if (existingEmployee) {
      return 'Duplicate entry for idCard';
    }

    const employee = new Employee(employeeData);
    return await this.employeeRepository.save(employee);
  }

  async getEmployeeByIdCard(idCard: string): Promise<Employee | null> {
    return await this.employeeRepository.findByIdCard(idCard);
  }

  async updateEmployee(employeeData: any): Promise<Employee> {
    const employee = new Employee(employeeData);
    return await this.employeeRepository.update(employee);
  }

  async deleteEmployee(employeeId: number): Promise<void> {
    await this.employeeRepository.delete(employeeId);
  }

  async saveHistory(employeeId: number, timestamp: string, imagePath: string, action: 'entry' | 'exit'): Promise<void> {
    const sql = 'INSERT INTO employee_history (employee_id, timestamp, image_path, action) VALUES (?, ?, ?, ?)';
    try {
      await query(sql, [employeeId, timestamp, imagePath, action]);
    } catch (error) {
      throw new Error('Error saving history');
    }
  }

  async getEmployeeHistory(employeeId: number): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history WHERE employee_id = ? ORDER BY timestamp DESC';
    try {
      const result: any = await query(sql, [employeeId]);
      if (result) {
        const [rows] = result;
        return rows;
      }
    } catch (error) {
      throw new Error('Error fetching employee history');
    }
    return [];
  }

  async getAllEmployeesHistory(): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history ORDER BY timestamp DESC';
    try {
      const result: any = await query(sql, []);
      if (result) {
        const [rows] = result;
        return rows;
      }
    } catch (error) {
      throw new Error('Error fetching all employees history');
    }
    return [];
  }
}
