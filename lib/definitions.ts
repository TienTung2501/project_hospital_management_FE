// lib/definitions.ts
import { JWTPayload } from 'jose';
export interface SessionPayload extends JWTPayload{
  email: string;
  role: string; // Ví dụ: 'admin', 'user', v.v.
  iat?: number; // issued at
  exp?: number; // expiration time
}
