import CustomHeader from '@/components/layout/CustomHeader';
import CustomSidebar from '@/components/layout/CustomSidebar';
import { UserType } from '@/types';
import { redirect } from 'next/navigation'; // Server-side redirection
import React from 'react';

interface CustomLayoutProps {
  currentUser: UserType; // Prop for passing user data
  children: React.ReactNode;
}

const CustomLayout = ({ currentUser, children }: CustomLayoutProps) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <CustomSidebar />
      <div className="flex flex-col">
        <CustomHeader />
        {children}
      </div>
    </div>
  );
};

export default CustomLayout;
