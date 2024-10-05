"use client";

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserType } from '@/types';
import { ToastAction } from '@radix-ui/react-toast';
import React from 'react';

interface CustomerProps {
  currentUser: UserType;
}

const Customer = ({ currentUser }: CustomerProps) => {
  const {toast}=useToast();
  const handleLogOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET', // Hoặc 'GET' nếu bạn đang sử dụng phương thức GET
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          variant:"destructive",
          title: "Logout Notification",
          description: data.message,
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
        // Redirect hoặc cập nhật state ở đây
       
      } else {
        toast({
          variant:"success",
          title: "Logout Notification",
          description: data.message,
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
        window.location.href = '/auth/login'; // Thay đổi trang đăng nhập
      }
    } catch (error) {
        toast({
          variant:"destructive",
          title: "Logout Notification",
          description: 'An error occurred while logging out',
          action: <ToastAction altText="Try again">OK</ToastAction>,
        });
    }
  };

  return (
    <div>
      Hello {currentUser!.email}
      <br />
      Your role is: <i>{currentUser!.role}</i>
      <br />
      <Button onClick={handleLogOut}>Click Here to logout</Button>
    </div>
  );
};

export default Customer;
