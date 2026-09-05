import jwt from 'jsonwebtoken';
import type { AuthUser } from '../middlewares/auth.middlewares';

export async function verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET) as AuthUser
}