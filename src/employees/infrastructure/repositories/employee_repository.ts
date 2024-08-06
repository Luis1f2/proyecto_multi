import { Employee } from '../../domain/employee';

export interface EmployeeRepository {
  save(employee: Employee): Promise<Employee>;
  findById(employeeId: number): Promise<Employee | null>;
  findByIdCard(idCard: string): Promise<Employee | null>;
  update(employee: Employee): Promise<Employee>;
  delete(employeeId: number): Promise<void>;
  validateAccessKey(idCard: string, accessKey: string): Promise<boolean>; 
}
