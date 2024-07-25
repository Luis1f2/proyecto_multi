import { EmployeeRepository } from '../infrastructure/repositories/employee_repository';
import { Employee } from '../domain/employee';
import { query } from '../../database/mysql';

export class EmployeeService {
  constructor(private employeeRepository: EmployeeRepository) {}

  async createEmployee(employeeData: any): Promise<Employee> {
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
    await query(sql, [employeeId, timestamp, imagePath, action]);
  }
}
