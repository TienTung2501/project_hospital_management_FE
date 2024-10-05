import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { UserType } from '@/types';
import React from 'react'
interface AdminLayoutProps {
  currentUser: UserType; // Thêm prop currentUser
  children: React.ReactNode;
}
const AdminLayout = ({ currentUser, children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar/>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header/>
            {children}
        </div>
    </div>
  )
}

export default AdminLayout
