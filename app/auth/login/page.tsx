import LoginForm from '@/components/auth/login-form'
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import React from 'react'

const LoginPage = async () => {
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);
  return (
    <div>
      Hello, WelCome
      <p className="text-blue-600">{session?.email}</p>
      <p className="text-blue-600">{session?.role}</p>
      <p className="text-blue-600">{session?.exp}</p>
      Login page
      <LoginForm/>
    </div>
  )
}

export default LoginPage
