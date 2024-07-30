import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const processAccessRequest = async (data: any) => {
  const { idCard, action, accessKey } = data; // Asegúrate de que `action` es 'entry' o 'exit'
  const employee = await employeeService.getEmployeeByIdCard(idCard);

  if (employee) {
    // Validar la clave de acceso si se proporciona
    if (accessKey && !(await employeeService.validateAccessKey(idCard, accessKey))) {
      console.log('Acceso denegado: Clave de acceso no válida');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Reemplazar ':' y '.' para evitar problemas en la ruta del archivo

    // Registrar la entrada/salida
    await employeeService.saveHistory(employee.id, timestamp, action);

    console.log(`Acceso ${action === 'entry' ? 'concedido' : 'registrado'} a ${employee.name}`);
  } else {
    console.log('Acceso denegado: ID de tarjeta no válido');
  }
};
