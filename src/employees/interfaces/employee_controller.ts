import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const handleEmployeeMessages = async (message: any, ws: any) => {
    const data = JSON.parse(message);

    if (data.action === 'createEmployee') {
        const { name, lastName, idCard, section } = data;
        const employee = await employeeService.createEmployee({ name, lastName, idCard, section });
        ws.send(JSON.stringify({ action: 'createEmployee', employee }));
    }

    if (data.action === 'deleteEmployee') {
        const { employeeId } = data;
        await employeeService.deleteEmployee(parseInt(employeeId, 10));
        ws.send(JSON.stringify({ action: 'deleteEmployee', employeeId }));
    }
};
