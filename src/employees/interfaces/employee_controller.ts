import { WebSocket } from 'ws';
import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';
import mqttClient from '../../mqttclient';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const handleEmployeeMessages = async (message: string, ws: WebSocket) => {
  const data = JSON.parse(message);

  if (data.action === 'employeeCreate') {
    try {
      const { name, lastName, idCard, section } = data.payload;
      const employee = await employeeService.createEmployee({ name, lastName, idCard, section });
      ws.send(JSON.stringify({ action: 'employeeCreate', employee }));
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
  } else {
    ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
  }
};
