import { EmployeeRepository } from '../infrastructure/repositories/employee_repository';
import { Employee } from '../domain/employee';
import { query } from '../../database/mysql';


interface EmployeeData {
  id?: number;
  name: string;
  lastName: string;
  idCard: string;
  section: string;
  accessKey?: string;
  
}

export class EmployeeService {
  constructor(private employeeRepository: EmployeeRepository) {}

  async createEmployee(employeeData: EmployeeData): Promise<Employee | string> {
    const existingEmployee = await this.employeeRepository.findByIdCard(employeeData.idCard);
    if (existingEmployee) {
      return 'Duplicate entry for idCard';
    }

    if (!employeeData.accessKey) {
      return 'Missing access key';
    }

    const employee = new Employee(employeeData);
    return await this.employeeRepository.save(employee);
  }

  async getEmployeeByIdCard(idCard: string): Promise<Employee | null> {
    return await this.employeeRepository.findByIdCard(idCard);
  }

  async updateEmployee(employeeData: EmployeeData): Promise<Employee> {
    const employee = new Employee(employeeData);
    return await this.employeeRepository.update(employee);
  }

  async deleteEmployee(employeeId: number): Promise<void> {
    try {
      await this.employeeRepository.delete(employeeId);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Error deleting employee');
    }
  }

  async saveHistory(employeeId: number, timestamp: string, action: 'entry' | 'exit'): Promise<void> {
    const sql = 'INSERT INTO employee_history (employee_id, timestamp, action) VALUES (?, ?, ?)';
    try {
      await query(sql, [employeeId, timestamp, action]);
    } catch (error) {
      console.error('Error saving history:', error);
      throw new Error('Error saving history');
    }
  }
  async getEmployeeHistory(employeeId: number): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history WHERE employee_id = ? ORDER BY timestamp DESC';
    try {
      const result: [any[], any] | null = await query(sql, [employeeId]);
      
      if (result) {
        const [rows] = result;
        return rows;
      } else {
        console.error('Query returned null');
        return []; // Retorna un array vacío si no hay resultados
      }
    } catch (error) {
      console.error('Error fetching employee history:', error);
      throw new Error('Error fetching employee history');
    }
  }

  async getAllEmployeesHistory(): Promise<any[]> {
    const sql = 'SELECT * FROM employee_history ORDER BY timestamp DESC';
    try {
      const result: [any[], any] | null = await query(sql, []);
      
      if (result) {
        const [rows] = result;
        return rows;
      } else {
        console.error('Query returned null');
        return []; // Retorna un array vacío si no hay resultados
      }
    } catch (error) {
      console.error('Error fetching all employees history:', error);
      throw new Error('Error fetching all employees history');
    }
  }

  async validateAccessKey(idCard: string, accessKey: string): Promise<boolean> {
    try {
      const employee = await this.getEmployeeByIdCard(idCard);
      return employee !== null && employee.accessKey === accessKey;
    } catch (error) {
      console.error('Error validating access key:', error);
      throw new Error('Error validating access key');
    }
  }
}
