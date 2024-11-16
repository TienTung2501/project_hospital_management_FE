import { getUser } from '@/lib/dal'
import { UserType } from '@/types';
import React from 'react'

const HomePage = async () => {
    const currentUser: UserType | null | undefined = await getUser();
  return (
    <div className="flex justify-center items-center h-screen">
    Hello {currentUser?.name}, Welcome to Hospital System Management
  </div>
  )
}

export default HomePage
