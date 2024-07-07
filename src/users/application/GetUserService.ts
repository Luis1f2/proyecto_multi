import { UserRepository } from '../domain/userRepositori';
import { User } from '../domain/User';

export class GetUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<User | null> {
    return await this.userRepository.getUserById(id);
  }
}
