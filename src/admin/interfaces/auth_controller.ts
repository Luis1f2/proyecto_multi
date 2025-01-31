import { AdminRepository } from '../infrastructure/repositories/admin_repository';
import { Admin } from '../domain/admins';
import bcrypt from 'bcrypt';

export class AdminService {
    constructor(private adminRepository: AdminRepository) {}

    async createAdmin(adminData: any): Promise<Admin> {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const admin = new Admin({
            ...adminData,
            password: hashedPassword
        });
        return await this.adminRepository.save(admin);
    }

    async getAdminByEmail(email: string): Promise<Admin | null> {
        return await this.adminRepository.findByEmail(email);
    }
}
