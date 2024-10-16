"use client"
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import axios from 'axios';

 

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
import { DepartmentType } from '@/types';

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
 
const Department = () => {
  //data
  const [departments,setDepartments]=useState<DepartmentType[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string|BigInt; name: string } | null>(null);
  //const [items, setItems] = useState(data);

  const [editData, setEditData] = useState<{ name: string; description: string; id: string } | null>(null);
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
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
  const { reset, handleSubmit } = form;
  const handleEdit = (id: string|BigInt) => {
    // const itemToEdit = data.find((item) => item.id === id);
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
  
  const handleDelete = (id: string| BigInt) => {
    // const payment:Payment|undefined=data.find((payment) => payment.id === id);
    // const name=payment?.name;
    // if(name){

    //   setDeleteItem({ id, name}); // Save the item to be deleted
    // }
    // Logic to delete the item
  };
   // Function to confirm and delete item
   const confirmDelete = () => {
    // setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem?.id));
    // setDeleteItem(null); // Close the dialog after deletion
  };
  // Gọi createColumns
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

useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`);
      console.log(response.data.data.data);
      // Kiểm tra xem phản hồi có phải là mảng không
      if (Array.isArray(response.data.data.data)) {
        const departments: DepartmentType[] = response.data.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
        })); // Chỉ lấy các thuộc tính cần thiết
        setDepartments(departments); 
      } else {
        throw new Error('Invalid response format'); // Nếu không đúng định dạng
      }
    } catch (error) {
      setError('Error fetching departments'); // Xử lý lỗi
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDepartments();
}, []);
const columns = departments.length > 0 ? createColumns(departments, handleEdit, handleDelete) : [];
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý khoa</h1>
    </div>
    <div
      className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
    >
      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">
          Quản lý hệ thống khoa
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
          
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogContent className="sm:max-w-[425px]">
                      <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        >
                          <DialogHeader>
                          <DialogTitle>Chỉnh sửa mới Khoa</DialogTitle>
                          <DialogDescription>
                            Để chỉnh sửa  khoa, click vào lưu khi bạn hoàn thành
                          </DialogDescription>
                          </DialogHeader>
                            <FormField
                              control={form.control}
                              name="name"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Tên khoa
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Khoa nội'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Mô tả
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Khoa ngoại dùng chữa bệnh, khám bệnh cho bệnh nhân'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormError message={error}/>
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
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        >
                          <DialogHeader>
                          <DialogTitle>Thêm mới Khoa</DialogTitle>
                          <DialogDescription>
                            Để thêm mới khoa, click vào Thêm khi bạn hoàn thành
                          </DialogDescription>
                          </DialogHeader>
                            <FormField
                              control={form.control}
                              name="name"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Tên khoa
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Hà Nội'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Mô tả
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Khoa ngoại dùng chữa bệnh, khám bệnh cho bệnh nhân'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormError message={error}/>
                          <DialogFooter>
                            <Button type="submit">Thêm</Button>
                          </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Bạn đang xóa khoa:{" "}
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

              {loading ? (
          <p>Loading...</p>
        ) : (
          
          <DataTable data={departments} columns={columns} />
        )}

      
      </div>
      </div>
  </main>
  )
}

export default Department
