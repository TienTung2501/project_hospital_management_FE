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
import { BedSchema } from '@/schema'; // Schema cho Bed
import { BedType } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';

// Dữ liệu giả cho giường
const bedDataList: BedType[] = [
  {
    id: BigInt(1),
    code: 'B001',
    status: 1,
    room_id: BigInt(1),
    patient_id: BigInt(1),
    price: 100,
    created_at: new Date('2023-01-10'),
    updated_at: new Date('2023-01-15'),
  },
  {
    id: BigInt(2),
    code: 'B002',
    status: 0,
    room_id: BigInt(2),
    price: 150,
    created_at: new Date('2023-02-05'),
    updated_at: new Date('2023-02-10'),
  },
  {
    id: BigInt(3),
    code: 'B003',
    status: 1,
    room_id: BigInt(1),
    patient_id: BigInt(2),
    price: 120,
    created_at: new Date('2023-01-15'),
    updated_at: new Date('2023-01-20'),
  },
  {
    id: BigInt(4),
    code: 'B004',
    status: 0,
    room_id: BigInt(3),
    price: 130,
    created_at: new Date('2023-03-01'),
    updated_at: new Date('2023-03-05'),
  },
  {
    id: BigInt(5),
    code: 'B005',
    status: 1,
    room_id: BigInt(2),
    patient_id: BigInt(3),
    price: 140,
    created_at: new Date('2023-02-15'),
    updated_at: new Date('2023-02-20'),
  },
  // Thêm nhiều dữ liệu mẫu nếu cần
];
const rooms = [
  { value: 1, label: "Phòng 1 khoa thần kinh" },
  { value: 2, label: "Phòng 1 khoa Ung biếu" },
  { value: 3, label: "Phòng 1 khoa truyền dịch" },
]
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]

const BedPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string | BigInt; code: string } | null>(null);
  const [items, setItems] = useState(bedDataList);
  const [editData, setEditData] = useState<BedType | null>(null);
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  
  const form = useForm<z.infer<typeof BedSchema>>({
    resolver: zodResolver(BedSchema),
    defaultValues: {
      code: "",
      status: 0,
      room_id: BigInt(0),
      patient_id: BigInt(0), // Thay đổi giá trị phù hợp
      price: 0,
    },
  });

  const { reset, handleSubmit } = form;

  const handleEdit = (id: string | BigInt) => {
    const itemToEdit = bedDataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof BedSchema>) => {
    console.log("Updated data:", { ...editData, ...formData });
    setIsOpen(false);
  };

  const handleDelete = (id: string | BigInt) => {
    const bed = items.find((bed) => bed.id === id);
    const code = bed?.code;
    if (code) {
      setDeleteItem({ id, code });
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
        <h1 className="text-lg font-semibold md:text-xl">Quản lý giường</h1>
      </div>

      {/* Phần thêm mới giường */}
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className='ml-5'>+ Thêm mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm giường mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin giường mới và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giường</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã giường" />
                    </FormControl>
                  </FormItem>
                )} />
                 <FormField 
                      control={form.control}
                      name="room_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={rooms}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn phòng"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá giường</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Giá giường" />
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa giường</DialogTitle>
              <DialogDescription>
                Nhập thông tin giường và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giường</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã giường" />
                    </FormControl>
                  </FormItem>
                )} />
                 <FormField 
                      control={form.control}
                      name="room_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={rooms}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn phòng"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá giường</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Giá giường" />
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
              Hành động này không thể hoàn tác. Bạn đang xóa giường:{" "}
              <strong>{deleteItem?.code}</strong>
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

export default BedPage;
