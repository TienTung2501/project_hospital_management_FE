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
import { MedicalRecord, PatientCurrently, PatientPaymentInfo, ServiceInfo, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser } from '@/actions/cartegory/user/createuser';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';

// user tức nhân viên có thể là bác sĩ xét nghiệm đăng nhập vào hệ thống thì sẽ lấy ra được room Id -> sau đó lấy được các bệnh nhân được phân vào room id
// lấy các thông tin về phòng
// lấy các thông tin về dịch vụ

const columnHeaderMap: { [key: string]: string } = {
  patientName: "Tên bệnh nhân",
  gender: "Giới tính",
  birthday_date: "Tuổi",
  servicename:"Tên dịch vụ",
  phone: "Điện thoại",
  service_name:"Tên dịch vụ"
  // Add more mappings as needed
};

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const departments = [
  { value: 1, label: "Khoa ngoại" },
  { value: 2, label: "Khoa nội" },
  { value: 3, label: "Khoa thần kinh" },
]
export type PatientService={
  id:bigint;
  patientName: string;
  gender: number;
  birthday_date: number;
  phone: string;
  service_name:string;
  service_id:bigint;
}
const patientServiceData: PatientService[] = [
  {
    id:BigInt(1),
    patientName: "Nguyễn Văn A",
    gender: 1,
    birthday_date: 20,
    phone: "0987654321",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(1),
  },
  {
    id:BigInt(2),
    patientName: "Trần Thị B",
    gender: 0,
    birthday_date: 20,
    phone: "0987654321",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(2),
    
  },
  {
    id:BigInt(3),
    patientName: "Lê Văn C",
    gender: 1,
    birthday_date: 20,
    phone: "0901234567",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(3),
  },
  {
    id:BigInt(4),
    patientName: "Hoàng Thị D",
    gender: 0,
    birthday_date: 20,
    phone: "0934567890",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(4),
  },
  {
    id:BigInt(5),
    patientName: "Phạm Văn E",
    gender: 1,
    birthday_date: 20,
    phone: "0967890123",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(5),
  },
  // Thêm 5 bộ dữ liệu nữa
];

const PaymentPage = () => {
  const router = useRouter(); 
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  const [item, setItem] = useState<PatientService | null>(null);
  

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

  // Cấu hình cho cột nút
  const buttonColumnConfig = {
    id: 'customButton',
    header: 'Xét nghiệm',
    onClickConfig: (id: string | BigInt) => {
      // Điều hướng đến trang chi tiết cho bệnh nhân
      const item: PatientService | undefined = patientServiceData.find(patient => patient.id === id);
      router.push(`/main/services/${item?.service_id}/${id}`);
    },
    content: 'Thực thi',
  };
  const column = patientServiceData.length > 0 
  ? createColumns(patientServiceData,
    undefined, // onView
    undefined, // onEdit
    undefined, // onDelete
    columnHeaderMap, // Cấu hình tiêu đề cột
    undefined, // actionButtonsConfig
    undefined, // switchConfig
    buttonColumnConfig, // Cấu hình cho cột nút) 
  ): [];

    
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Khoa Xét nghiệm</h1>
          <h2 className="text-lg font-semibold md:text-x">Phòng xét nghiệm 302</h2>
          <h2 className="text-lg font-semibold md:text-x">Bác sĩ: Nguyên Văn A</h2>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách các bệnh nhân chờ xét nghiệm</CardTitle>
                <CardDescription>
                  Các bệnh nhân đang chờ xét nghiệm của phòng xét nghiệm 302 khoa Xét nghiệm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className='flex mt-5 justify-between'>

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
                   
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={patientServiceData}
                  columns={column}
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
            </Card >
          </div>
      </main>
  );
};

export default PaymentPage;