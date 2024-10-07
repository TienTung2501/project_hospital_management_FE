import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { UserType } from '@/types';
import { redirect } from 'next/navigation'; // For server-side redirection
import React from 'react';

interface AdminLayoutProps {
  currentUser: UserType; // Prop for passing user data
  children: React.ReactNode;
}

const AdminLayout = ({ currentUser, children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
