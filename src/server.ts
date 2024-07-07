import './users/infrastructure/WebSocketServer';
import { query } from './config/database';
import { GetUsersService } from './users/application/GetUsersService';
import { GetUsersController } from './users/infrastructure/GetUsersController';

const getUsersService = new GetUsersService();
const getUsersController = new GetUsersController(getUsersService);

(async () => {
  const result = await query('SELECT 1', []);
  console.log('Test query result:', result);
})();

console.log(getUsersController.handleRequest());
