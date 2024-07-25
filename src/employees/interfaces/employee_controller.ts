import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const handleEmployeeMessages = async (message: any, ws: any) => {
    const data = JSON.parse(message);

    switch (data.action) {
        case 'createEmployee':
            await handleCreateEmployee(data.payload, ws);
            break;
        case 'deleteEmployee':
            await handleDeleteEmployee(data.payload, ws);
            break;
        case 'getEmployeeById':
            await handleGetEmployeeById(data.payload, ws);
            break;
        case 'getAllEmployees':
            await handleGetAllEmployees(ws);
            break;
        default:
            ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
            break;
    }
};

const handleCreateEmployee = async (payload: any, ws: any) => {
    try {
        const employee = await employeeService.createEmployee(payload);
        ws.send(JSON.stringify({ action: 'createEmployee', status: 'success', employee }));
    } catch (error) {
        handleError(error, 'createEmployee', ws);
    }
};

const handleDeleteEmployee = async (payload: any, ws: any) => {
    try {
        const { employeeId } = payload;
        await employeeService.deleteEmployee(parseInt(employeeId, 10));
        ws.send(JSON.stringify({ action: 'deleteEmployee', status: 'success', employeeId }));
    } catch (error) {
        handleError(error, 'deleteEmployee', ws);
    }
};

const handleGetEmployeeById = async (payload: any, ws: any) => {
    try {
        const { id } = payload;
        const employee = await employeeService.getEmployeeById(parseInt(id, 10));
        if (employee) {
            ws.send(JSON.stringify({ action: 'getEmployeeById', status: 'success', employee }));
        } else {
            ws.send(JSON.stringify({ action: 'getEmployeeById', status: 'error', message: 'Empleado no encontrado' }));
        }
    } catch (error) {
        handleError(error, 'getEmployeeById', ws);
    }
};

const handleGetAllEmployees = async (ws: any) => {
    try {
        const employees = await employeeService.getAllEmployees();
        ws.send(JSON.stringify({ action: 'getAllEmployees', status: 'success', employees }));
    } catch (error) {
        handleError(error, 'getAllEmployees', ws);
    }
};

const handleError = (error: unknown, action: string, ws: any) => {
    if (error instanceof Error) {
        ws.send(JSON.stringify({ action, status: 'error', message: error.message }));
    } else {
        ws.send(JSON.stringify({ action, status: 'error', message: 'Unknown error' }));
    }
};
