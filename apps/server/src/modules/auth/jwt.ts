import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface TokenPayload {
    userId: string
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function decodeToken(token?: string): TokenPayload | undefined {
    return token ? jwt.verify(token, JWT_SECRET) as TokenPayload : undefined;
}