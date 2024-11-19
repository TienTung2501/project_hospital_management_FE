"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."

import React, { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Combobox } from '@/components/combobox'
import { DailyHealth, MedicalRecord, Patient, PatientCurrently , PatientServiceInfo, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { PatientSchema } from '@/schema';


const PatientReceive = () => {
  const router = useRouter(); 
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  
  const form=useForm<z.infer<typeof PatientSchema>>({
    resolver:zodResolver(PatientSchema),
    defaultValues: {
      name: "",
      cccd_number: "", // Khởi tạo giá trị mặc định cho Căn cước công dân
      gender: undefined, // Khởi tạo giá trị mặc định cho giới tính
      phone: "", // Khởi tạo giá trị mặc định cho số điện thoại
      address: "", // Khởi tạo giá trị mặc định cho địa chỉ
      health_insurance_code: "", // Khởi tạo giá trị mặc định cho chứng chỉ
      guardian_phone: "", // Khởi tạo giá trị mặc định cho chứng chỉ
    },
  });
  const handleClick = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const handleSelecLimit = (value: number | null) => {
    console.log("Selected value:", value)
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
  const handleSelectStatus = (value: number | null) => {
      setStatus(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
  }
    const handleReset = () => {
      form.reset(); // Reset form fields
      form.clearErrors(); // Clear validation errors
    };
    const onSubmit = (values: z.infer<typeof PatientSchema>) => {
      // startTransition(() => {
      //   createUser(values)
      //     .then((data) => {
      //       if (data.error) {
      //         setError(data.error);
             
      //       } else if (data.success) {
      //         setError('');
              
      //         // Hiển thị toast cho thành công
      //         toast({
      //           variant:"success",
      //           title: "Thêm thành công",
      //           description: data.success,
      //           action: <ToastAction altText="Thử lại">Ok</ToastAction>
      //         });
      //         router.push('/main/cartegory/user')
      //         // Tắt sau khi thành công
      //       }
      //     })
      // });
    };
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Chi tiết thông tin bệnh nhân đến khám</h1>
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
      
            <Card>
              <CardHeader className='pb-1'>
                <CardTitle>Tiếp nhận mới</CardTitle>
                <CardDescription>
                  Thêm thông tin tiếp nhận cho bệnh nhân
                </CardDescription>
               </CardHeader>
                <CardContent className="space-y-2">
                    <Form {...form}>
                      
                        <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 mt-4">
                          <div className="flex items-center gap-4">
                            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                              Thông tin bệnh nhân
                            </h1>
                            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-auto flex items-center gap-1 px-2" // Thêm flex và padding
                                    onClick={() => {
                                      router.back(); // Quay lại trang trước
                                    }}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className='text-sm'>Quay Lại</span>
                                  </Button>

                                    <Button variant="outline" className='text-sm' size="sm" onClick={handleReset}>
                                    Reset
                                  </Button>

                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-4 border-t'>
                  <div className="grid grid-cols-1 p-4 col-span-1">
                        <p><strong>Tên bệnh nhân:</strong> {patientData.name}</p>
                        <p><strong>Ngày sinh:</strong> {patientData.birthday}</p>
                        <p><strong>Giới tính:</strong> {patientData.gender}</p>
                        <p><strong>Điện thoại:</strong> {patientData.phone}</p>
                        <p><strong>Địa chỉ:</strong> {patientData.address}</p>
                        <p><strong>Số CCCD:</strong> {patientData.cccdNumber}</p>
                        <p><strong>Mã thẻ BHYT:</strong> {patientData.healthInsuranceCode}</p>
                        <p><strong>Điện thoại người giám hộ:</strong> {patientData.guardianPhone}</p>
                    </div>
                    <div className="grid grid-cols-1 p-4 col-span-1">
                       
                        <div><strong>Lý do khám:</strong> {medicalInfor.reason}</div>
                        {/* <div><strong>Bác sĩ khám:</strong> {medicalInfor.doctor}</div> */}
                        <div><strong>Ngày khám:</strong> {medicalInfor.admissionDate}</div>
                       
                    </div>
                    <div className="grid grid-cols-1 p-4 col-span-1">
                       
                        <div> <strong>Chỉ số sức khỏe</strong></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Nhiệt độ cơ thể:</strong> {healthRecords.temperature} <i className='pl-8'>(Độ C)</i> </div>
                          <div><strong>Huyết áp:</strong> {healthRecords.blood_pressure} <i className='pl-8'>(mmHg)</i> </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Nhịp tim:</strong> {healthRecords.heart_rate} <i className='pl-8'>(Nhịp / ph)</i> </div>
                          <div><strong>Đường huyết:</strong> {healthRecords.blood_sugar} <i className='pl-8'>(mol/l)</i> </div>
                        </div>
                        <div><strong>Ghi chú:</strong> {healthRecords.note}</div>
                       
                    </div>
                   
                </div>
                          <form onSubmit={form.handleSubmit(onSubmit)}>
                          <div className="grid grid-cols-3 auto-rows-max items-start gap-4 lg:gap-8">
                           
                              <Card x-chunk="dashboard-07-chunk-0" className="col-span-1">
                              <CardHeader>
                                  <CardTitle>Chỉ số sức khỏe</CardTitle>
                                  <CardDescription>
                                    Các chỉ số đo lường tình trạng sức khỏe
                                  </CardDescription>
                                </CardHeader>
                            
                                <CardContent>
                                  <div className="grid gap-6">
                                      <div className="grid gap-3">
                                        <div className="grid grid-cols-2 gap-2">
                                          <FormField
                                            control={form.control}
                                            name="temperature"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Nhiệt độ thân thể (Độ C)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="18"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                              
                                          <FormField
                                            control={form.control}
                                            name="blood_pressure"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Huyết áp (mmHg)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="heart_rate"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Nhịp tim (nhịp / ph)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                              
                                          <FormField
                                            control={form.control}
                                            name="blood_sugar"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Đường huyết (ml/lit)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                           
                                        </div>
                                      </div>

                                      <FormField
                                          control={form.control}
                                          name="note"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Ghi chú</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="Tình trạng tổng quan đáng báo động"
                                                  type="teratext"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
      <FormField
                                          control={form.control}
                                          name="diagnosis"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Chuẩn đoán</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="Bình thường"
                                                  type="teratext"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                  </div>
                                </CardContent>
                              </Card>
                              <Card x-chunk="dashboard-07-chunk-3"  className="col-span-2">
                                <CardHeader>
                                  <CardTitle>Chỉ định dịch vụ</CardTitle>
                                  <CardDescription>
                                    Chỉ định các dịch vụ cho bệnh nhân
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>

                                  <div className=" w-fit grid grid-cols-3 gap-2">
                                        <FormField 
                                      control={form.control}
                                      name="position"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn nhóm dịch vụ"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                                    <FormField 
                                      control={form.control}
                                      name="position"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Dịch vụ</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn dịch vụ"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField 
                                      control={form.control}
                                      name="room"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Phòng</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn Phòng"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                      
                                    <Button className='w-[100px]' size="sm">Lưu</Button>
                                  </div>
                                  <Card x-chunk="dashboard-07-chunk-3" className='mt-8 '>
                                <CardHeader className='pb-1'>
                                  
                                  <CardTitle>Danh sách các dịch vụ chỉ định</CardTitle>
                                  <CardDescription>
                                    Chỉ định các dịch vụ cho bệnh nhân
                                  </CardDescription>
                                  <div className='border-b'></div>
                                </CardHeader>
                                <CardContent >
                                <div>
                                  <DataTable
                                    data={serviceData}
                                    columns={columnServiceInfor}
                                    totalRecords={totalRecords}
                                    pageIndex={pageIndex}
                                    pageSize={limit}
                                    onPageChange={(newPageIndex) => {
                                      console.log("pageindex:", newPageIndex)
                                      setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                                    }}
                                  />
                                </div>                  
                                </CardContent>
                              </Card>
                                </CardContent>
                              
                              </Card>

                             
               
                      
                           
                          </div>
                          </form>
                        </div>
                    </Form>
                  </CardContent>

            </Card>

                  
        

       
          </div>
      </main>
  );
};

export default PatientReceive;