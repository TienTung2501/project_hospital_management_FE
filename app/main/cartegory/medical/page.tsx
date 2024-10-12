"use client";

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { Medication } from '@/types'; // Define your Medication type here
import { MedicationSchema } from '@/schema'; // Import your Medication schema
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const medicationCatalogues = [
  { value: 1, label: "Nhóm thuốc kháng sinh" },
  { value: 2, label: "Nhóm thuốc điều trị" },
  { value: 3, label: "Nhóm thuốc thực phẩm hồi phục" },
]
// Sample medication data
const medicationDataList: Medication[] = [
  {
    id: BigInt(1),
    name: 'Paracetamol',
    medicationCatalogueId: 1,
    price: 2000,
    measure: 'viên',
    measureCount: 10,
    description: 'Thuốc giảm đau và hạ sốt.',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-05'),
  },
  {
    id: BigInt(2),
    name: 'Ibuprofen',
    medicationCatalogueId: 1,
    price: 3000,
    measure: 'viên',
    measureCount: 20,
    description: 'Thuốc chống viêm, giảm đau.',
    created_at: new Date('2023-02-01'),
    updated_at: new Date('2023-02-05'),
  },
];

const MedicationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: BigInt | string; name: string } | null>(null);
  const [items, setItems] = useState<Medication[]>(medicationDataList);
  const [editData, setEditData] = useState<Medication | null>(null);

  const form = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: {
      name: "",
      medicationCatalogueId: 1,
      price: 0,
      measure: "",
      measureCount: 0,
      description: "",
    },
  });

  const { reset, handleSubmit } = form;
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const handleEdit = (id: BigInt | string) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      reset(itemToEdit); // Reset form with the data to edit
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof MedicationSchema>) => {
    if (editData) {
      const updatedItems = items.map(item =>
        item.id === editData.id ? { ...item, ...formData, updated_at: new Date() } : item
      );
      setItems(updatedItems);
      setIsOpen(false);
      reset();
      setEditData(null); // Clear the edit data
    }
  };

  const handleDelete = (id: BigInt | string) => {
    const medication = items.find((medication) => medication.id === id);
    const name = medication?.name;
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
      <h1 className="text-lg font-semibold md:text-xl">Quản lý thuốc</h1>

      <div className="flex justify-between">
      <Combobox<number>
          options={numberOptions}
          onSelect={handleSelectRecords}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />

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
          <Dialog >
          <DialogTrigger asChild>
                <Button className='ml-5'> + Thêm</Button>
              </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm thuốc</DialogTitle>
            <DialogDescription>
              Nhập thông tin thuốc và nhấn Lưu.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên thuốc" />
                  </FormControl>
                </FormItem>
              )} />

                  <FormField 
                      control={form.control}
                      name="medicationCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm thuốc</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={medicationCatalogues}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn nhóm thuốc"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="Giá thuốc" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="measure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị đo lường</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Đơn vị" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="measureCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="Số lượng" />
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
      <DataTable columns={columns} data={items} />

     
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thuốc</DialogTitle>
            <DialogDescription>
              Nhập thông tin thuốc và nhấn Lưu.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên thuốc" />
                  </FormControl>
                </FormItem>
              )} />

                    <FormField 
                      control={form.control}
                      name="medicationCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm thuốc</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={medicationCatalogues}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn nhóm thuốc"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="Giá thuốc" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="measure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị đo lường</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Đơn vị" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="measureCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="Số lượng" />
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

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thuốc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thuốc <strong>{deleteItem?.name}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default MedicationPage;
