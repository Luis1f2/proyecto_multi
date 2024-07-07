import { CreateUserService } from '../../application/CreateUserServices';
import { GetUserService } from '../../application/GetUserService';
import { DeleteUserService } from '../../application/DeleteUserService';
import { User } from '../../domain/User';

export class UserController {
  constructor(
    private createUserService: CreateUserService,
    private getUserService: GetUserService,
    private deleteUserService: DeleteUserService
  ) {}

  async createUser(user: User): Promise<void> {
    await this.createUserService.execute(user);
  }

  async getUser(id: number): Promise<User | null> {
    return await this.getUserService.execute(id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.deleteUserService.execute(id);
  }
}
