import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const secret = process.env.JWT_SECRET || "";

export class AuthService {
    generateToken(payload: object): string {
        return jwt.sign(payload, secret, { expiresIn: '1h' });
    }

    verifyToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, secret) as JwtPayload;
        } catch (err) {
            return null;
        }
    }

    hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
