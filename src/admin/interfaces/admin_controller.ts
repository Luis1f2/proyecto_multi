import { AdminService } from '../application/admin_service';
import { SqlAdminRepository } from '../infrastructure/sql/sql_admin_repository';

const adminRepository = new SqlAdminRepository();
const adminService = new AdminService(adminRepository);

export const handleAdminMessages = async (message: any, ws: any) => {
    const data = JSON.parse(message);

    if (data.action === 'createAdmin') {
        try {
            const { name, email, password, serialNumber } = data.payload;
            const admin = await adminService.createAdmin({ name, email, password, serialNumber });
            ws.send(JSON.stringify({ action: 'createAdmin', admin }));
        } catch (error) {
            ws.send(JSON.stringify({ action: 'createAdmin', error: 'Error creating admin' }));
            console.error('Error creating admin:', error);
        }
    }

    if (data.action === 'getAdminByEmail') {
        try {
            const { email } = data.payload;
            const admin = await adminService.getAdminByEmail(email);
            if (admin) {
                ws.send(JSON.stringify({ action: 'getAdminByEmail', admin }));
            } else {
                ws.send(JSON.stringify({ action: 'getAdminByEmail', error: 'Admin not found' }));
            }
        } catch (error) {
            ws.send(JSON.stringify({ action: 'getAdminByEmail', error: 'Error fetching admin' }));
            console.error('Error fetching admin:', error);
        }
    }

    if (data.action === 'loginAdmin') {
        try {
            const { email, password } = data.payload;
            const admin = await adminService.getAdminByEmail(email);
            if (admin && await adminService.verifyPassword(password, admin.password)) {
                const token = adminService.generateToken({ id: admin.id, email: admin.email });
                ws.send(JSON.stringify({ action: 'loginAdmin', token }));
            } else {
                ws.send(JSON.stringify({ action: 'loginAdmin', error: 'Invalid credentials' }));
            }
        } catch (error) {
            ws.send(JSON.stringify({ action: 'loginAdmin', error: 'Error logging in' }));
            console.error('Error logging in:', error);
        }
    }
};
