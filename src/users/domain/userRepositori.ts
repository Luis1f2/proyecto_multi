import { User } from './User';

export interface UserRepository {
  addUser(user: User): Promise<void>;
  getUserById(id: number): Promise<User | null>;
  deleteUserById(id: number): Promise<void>;
}
