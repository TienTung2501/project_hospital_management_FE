import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getUser } from '@/lib/dal';
import { getLinkByRole } from '@/lib/Data/link/link';
import { getUserByEmail } from '@/lib/Data/user/user';
import { decrypt } from '@/lib/session';
import { LinkBaseRoleType, UserType } from '@/types';
import { get } from 'http';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // For server-side redirection
import React from 'react';

interface AdminLayoutProps {
  //currentUser: UserType; // Prop for passing user data
  children: React.ReactNode;
}

const AdminLayout = async ({  children }: AdminLayoutProps) => {
  const currentUser: UserType | null | undefined = await getUser();
  let links:LinkBaseRoleType| null | undefined;
  if(currentUser){
    links=await getLinkByRole(currentUser?.role);
  }
  return (
     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar links={links}/>
        <div className="flex flex-col w-full overflow-x-hidden">
          <AdminHeader links={links}/>
          {children}
        </div>
  </div>
  );
};

export default AdminLayout;
