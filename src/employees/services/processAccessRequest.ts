import { EmployeeService } from '../application/employee_service';
import { SqlEmployeeRepository } from '../infrastructure/sql/sql_employee_repository';
import { writeFileSync } from 'fs';

const employeeRepository = new SqlEmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

export const processAccessRequest = async (data: any) => {
  const { idCard, image, action } = data; // Asegúrate de que `action` es 'entry' o 'exit'
  const employee = await employeeService.getEmployeeByIdCard(idCard);

  if (employee) {
    const timestamp = new Date().toISOString();
    const imagePath = `./uploads/${idCard}_${timestamp}.jpg`;

    // Guardar la imagen
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    writeFileSync(imagePath, base64Data, 'base64');

    // Registrar la entrada/salida
    await employeeService.saveHistory(employee.id, timestamp, imagePath, action);

    console.log(`Acceso ${action === 'entry' ? 'concedido' : 'registrado'} a ${employee.name}`);
  } else {
    console.log('Acceso denegado: ID de tarjeta no válido');
  }
};
