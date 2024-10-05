import React from 'react';
import { UserType } from '@/types';
import Customer from './Customer';

interface CustomerLayoutProps {
  currentUser: UserType; // Thêm prop currentUser
  children: React.ReactNode;
}

const CustomerLayout = ({ currentUser, children }: CustomerLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <h2>Welcome, {currentUser.email}</h2>
      {children}
      <Customer currentUser={currentUser}/>
    </div>
  );
};

export default CustomerLayout;
