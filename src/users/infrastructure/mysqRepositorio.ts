import { UserRepository } from '../domain/userRepositori';
import { User } from '../domain/User';
import { query } from '../../database/mysql';

export class MySQLUserRepository implements UserRepository {
  async addUser(user: User): Promise<void> {
    await query('INSERT INTO usuario (nombre, apellido, email, numero_serie) VALUES (?, ?, ?, ?)', [
      user.nombre, user.apellido, user.email, user.numero_serie
    ]);
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM usuario WHERE id = ?', [id]);
    if (result.length > 0) {
      const row = result[0];
      return new User(row.id, row.nombre, row.apellido, row.email, row.numero_serie);
    }
    return null;
  }

  async deleteUserById(id: number): Promise<void> {
    await query('DELETE FROM usuario WHERE id = ?', [id]);
  }
}
