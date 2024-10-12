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
import { Service } from '@/types'; // Định nghĩa kiểu Service
import { ServiceSchema } from '@/schema'; // Schema cho Service
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';

// Dữ liệu giả cho danh sách dịch vụ
const rooms = [
  { value: 1, label: "Phòng 1 khoa thần kinh" },
  { value: 2, label: "Phòng 1 khoa Ung biếu" },
  { value: 3, label: "Phòng 1 khoa truyền dịch" },
]
const serviceDataList: Service[] = [
  {
    id: BigInt(1),
    name: 'Xét nghiệm máu',
    description: 'Xét nghiệm để kiểm tra các chỉ số máu.',
    price: 150000,
    serviceCatalogueId: BigInt(1),
    status: 1,
    detail: 'Thông tin chi tiết về xét nghiệm máu.',
    healthInsuranceApplied: 1,
    healthInsuranceValue: 10,
    roomCatalogueId: BigInt(1),
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-05'),
  },
  {
    id: BigInt(2),
    name: 'Phẫu thuật ruột thừa',
    description: 'Phẫu thuật để loại bỏ ruột thừa.',
    price: 3000000,
    serviceCatalogueId: BigInt(2),
    status: 1,
    detail: 'Thông tin chi tiết về phẫu thuật ruột thừa.',
    healthInsuranceApplied: 1,
    healthInsuranceValue: 20,
    roomCatalogueId: BigInt(2),
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

const serviceCatalogues = [
  { value: 1, label: "Xét nghiệm" },
  { value: 2, label: "Chụp cổng hưởng" },
  { value: 3, label: "Lấy máu" },
]

const ServicePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string | BigInt; name: string } | null>(null);
  const [items, setItems] = useState(serviceDataList);
  const [editData, setEditData] = useState<Service | null>(null);

  const form = useForm<z.infer<typeof ServiceSchema>>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      serviceCatalogueId: BigInt(1),
      status: 1,
      detail: "",
      healthInsuranceApplied: 0,
      healthInsuranceValue: 0,
      roomCatalogueId: BigInt(1),
    },
  });

  const { reset, handleSubmit } = form;

  const handleEdit = (id: string | BigInt) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      reset(itemToEdit); // Reset form with the data to edit
      setIsOpen(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof ServiceSchema>) => {
    if (editData) {
      const updatedItems = items.map(item =>
        item.id === editData.id ? { ...item, ...formData } : item
      );
      setItems(updatedItems);
      setIsOpen(false);
    }
  };

  const handleDelete = (id: string | BigInt) => {
    const service = items.find((service) => service.id === id);
    const name = service?.name;
    if (name) {
      setDeleteItem({ id, name });
    }
  };
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const confirmDelete = () => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem?.id));
    setDeleteItem(null);
  };

  const columns = createColumns(items, handleEdit, handleDelete);

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý dịch vụ</h1>
      
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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className='ml-5'> Chỉnh sửa</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin dịch vụ và nhấn Lưu.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên dịch vụ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tên dịch vụ" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField 
                      control={form.control}
                      name="serviceCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={serviceCatalogues}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn phòng"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField 
                      control={form.control}
                      name="roomCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm nhóm phòng</FormLabel>
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

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mô tả" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá dịch vụ</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Giá dịch vụ" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="healthInsuranceValue" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị bảo hiểm sức khỏe</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Giá trị bảo hiểm" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="detail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thông tin chi tiết</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Thông tin chi tiết" />
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
              <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Thêm dịch vụ</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin dịch vụ và nhấn Lưu.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên dịch vụ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tên dịch vụ" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField 
                      control={form.control}
                      name="serviceCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={serviceCatalogues}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn phòng"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField 
                      control={form.control}
                      name="roomCatalogueId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm nhóm phòng</FormLabel>
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

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mô tả" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá dịch vụ</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Giá dịch vụ" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField
                      control={form.control}
                      name="healthInsuranceApplied"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Áp dụng bảo hiểm y tế</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  value="1"
                                  checked={field.value === 1}
                                  onChange={() => field.onChange(1)}
                                />
                                <span>Có</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  value="0"
                                  checked={field.value === 0}
                                  onChange={() => field.onChange(0)}
                                />
                                <span>Không</span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField control={form.control} name="healthInsuranceValue" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị bảo hiểm sức khỏe</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="Giá trị bảo hiểm" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="detail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thông tin chi tiết</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Thông tin chi tiết" />
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
      {/* Hiển thị bảng danh sách dịch vụ */}
      <div>
        <DataTable data={items} columns={columns} />
      </div>

      {/* Hộp thoại xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa dịch vụ:{" "}
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

export default ServicePage;
