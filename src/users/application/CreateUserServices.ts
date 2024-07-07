import { UserRepository } from '../domain/userRepositori';
import { User } from '../domain/User';

export class CreateUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(user: User): Promise<void> {
    await this.userRepository.addUser(user);
  }
}
