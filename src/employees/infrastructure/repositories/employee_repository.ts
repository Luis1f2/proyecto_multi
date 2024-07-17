import { Employee } from '../../domain/employee';

export interface EmployeeRepository {
    save(employee: Employee): Promise<Employee>;
    delete(employeeId: number): Promise<void>;
}
