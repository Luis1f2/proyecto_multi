import { WebSocket } from 'ws';
import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

interface Payload {
  id?: number; 
  idCard?: string;
  name?: string;
  lastName?: string;
  section?: string;
  action?: string;
  accessKey?: string;
  employeeId?: number;
}

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const handleEmployeeMessages = async (message: string, ws: WebSocket) => {
  const data: { action: string; payload: Payload } = JSON.parse(message);
  console.log(`Received message with action: ${data.action}`);

  const payload = data.payload;

  switch (data.action) {
    case 'employeeCreate':
      try {
        const { name = '', lastName = '', idCard = '', section = '' } = payload;
        const result = await employeeService.createEmployee({ name, lastName, idCard, section });
        if (typeof result === 'string') {
          ws.send(JSON.stringify({ action: 'employeeCreate', error: result }));
          console.error(`Error creating employee: ${result}`);
        } else {
          ws.send(JSON.stringify({ action: 'employeeCreate', employee: result }));
          console.log(`Employee created successfully: ${result.id}`);
        }
      } catch (error) {
        ws.send(JSON.stringify({ action: 'employeeCreate', error: 'Error creating employee' }));
        console.error('Error creating employee:', error);
      }
      break;

    case 'employeeGetByIdCard':
      try {
        const { idCard = '' } = payload;
        const employee = await employeeService.getEmployeeByIdCard(idCard);
        if (employee) {
          ws.send(JSON.stringify({ action: 'employeeGetByIdCard', employee }));
          console.log(`Employee found: ${employee.id}`);
        } else {
          ws.send(JSON.stringify({ action: 'employeeGetByIdCard', error: 'Employee not found' }));
          console.log('Employee not found');
        }
      } catch (error) {
        ws.send(JSON.stringify({ action: 'employeeGetByIdCard', error: 'Error fetching employee' }));
        console.error('Error fetching employee:', error);
      }
      break;

    case 'employeeDelete':
      try {
        const { employeeId = 0 } = payload;
        await employeeService.deleteEmployee(employeeId);
        ws.send(JSON.stringify({ action: 'employeeDelete', employeeId }));
        console.log(`Employee deleted: ${employeeId}`);
      } catch (error) {
        ws.send(JSON.stringify({ action: 'employeeDelete', error: 'Error deleting employee' }));
        console.error('Error deleting employee:', error);
      }
      break;

    case 'employeeUpdate':
      try {
        const { id = 0, name = '', lastName = '', idCard = '', section = '' } = payload;
        const employee = await employeeService.updateEmployee({ id, name, lastName, idCard, section });
        ws.send(JSON.stringify({ action: 'employeeUpdate', employee }));
        console.log(`Employee updated: ${employee.id}`);
      } catch (error) {
        ws.send(JSON.stringify({ action: 'employeeUpdate', error: 'Error updating employee' }));
        console.error('Error updating employee:', error);
      }
      break;

    case 'getEmployeeHistory':
      try {
        const { employeeId = 0 } = payload;
        const history = await employeeService.getEmployeeHistory(employeeId);
        if (history.length > 0) {
          ws.send(JSON.stringify({ action: 'getEmployeeHistory', history }));
          console.log(`History found for employee: ${employeeId}`);
        } else {
          ws.send(JSON.stringify({ action: 'getEmployeeHistory', message: 'No history found for this employee' }));
          console.log('No history found for this employee');
        }
      } catch (error) {
        ws.send(JSON.stringify({ action: 'getEmployeeHistory', error: 'Error fetching employee history' }));
        console.error('Error fetching employee history:', error);
      }
      break;

    case 'getAllEmployeesHistory':
      try {
        const history = await employeeService.getAllEmployeesHistory();
        if (history.length > 0) {
          ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', history }));
          console.log('History found for all employees');
        } else {
          ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', message: 'No history found' }));
          console.log('No history found for all employees');
        }
      } catch (error) {
        ws.send(JSON.stringify({ action: 'getAllEmployeesHistory', error: 'Error fetching all employees history' }));
        console.error('Error fetching all employees history:', error);
      }
      break;

    case 'validateAccessKey':
      try {
        const { idCard = '', accessKey = '' } = payload;
        const isValid = await employeeService.validateAccessKey(idCard, accessKey);
        ws.send(JSON.stringify({ action: 'validateAccessKey', isValid }));
        console.log(`Access key validation result: ${isValid}`);
      } catch (error) {
        ws.send(JSON.stringify({ action: 'validateAccessKey', error: 'Error validating access key' }));
        console.error('Error validating access key:', error);
      }
      break;

    default:
      ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
      console.log('Unknown action');
  }
};
