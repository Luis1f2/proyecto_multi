import { AuthService } from '../application/auth_service';
import { UserService } from '../application/user_service';
import { SqlUserRepository } from '../infrastructure/sql/sql_user_repository';

const userRepository = new SqlUserRepository();
const authService = new AuthService();
const userService = new UserService(userRepository, authService);

export const handleAuthMessages = async (message: any, ws: any) => {
    const data = JSON.parse(message);

    if (data.action === 'register') {
        const { name, email, password, serialNumber } = data;
        const user = await userService.createUser({ name, email, password, serialNumber });
        ws.send(JSON.stringify({ action: 'register', user }));
    }

    if (data.action === 'login') {
        const { email, password } = data;
        const token = await userService.loginUser(email, password);
        if (token) {
            ws.send(JSON.stringify({ action: 'login', token }));
        } else {
            ws.send(JSON.stringify({ action: 'login', error: 'Invalid credentials' }));
        }
    }
};

