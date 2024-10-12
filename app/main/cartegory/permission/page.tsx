"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { PermissionSchema } from '@/schema'; // Schema cho Permission
import { Permission } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';

// Dữ liệu giả cho quyền
const permissionDataList: Permission[] = [
  {
    id: BigInt(1),
    name: 'Xem danh sách giường',
    keyword: 'view_beds',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-05'),
  },
  {
    id: BigInt(2),
    name: 'Thêm giường mới',
    keyword: 'add_bed',
    created_at: new Date('2023-02-01'),
    updated_at: new Date('2023-02-05'),
  },
  {
    id: BigInt(3),
    name: 'Chỉnh sửa giường',
    keyword: 'edit_bed',
    created_at: new Date('2023-03-01'),
    updated_at: new Date('2023-03-05'),
  },
  {
    id: BigInt(4),
    name: 'Xóa giường',
    keyword: 'delete_bed',
    created_at: new Date('2023-04-01'),
    updated_at: new Date('2023-04-05'),
  },
  {
    id: BigInt(5),
    name: 'Quản lý người dùng',
    keyword: 'manage_users',
    created_at: new Date('2023-05-01'),
    updated_at: new Date('2023-05-05'),
  },
];
const numberOptions = [
    { value: 10, label: "10 bản ghi" },
    { value: 20, label: "20 bản ghi" },
    { value: 40, label: "40 bản ghi" },
  ]
  
const PermissionPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string | BigInt; name: string } | null>(null);
  const [items, setItems] = useState(permissionDataList);
  const [editData, setEditData] = useState<Permission | null>(null);

  const form = useForm<z.infer<typeof PermissionSchema>>({
    resolver: zodResolver(PermissionSchema),
    defaultValues: {
      name: "",
      keyword: "",
    },
  });
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const { reset, handleSubmit } = form;

  const handleEdit = (id: string | BigInt) => {
    const itemToEdit = permissionDataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      reset(itemToEdit); // Reset form with the data to edit
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof PermissionSchema>) => {
    if (editData) {
      const updatedItems = items.map(item =>
        item.id === editData.id ? { ...item, ...formData } : item
      );
      setItems(updatedItems);
      setIsOpen(false);
    }
  };

  const handleDelete = (id: string | BigInt) => {
    const permission = items.find((permission) => permission.id === id);
    const name = permission?.name;
    if (name) {
      setDeleteItem({ id, name });
    }
  };

  const confirmDelete = () => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem?.id));
    setDeleteItem(null);
  };

  const columns = createColumns(items, handleEdit, handleDelete);

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý quyền</h1>
      
      <div className="flex justify-between">
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
      
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>+ Thêm</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm quyền</DialogTitle>
              <DialogDescription>
                Nhập thông tin quyền chỉnh sửa và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quyền</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên quyền" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Keyword" />
                    </FormControl>
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='ml-5'>+ Thêm mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm quyền mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin quyền mới và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quyền</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên quyền" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Keyword" />
                    </FormControl>
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
</div>
      {/* Hiển thị bảng danh sách quyền */}
      <div>
        <DataTable data={items} columns={columns} />
      </div>

      {/* Hộp thoại xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa quyền:{" "}
              <strong>{deleteItem?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default PermissionPage;
