"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { useTransition } from 'react';
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogTrigger,
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
import { RoomCatalogueSchema } from '@/schema';
import { RoomCatalogue } from '@/types';
const roomCatalogueDataList: RoomCatalogue[] = [
  {
    id: BigInt(1),
    keyword: 'NOITRU',
    name: 'Phòng nội trú',
    description: 'Khu vực dành cho bệnh nhân nội trú',
    status: 1 as 1 | 0, // Xác định rõ kiểu là 1 | 0
    created_at: new Date('2023-01-10'),
    updated_at: new Date('2023-01-15'),
  },
  {
    id: BigInt(2),
    keyword: 'CAPCUU',
    name: 'Phòng cấp cứu',
    description: 'Phòng xử lý các trường hợp khẩn cấp',
    status: 1 as 1 | 0,
    created_at: new Date('2023-02-05'),
    updated_at: new Date('2023-02-10'),
  },
  {
    id: BigInt(3),
    keyword: 'XETNGHIEM',
    name: 'Phòng xét nghiệm',
    description: 'Khu vực xét nghiệm các mẫu sinh học',
    status: 1 as 1 | 0,
    created_at: new Date('2023-03-12'),
    updated_at: new Date('2023-03-18'),
  },
  {
    id: BigInt(4),
    keyword: 'NHI',
    name: 'Phòng nhi',
    description: 'Khu vực dành cho bệnh nhân nhi',
    status: 0 as 1 | 0,
    created_at: new Date('2022-12-22'),
    updated_at: new Date('2023-01-05'),
  },
  {
    id: BigInt(5),
    keyword: 'PHUKHOA',
    name: 'Phòng phụ khoa',
    description: 'Chuyên xử lý các bệnh liên quan đến phụ nữ',
    status: 1 as 1 | 0,
    created_at: new Date('2023-04-01'),
    updated_at: new Date('2023-04-07'),
  },
];

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const RoomCataloguePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string|BigInt; name: string } | null>(null);
  const [items, setItems] = useState(roomCatalogueDataList);
  const [editData, setEditData] = useState<RoomCatalogue | null>(null);
  const [error, setError] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof RoomCatalogueSchema>>({
    resolver: zodResolver(RoomCatalogueSchema),
    defaultValues: {
      keyword:"",
      name: "",
      description: "",
      status: 0,
    },
  });
    const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }

  const { reset, handleSubmit } = form;

  const handleEdit = (id: string|BigInt) => {
    const itemToEdit = roomCatalogueDataList.find((item) => item.id === id);
    if (itemToEdit) {
      // Set edit data
      setEditData(itemToEdit);
      // Reset form with the selected item's data
      reset({
        name: itemToEdit.name,
        keyword: itemToEdit.keyword,
        description: itemToEdit.description || "",
      });
      // Open dialog
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof RoomCatalogueSchema>) => {
    console.log("Updated data:", { ...editData, ...formData });
    setIsOpen(false);
  };

  const handleDelete = (id: string|BigInt) => {
    const room = items.find((room) => room.id === id);
    const name = room?.name;
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
      <div className="flex w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý danh mục phòng</h1>
      </div>

      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">Quản lý hệ thống phòng</h3>
        
        <div className="flex mt-5 justify-between">
        <Combobox<number>
          options={numberOptions}
          onSelect={handleSelectRecords}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />
          {/* Bộ lọc và tìm kiếm */}
          <div className="flex items-center space-x-5">
          <div className='flex'>
            <Combobox<number>
              options={numberOptions}
              onSelect={handleSelectRecords}
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
          <div className="flex items-center space-x-2 bg-white">
            <Input type="text" placeholder="Tìm kiếm phòng" />
            <Button type="submit">Lọc</Button>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                    <DialogDescription>
                      Để Chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành
                    </DialogDescription>
                  </DialogHeader>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên phòng</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tên phòng" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keyword</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Example: NOITRU" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mô tả về phòng" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormError message={error} />
                  <DialogFooter>
                    <Button type="submit">Lưu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog >
          <DialogTrigger asChild>
                  <Button className='ml-5'>+ Thêm mới</Button>
                  </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                    <DialogDescription>
                      Để Chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành
                    </DialogDescription>
                  </DialogHeader>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên phòng</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tên phòng" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keyword phòng</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Example: NOITRU" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mô tả về phòng" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormError message={error} />
                  <DialogFooter>
                    <Button type="submit">Lưu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Nút thêm mới */}
        </div>
      </div>
      </div>
      {/* Hiển thị bảng danh sách */}
      <div>
        <DataTable data={items} columns={columns} />
      </div>

      {/* Hộp thoại xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa phòng:{" "}
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

export default RoomCataloguePage;
