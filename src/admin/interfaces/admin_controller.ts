import { WebSocket } from 'ws';
import { AdminService } from '../application/admin_service';
import { SqlAdminRepository } from '../infrastructure/sql/sql_admin_repository';

const adminRepository = new SqlAdminRepository();
const adminService = new AdminService(adminRepository);

export const handleAdminMessages = async (message: string, ws: WebSocket) => {
  const data = JSON.parse(message);

  if (data.action === 'adminRegister') {
    try {
      const { name, email, password, serialNumber } = data.payload;
      const admin = await adminService.createAdmin({ name, email, password, serialNumber });
      ws.send(JSON.stringify({ action: 'adminRegister', admin }));
    } catch (error) {
      ws.send(JSON.stringify({ action: 'adminRegister', error: 'Error registering admin' }));
      console.error('Error registering admin:', error);
    }
  } else if (data.action === 'adminLogin') {
    try {
      const { email, password } = data.payload;
      const admin = await adminService.getAdminByEmail(email);
      if (admin && await adminService.verifyPassword(password, admin.password)) {
        const token = adminService.generateToken({ id: admin.id, email: admin.email });
        ws.send(JSON.stringify({ action: 'adminLogin', token }));
      } else {
        ws.send(JSON.stringify({ action: 'adminLogin', error: 'Invalid credentials' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'adminLogin', error: 'Error logging in' }));
      console.error('Error logging in:', error);
    }
  } else if (data.action === 'getAdminByEmail') {
    try {
      const { email } = data.payload;
      const admin = await adminService.getAdminByEmail(email);
      if (admin) {
        ws.send(JSON.stringify({ action: 'getAdminByEmail', admin }));
      } else {
        ws.send(JSON.stringify({ action: 'getAdminByEmail', error: 'Admin no existe' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ action: 'getAdminByEmail', error: 'Error de busqueda' }));
      console.error('Error fetching admin:', error);
    }
  } else {
    ws.send(JSON.stringify({ status: 'error', message: 'Acción no reconocida' }));
  }
};
