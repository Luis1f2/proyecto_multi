import WebSocket, { RawData } from 'ws';
import { Signale } from 'signale';
import { MySQLUserRepository } from './mysqRepositorio';
import { CreateUserService } from '../application/CreateUserServices';
import { GetUserService } from '../application/GetUserService';
import { DeleteUserService } from '../application/DeleteUserService';
import { UserController } from './controllers/UserController';
import { User } from '../domain/User';

const signale = new Signale();
const userRepository = new MySQLUserRepository();
const createUserService = new CreateUserService(userRepository);
const getUserService = new GetUserService(userRepository);
const deleteUserService = new DeleteUserService(userRepository);
const userController = new UserController(createUserService, getUserService, deleteUserService);

// Configurar el servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  signale.info('Client connected');

  ws.on('message', async (message: RawData) => {
    const messageStr = message.toString(); // Convertir el mensaje a string
    const { action, payload } = JSON.parse(messageStr);

    switch (action) {
      case 'createUser':
        const newUser = new User(0, payload.nombre, payload.apellido, payload.email, payload.numero_serie);
        await userController.createUser(newUser);
        ws.send(`User created: ${JSON.stringify(newUser)}`);
        break;
      
      case 'getUser':
        const user = await userController.getUser(payload.id);
        ws.send(`User retrieved: ${JSON.stringify(user)}`);
        break;

      case 'deleteUser':
        await userController.deleteUser(payload.id);
        ws.send(`User deleted with ID: ${payload.id}`);
        break;

      default:
        ws.send('Unknown action');
        break;
    }
  });

  ws.on('close', () => {
    signale.info('Client disconnected');
  });
});

signale.success('WebSocket server running on port 8080');
