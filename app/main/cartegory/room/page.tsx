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
import { RoomSchema } from '@/schema'; // Schema cho Room
import { RoomType } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';

const roomDataList: RoomType[] = [
  {
    id: BigInt(1),
    code: 'R001',
    department_id: BigInt(1),
    room_catalogue_id: BigInt(1),
    created_at: new Date('2023-01-10'),
    updated_at: new Date('2023-01-15'),
    status: 1, // 1 - đang hoạt động
    current_bed: 0, // 0 - chưa đầy
    total_bed: 10,
  },
  {
    id: BigInt(2),
    code: 'R002',
    department_id: BigInt(2),
    room_catalogue_id: BigInt(1),
    created_at: new Date('2023-02-05'),
    updated_at: new Date('2023-02-10'),
    status: 1,
    current_bed: 1, // 1 - đầy
    total_bed: 5,
  },
  {
    id: BigInt(3),
    code: 'R003',
    department_id: BigInt(1),
    room_catalogue_id: BigInt(2),
    created_at: new Date('2023-03-20'),
    updated_at: new Date('2023-03-25'),
    status: 1,
    current_bed: 0,
    total_bed: 8,
  },
  {
    id: BigInt(4),
    code: 'R004',
    department_id: BigInt(3),
    room_catalogue_id: BigInt(2),
    created_at: new Date('2023-04-15'),
    updated_at: new Date('2023-04-20'),
    status: 0, // 0 - không hoạt động
    current_bed: 0,
    total_bed: 12,
  },
];

const departments = [
  { value: 1, label: "Khoa ngoại" },
  { value: 2, label: "Khoa nội" },
  { value: 3, label: "Khoa thần kinh" },
]
const rooms = [
  { value: 1, label: "Phòng khám 101" },
  { value: 2, label: "Phòng xét nghiệm 101" },
  { value: 3, label: "Phòng điều trị 101" },
]
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]

const RoomPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string | BigInt; code: string } | null>(null);
  const [items, setItems] = useState(roomDataList);
  const [editData, setEditData] = useState<RoomType | null>(null);
  

  const form = useForm<z.infer<typeof RoomSchema>>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      code: "",
      status: 1,
      room_catalogue_id: BigInt(0), // Thay đổi giá trị phù hợp
      department_id: BigInt(0), // Thay đổi giá trị phù hợp
      current_bed: 0,
      total_bed: 0,
    },
  });

  const { reset, handleSubmit } = form;
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const handleEdit = (id: string | BigInt) => {
    const itemToEdit = roomDataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);

      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof RoomSchema>) => {
    console.log("Updated data:", { ...editData, ...formData });
    setIsOpen(false);
  };

  const handleDelete = (id: string | BigInt) => {
    const room = items.find((room) => room.id === id);
    const code = room?.code;
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
        <h1 className="text-lg font-semibold md:text-xl">Quản lý phòng</h1>
      </div>

      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">Quản lý hệ thống phòng</h3>

        <div className="flex mt-5 justify-between">
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
                <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                <DialogDescription>
                  Để chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                {/* Thêm các trường form ở đây */}
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã phòng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã phòng" />
                    </FormControl>
                  </FormItem>
                )} />
                 <FormField 
                      control={form.control}
                      name="room_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Khoa</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={departments}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn khoa"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 <FormField 
                      control={form.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Loại phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={rooms}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn khoa"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={form.control} name="current_bed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số giường đang hoạt động</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Số giường đang hoạt động" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="total_bed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng số giường</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Số giường trong phòng" />
                    </FormControl>
                  </FormItem>
                )} />
                {/* Thêm các trường khác nếu cần */}
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
                <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                <DialogDescription>
                  Để chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                {/* Thêm các trường form ở đây */}
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã phòng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã phòng" />
                    </FormControl>
                  </FormItem>
                )} />
                 <FormField 
                      control={form.control}
                      name="room_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Khoa</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={departments}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn khoa"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 <FormField 
                      control={form.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Loại phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={rooms}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn khoa"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={form.control} name="current_bed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số giường đang hoạt động</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Số giường đang hoạt động" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="total_bed" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng số giường</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Số giường trong phòng" />
                    </FormControl>
                  </FormItem>
                )} />
                {/* Thêm các trường khác nếu cần */}
                <DialogFooter>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
              </Form>
            </DialogContent>
          </Dialog>
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

export default RoomPage;
