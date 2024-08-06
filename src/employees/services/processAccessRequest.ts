import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const processAccessRequest = async (data: any) => {
  try {
    // Desestructuración de 'action' y 'payload' del objeto 'data'
    const { action, payload } = data;
    const { idCard, accessKey } = payload;

    // Verificación de que todos los campos necesarios están presentes
    if (!idCard || !accessKey || !action) {
      console.log('Error: Faltan campos necesarios en la solicitud.');
      return; 
    }

    // Búsqueda del empleado por su ID de tarjeta
    const employee = await employeeService.getEmployeeByIdCard(idCard);

    if (employee) {
      // Validación de la clave de acceso
      const isValidAccessKey = await employeeService.validateAccessKey(idCard, accessKey);
      if (!isValidAccessKey) {
        console.log('Acceso denegado: Clave de acceso no válida');
        return; 
      }

      // Registro de la acción de acceso (entrada o salida)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); 
      await employeeService.saveHistory(employee.id, timestamp, action);
      console.log(`Acceso ${action === 'entry' ? 'concedido' : 'registrado'} a ${employee.name}`);
    } else {
      console.log('Acceso denegado: ID de tarjeta no válido');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud de acceso:', error);
  }
};
