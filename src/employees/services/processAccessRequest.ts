import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';
import * as path from 'path';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const processAccessRequest = async (data: any) => {
  const { idCard, imagePath, action } = data; // Asegúrate de que `action` es 'entry' o 'exit'
  const employee = await employeeService.getEmployeeByIdCard(idCard);

  if (employee) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Reemplazar ':' y '.' para evitar problemas en la ruta del archivo
    const fullPath = path.resolve(__dirname, `../../uploads/${imagePath}`);

    // Registrar la entrada/salida
    await employeeService.saveHistory(employee.id, timestamp, fullPath, action);

    console.log(`Acceso ${action === 'entry' ? 'concedido' : 'registrado'} a ${employee.name}`);
  } else {
    console.log('Acceso denegado: ID de tarjeta no válido');
  }
};
