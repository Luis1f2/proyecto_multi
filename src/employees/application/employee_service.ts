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
}
