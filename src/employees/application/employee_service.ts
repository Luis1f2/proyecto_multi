import { EmployeeRepository } from '../infrastructure/repositories/employee_repository';
import { Employee } from '../domain/employee';

export class EmployeeService {
    constructor(private employeeRepository: EmployeeRepository) {}

    async createEmployee(employeeData: any): Promise<Employee> {
        const employee = new Employee(employeeData);
        return await this.employeeRepository.save(employee);
    }

    async deleteEmployee(employeeId: number): Promise<void> {
        await this.employeeRepository.delete(employeeId);
    }

    async getEmployeeById(employeeId: number): Promise<Employee | null> {
        return await this.employeeRepository.findById(employeeId);
    }

    async getAllEmployees(): Promise<Employee[]> {
        return await this.employeeRepository.findAll();
    }
}
