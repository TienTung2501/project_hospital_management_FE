This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cac buoc set up du an:

## Cac buoc set up form dang nhap:

## Luong du lieu thuc hien submit dang nhap

## Cac buoc set up session:
B1: Tao secrret key:
-- Vao terminal dung lenh sau de tao secrret key: 
    -- openssl rand -base64 32 ---
    -> copy key-> vao file .env ->tao bien 
    -- SESSION_SECRET=your_secret_key
-- Tao file session.ts ben trong lib
    -- const secretKey = process.env.SESSION_SECRET
    -> sau do copy noi dung sau day vao:

    import 'server-only'
    import { SignJWT, jwtVerify } from 'jose'
    import { SessionPayload } from '@/app/lib/definitions'
    
    const secretKey = process.env.SESSION_SECRET
    const encodedKey = new TextEncoder().encode(secretKey)
    
    export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
    }
    
    export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
    }
    #pass:123456
