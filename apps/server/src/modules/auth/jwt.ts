import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';


interface TokenPayload {
    userId: string
}

export function generateToken(userId: string): string {
    const payload: TokenPayload = {
        userId: userId
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function decodeToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
}