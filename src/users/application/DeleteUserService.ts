import { UserRepository } from '../domain/userRepositori';

export class DeleteUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<void> {
    await this.userRepository.deleteUserById(id);
  }
}
