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
import { ServiceCatalogueSchema } from '@/schema'; // Schema cho ServiceCatalogue
import { ServiceCatalogue } from '@/types'; // Định nghĩa kiểu ServiceCatalogue
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';

// Dữ liệu giả cho danh mục dịch vụ
const serviceCatalogueDataList: ServiceCatalogue[] = [
  {
    id: BigInt(1),
    name: 'Dịch vụ xét nghiệm',
    description: 'Bao gồm các dịch vụ xét nghiệm y tế.',
    status: 1,
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-05'),
  },
  {
    id: BigInt(2),
    name: 'Phẫu thuật',
    description: 'Các dịch vụ phẫu thuật y tế.',
    status: 1,
    created_at: new Date('2023-02-01'),
    updated_at: new Date('2023-02-05'),
  },
  // Thêm các đối tượng khác nếu cần
];
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const ServiceCataloguePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string | BigInt; name: string } | null>(null);
  const [items, setItems] = useState(serviceCatalogueDataList);
  const [editData, setEditData] = useState<ServiceCatalogue | null>(null);

  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const form = useForm<z.infer<typeof ServiceCatalogueSchema>>({
    resolver: zodResolver(ServiceCatalogueSchema),
    defaultValues: {
      name: "",
      description: "",
      status: 1,
    },
  });
  
  const { reset, handleSubmit } = form;

  const handleEdit = (id: string | BigInt) => {
    const itemToEdit = serviceCatalogueDataList.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      reset(itemToEdit); // Reset form with the data to edit
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof ServiceCatalogueSchema>) => {
    if (editData) {
      const updatedItems = items.map(item =>
        item.id === editData.id ? { ...item, ...formData } : item
      );
     // setItems(updatedItems);
      setIsOpen(false);
    }
  };

  const handleDelete = (id: string | BigInt) => {
    const serviceCatalogue = items.find((catalogue) => catalogue.id === id);
    const name = serviceCatalogue?.name;
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
      <h1 className="text-lg font-semibold md:text-xl">Quản lý danh mục dịch vụ</h1>
      
      <div className="flex justify-between">
        <Combobox<number>
          options={numberOptions}
          onSelect={handleSelectRecords}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />
        <div className="flex items-center space-x-5">

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
              <DialogTitle>Thêm danh mục dịch vụ</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục dịch vụ và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục dịch vụ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên danh mục dịch vụ" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mô tả" />
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

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục dịch vụ</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục dịch vụ và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục dịch vụ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên danh mục dịch vụ" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mô tả" />
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
      {/* Hiển thị bảng danh sách danh mục dịch vụ */}
      <div>
        <DataTable data={items} columns={columns} />
      </div>

      {/* Hộp thoại xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa danh mục dịch vụ:{" "}
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

export default ServiceCataloguePage;
