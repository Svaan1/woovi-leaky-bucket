import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface UserPayload {
    id: string
}

export function generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function decodeToken(token?: string): UserPayload | undefined {
    return token ? jwt.verify(token, JWT_SECRET) as UserPayload : undefined;
}