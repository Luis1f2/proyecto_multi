import { UserRepository } from '../infrastructure/repositories/user_repository';
import { User } from '../domain/user';
import { AuthService } from './auth_service';

export class UserService {
    constructor(private userRepository: UserRepository, private authService: AuthService) {}

    async createUser(userData: any): Promise<User> {
        userData.password = await this.authService.hashPassword(userData.password);
        const user = new User(userData);
        return await this.userRepository.save(user);
    }

    async loginUser(email: string, password: string): Promise<string | null> {
        const user = await this.userRepository.findByEmail(email);
        if (user && await this.authService.comparePassword(password, user.password)) {
            return this.authService.generateToken({ id: user.id, email: user.email });
        }
        return null;
    }
}
