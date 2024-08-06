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

const actionHandlers: { [key: string]: (payload: Payload, ws: WebSocket) => Promise<void> } = {
  employeeCreate: async (payload, ws) => {
    try {
      console.log(`Handling action: employeeCreate`);
      const { name = '', lastName = '', idCard = '', section = '', accessKey = '' } = payload;
      const result = await employeeService.createEmployee({ name, lastName, idCard, section, accessKey });
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
  },
  employeeGetByIdCard: async (payload, ws) => {
    try {
      console.log(`Handling action: employeeGetByIdCard`);
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
  },
  employeeDelete: async (payload, ws) => {
    try {
      console.log(`Handling action: employeeDelete`);
      const { employeeId = 0 } = payload;
      await employeeService.deleteEmployee(employeeId);
      ws.send(JSON.stringify({ action: 'employeeDelete', employeeId }));
      console.log(`Employee deleted: ${employeeId}`);
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeDelete', error: 'Error deleting employee' }));
      console.error('Error deleting employee:', error);
    }
  },
  employeeUpdate: async (payload, ws) => {
    try {
      console.log(`Handling action: employeeUpdate`);
      const { id = 0, name = '', lastName = '', idCard = '', section = '' } = payload;
      const employee = await employeeService.updateEmployee({ id, name, lastName, idCard, section });
      ws.send(JSON.stringify({ action: 'employeeUpdate', employee }));
      console.log(`Employee updated: ${employee.id}`);
    } catch (error) {
      ws.send(JSON.stringify({ action: 'employeeUpdate', error: 'Error updating employee' }));
      console.error('Error updating employee:', error);
    }
  },
  getEmployeeHistory: async (payload, ws) => {
    try {
      console.log(`Handling action: getEmployeeHistory`);
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
  },
  getAllEmployeesHistory: async (payload, ws) => {
    try {
      console.log(`Handling action: getAllEmployeesHistory`);
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
  },
  validateAccessKey: async (payload, ws) => {
    try {
      console.log(`Handling action: validateAccessKey`);
      const { idCard = '', accessKey = '' } = payload;
      const isValid = await employeeService.validateAccessKey(idCard, accessKey);
      ws.send(JSON.stringify({ action: 'validateAccessKey', isValid }));
      console.log(`Access key validation result: ${isValid}`);
    } catch (error) {
      ws.send(JSON.stringify({ action: 'validateAccessKey', error: 'Error validating access key' }));
      console.error('Error validating access key:', error);
    }
  },
};

export const handleEmployeeMessages = async (message: string, ws: WebSocket) => {
  try {
    const data: { action: string; payload: Payload } = JSON.parse(message);
    const action = data.action.trim(); 

    
    console.log(`Raw message received: ${message}`);
    console.log(`Parsed action: "${action}"`);
    console.log(`Action length: ${action.length}`);

    const handler = actionHandlers[action];
    if (handler) {
      await handler(data.payload, ws);
    } else {
      ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
      console.log(`Unrecognized action: ${action}`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    ws.send(JSON.stringify({ status: 'error', message: 'Error handling message' }));
  }
};
