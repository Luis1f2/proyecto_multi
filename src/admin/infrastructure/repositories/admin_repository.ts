import { Admin } from '../../domain/admins';

export interface AdminRepository {
    save(admin: Admin): Promise<Admin>;
    findByEmail(email: string): Promise<Admin | null>;
}
