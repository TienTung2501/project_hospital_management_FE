import { getUser } from '@/lib/dal';
import { UserType } from '@/types';
import { redirect } from 'next/navigation';
import AdminLayout from './admin/layout';
import CustomerLayout from './customer/page';
import React from 'react';

// Server component
const Dashboard = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentUser: UserType | null = (await getUser()) ?? null;

  // Nếu không có người dùng, chuyển hướng đến trang đăng nhập
  if (!currentUser) {
    redirect("/auth/login");
  }

  // Phân biệt layout theo vai trò
  if (currentUser?.role === "admin") {
    return (
      <AdminLayout currentUser={currentUser}>
        {children}
      </AdminLayout>
    );
  }

  if (currentUser?.role === "customer") {
    return (
      <CustomerLayout currentUser={currentUser}>
        {children}
      </CustomerLayout>
    );
  }

  // Nếu không có role hợp lệ
  return null;
};

export default Dashboard;
