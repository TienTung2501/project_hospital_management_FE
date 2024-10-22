"use client"; 
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'

 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { useTransition } from 'react';
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { CreateDepartmentSchema} from '@/schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"



import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/form-error';
import { ToastAction } from '@radix-ui/react-toast';

import  {Combobox}  from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/data-table'
import createColumns from '@/components/column-custom'
import { create_department } from '@/actions/cartegory/department/createdepartment';
import { UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const columnHeaderMap: { [key: string]: string } = {
  name: "Tên bệnh nhân",
  email: "Địa chỉ email",
  address: "Địa chỉ",
  phone: "Điện thoại",
  cccd: "CCCD",
  certificate: "Chứng chỉ",
  examination_status:"Tình trạng khám",
  gender:"Giới tính",
  status:"Tình trạng",
  position_id:"Chức danh",
  department_id:"Khoa",
  // Add more mappings as needed
};
const userData: UserInfoType[] = [
  {
    id: BigInt(1),
    name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    password: "password123",
    ward_id: "W001",
    district_id: "D001",
    province_id: "P001",
    address: "123 Đường Lê Lợi",
    phone: "0901234567",
    cccd: "0123456789",
    certificate: "Chứng chỉ bác sĩ",
    gender: 1,
    status: true,
    created_at: new Date("2023-01-01T08:00:00Z"),
    updated_at: new Date("2023-10-01T08:00:00Z"),
    position_id: BigInt(1),
    department_id: BigInt(1),
  },
  {
    id: BigInt(2),
    name: "Tran Thi B",
    email: "tranthib@example.com",
    password: "password456",
    ward_id: "W002",
    district_id: "D002",
    province_id: "P002",
    address: "456 Đường Phạm Văn Đồng",
    phone: "0902345678",
    cccd: "0987654321",
    certificate: "Chứng chỉ kế toán",
    gender: 2,
    status: true,
    created_at: new Date("2023-02-15T08:00:00Z"),
    updated_at: new Date("2023-09-15T08:00:00Z"),
    position_id: BigInt(2),
    department_id: BigInt(2),
  },
  {
    id: BigInt(3),
    name: "Le Thi C",
    email: "lethic@example.com",
    password: "password789",
    ward_id: "W003",
    district_id: "D003",
    province_id: "P003",
    address: "789 Đường Nguyễn Trãi",
    phone: "0903456789",
    cccd: "1234567890",
    certificate: "Chứng chỉ giáo viên",
    gender: 2,
    status: true,
    created_at: new Date("2023-03-20T08:00:00Z"),
    updated_at: new Date("2023-07-20T08:00:00Z"),
    position_id: BigInt(3),
    department_id: BigInt(3),
  },
  {
    id: BigInt(4),
    name: "Phan Quoc D",
    email: "phanquocd@example.com",
    password: "password101",
    ward_id: "W004",
    district_id: "D004",
    province_id: "P004",
    address: "101 Đường Láng Hạ",
    phone: "0904567890",
    cccd: "2345678901",
    certificate: "Chứng chỉ kỹ sư",
    gender: 1,
    status: true,
    created_at: new Date("2023-04-25T08:00:00Z"),
    updated_at: new Date("2023-08-25T08:00:00Z"),
    position_id: BigInt(4),
    department_id: BigInt(4),
  },
  {
    id: BigInt(5),
    name: "Hoang Minh E",
    email: "hoangminhe@example.com",
    password: "password111",
    ward_id: "W005",
    district_id: "D005",
    province_id: "P005",
    address: "505 Đường Hoàng Quốc Việt",
    phone: "0905678901",
    cccd: "3456789012",
    certificate: "Chứng chỉ luật sư",
    gender: 1,
    status: true,
    created_at: new Date("2023-05-30T08:00:00Z"),
    updated_at: new Date("2023-09-30T08:00:00Z"),
    position_id: BigInt(5),
    department_id: BigInt(5),
  },
];

 

const UserInfor = () => {
  const router = useRouter(); 
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  const [items, setItems] = useState(userData);

  const [editData, setEditData] = useState<UserInfoType | null>(null);
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const [isPending,startTransition]=useTransition();
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  
  const form=useForm<z.infer<typeof CreateDepartmentSchema>>({
    resolver:zodResolver(CreateDepartmentSchema),
    defaultValues:{
      name:"",
      description:"",
    },
  });
  
  const handleClick = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
  const { reset, handleSubmit } = form;
  const handleEdit = (id: string|BigInt) => {
    // const itemToEdit = userData.find((item) => item.id === id);
    // if (itemToEdit) {
    //   // Set edit data
    //   setEditData(itemToEdit);
    //   // Reset form with the selected item's data
    //   reset({
    //     name: itemToEdit.name,
    //     description: itemToEdit.description || "",
    //   });
    //   // Open dialog
    //   setIsOpen(true);
    // }
  };
  const onSubmitEdit = (formData: { email: string; description: string }) => {
    // Xử lý logic cập nhật tại đây
    console.log("Updated data:", { ...editData, ...formData });
    setIsOpen(false); // Đóng dialog sau khi cập nhật
};
  
  const handleDelete = (id: string|BigInt) => {
    // const position:UserInfoType|undefined=data.find((position) => position.id === id);
    // const name=position?.name;
    // if(name){

    //   setDeleteItem({ id, name}); // Save the item to be deleted
    // }
    // Logic to delete the item
  };
   // Function to confirm and delete item
   const confirmDelete = () => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem?.id));
    setDeleteItem(null); // Close the dialog after deletion
  };
  const handleView = (id: string | BigInt) => {
    // const department: DepartmentType | undefined = departments.find((department) => department.id === id);
    // const name = department?.name;
    // if (name) {
    //   setDeleteItem(department); // Lưu phần tử cần xóa
    // }
  };
  const handleSwitchChange = async (id: string | BigInt, newStatus: number) => {

    // try {
    //   const result = await update_status_department(id, newStatus);
    //   if (result.error) {
    //     toast({
    //       variant: "destructive",
    //       title: "Cập nhật thất bại",
    //       description: result.error,
    //     });
    //   } else {
    //     toast({
    //       variant: "success",
    //       title: "Cập nhật thành công",
    //       description: "Trạng thái khoa đã được cập nhật.",
    //     });
  
    //     // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách departments
    //     setDepartments(prevDepartments =>
    //       prevDepartments.map(department =>
    //         department.id === id ? { ...department, status: newStatus } : department
    //       )
    //     );
    //   }
    // } catch (error) {
    //   console.error("Error updating status:", error);
    //   toast({
    //     variant: "destructive",
    //     title: "Lỗi",
    //     description: "Đã có lỗi xảy ra khi cập nhật trạng thái khoa.",
    //   });
    // } 
  };
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = userData.length > 0 ? createColumns(userData,handleView, handleEdit, handleDelete, columnHeaderMap,{view: true, edit: true, delete: true},switchConfig ) : [];
  // // Gọi createColumns
 
  
  const onSubmit = (values: z.infer<typeof CreateDepartmentSchema>) => {
    startTransition(() => {
      create_department(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
           
          } else if (data.success) {
            setError('');
            form.reset();
            // Hiển thị toast cho thành công
            toast({
              variant:"success",
              title: "Thêm thành công",
              description: data.success,
              action: <ToastAction altText="Thử lại">Ok</ToastAction>
            });
            // Tắt sau khi thành công
          }
        })
    });
  };
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý Người dùng</h1>
    </div>
    <div
      className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
    >
      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">
          Quản lý hệ thống Người dùng
        </h3>

        <div className='flex mt-5 justify-between'>
{/* Phần bên trái */}
          <Combobox<number>
          options={numberOptions}
          onSelect={handleSelectRecords}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />

        {/* Phần bên phải */}
        <div className="flex items-center space-x-5">
          <div className='flex'>
            <Combobox<number>
              options={numberOptions}
              onSelect={handleSelectRecords}
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
          <div className="flex items-center space-x-2 bg-white">
            <Input type="text" placeholder="Tìm kiếm" />
            <Button type="submit">Lọc</Button>
          </div>
                <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>

                <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
                      <strong>{deleteItem?.name}</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
        </div>
      </div>
      <div>
      <DataTable 
      data={userData} 
      columns={columns} 
      totalRecords={totalRecords}
      pageIndex={pageIndex}
      pageSize={limit}
      onPageChange={(newPageIndex) => {
        console.log("pageindex:", newPageIndex)
        setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
      }}
      
      />

      </div>
      </div>
  </main>
  )
}

export default UserInfor
