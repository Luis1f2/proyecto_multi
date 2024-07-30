import { WebSocket } from 'ws';
import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const handleEmployeeMessages = async (message: string, ws: WebSocket) => {
  const data = JSON.parse(message);

  if (data.action === 'employeeCreate') {
    try {
      const { name, lastName, idCard, section } = data.payload;
      const result = await employeeService.createEmployee({ name, lastName, idCard, section });
      if (typeof result === 'string') {
        ws.send(JSON.stringify({ action: 'employeeCreate', error: result }));
      } else {
        ws.send(JSON.stringify({ action: 'employeeCreate', employee: result }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeCreate', error: 'Error creating employee' }));
      console.error('Error creating employee:', error);
    }
  } else if (data.action === 'employeeGetByIdCard') {
    try {
      const { idCard } = data.payload;
      const employee = await employeeService.getEmployeeByIdCard(idCard);
      if (employee) {
        ws.send(JSON.stringify({ action: 'employeeGetByIdCard', employee }));
      } else {
        ws.send(JSON.stringify({ action: 'employeeGetByIdCard', error: 'Employee not found' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeGetByIdCard', error: 'Error fetching employee' }));
      console.error('Error fetching employee:', error);
    }
  } else if (data.action === 'employeeDelete') {
    try {
      const { employeeId } = data.payload;
      await employeeService.deleteEmployee(employeeId);
      ws.send(JSON.stringify({ action: 'employeeDelete', employeeId }));
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeDelete', error: 'Error deleting employee' }));
      console.error('Error deleting employee:', error);
    }
  } else if (data.action === 'employeeUpdate') {
    try {
      const { id, name, lastName, idCard, section } = data.payload;
      const employee = await employeeService.updateEmployee({ id, name, lastName, idCard, section });
      ws.send(JSON.stringify({ action: 'employeeUpdate', employee }));
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeUpdate', error: 'Error updating employee' }));
      console.error('Error updating employee:', error);
    }
  } else if (data.action === 'getEmployeeHistory') {
    try {
      const { employeeId } = data.payload;
      const history = await employeeService.getEmployeeHistory(employeeId);
      if (history.length > 0) {
        ws.send(JSON.stringify({ action: 'getEmployeeHistory', history }));
      } else {
        ws.send(JSON.stringify({ action: 'getEmployeeHistory', message: 'No history found for this employee' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'getEmployeeHistory', error: 'Error fetching employee history' }));
      console.error('Error fetching employee history:', error);
    }
  } else if (data.action === 'getAllEmployeesHistory') {
    try {
      const history = await employeeService.getAllEmployeesHistory();
      if (history.length > 0) {
        ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', history }));
      } else {
        ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', message: 'No history found' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', error: 'Error fetching all employees history' }));
      console.error('Error fetching all employees history:', error);
    }
  } else if (data.action === 'validateAccessKey') {
    try {
      const { idCard, accessKey } = data.payload;
      const isValid = await employeeService.validateAccessKey(idCard, accessKey);
      ws.send(JSON.stringify({ action: 'validateAccessKey', isValid }));
    } catch (error) {
      ws.send(JSON.stringify({ action: 'validateAccessKey', error: 'Error validating access key' }));
      console.error('Error validating access key:', error);
    }
  } else {
    ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
  }
};
