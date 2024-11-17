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



const patientData = {
    id: 1,
    name: "Nguyễn Văn A",
    birthday: "1990-01-01",
    gender: "Nam",
    phone: "0123456789",
    address: "Số 1, Đường A, Quận B, Thành phố C",
    cccdNumber: "123456789012",
    healthInsuranceCode: "9876543210",
    guardianPhone: "0987654321",
    admissionDate: "2024-10-01",
    dischargeDate: null, // null nếu bệnh nhân chưa xuất viện
    createdAt: "2024-10-01",
    updatedAt: "2024-10-26",
  };

const partient_currently: Patient[] = [
  {
    id: BigInt(1),
    name: "John Doe",
    gender: 1,
    birthday: "2024-10-01 10:30:00",
    address: "Quốc Oai",
    phone: "0987654321",
    cccd_number:"0987654321",
    health_insurance_code:"0987654321",
    guardian_phone:"0987654321",
  },
  {
    id: BigInt(2),
    name: "John Doe",
    gender: 1,
    birthday: "2024-10-01 10:30:00",
    address: "Quốc Oai",
    phone: "0987654321",
    cccd_number:"0987654321",
    health_insurance_code:"0987654321",
    guardian_phone:"0987654321",
  },
  {
    id: BigInt(3),
    name: "John Doe",
    gender: 1,
    birthday: "2024-10-01 10:30:00",
    address: "Quốc Oai",
    phone: "0987654321",
    cccd_number:"0987654321",
    health_insurance_code:"0987654321",
    guardian_phone:"0987654321",
  },
  {
    id: BigInt(4),
    name: "John Doe",
    gender: 1,
    birthday: "2024-10-01 10:30:00",
    address: "Quốc Oai",
    phone: "0987654321",
    cccd_number:"0987654321",
    health_insurance_code:"0987654321",
    guardian_phone:"0987654321",
  },
  {
    id: BigInt(5),
    name: "John Doe",
    gender: 1,
    birthday: "2024-10-01 10:30:00",
    address: "Quốc Oai",
    phone: "0987654321",
    cccd_number:"0987654321",
    health_insurance_code:"0987654321",
    guardian_phone:"0987654321",
  },
 
]
const medicalInfor = 
    {
      id: 1,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
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
const columnServiceInfoHeaderMap :{ [key: string]: string } = {
    department: "Tên khoa",
    room: "Phòng",
    serviceName: "Tên dịch vụ",
    servicePrice: "Giá dịch vụ",
    // Add more mappings as needed
  };
const serviceData: PatientServiceInfo[] = [
    { id:BigInt(1), serviceName: "Khám sức khỏe định kỳ", department: "Nội tổng quát", room: "Phòng 101",  servicePrice: 500000 },
    { id:BigInt(2), serviceName: "Tiêm chủng cho trẻ em", department: "Nhi khoa", room: "Phòng 202",  servicePrice: 300000 },
    { id:BigInt(3), serviceName: "Khám thai định kỳ", department: "Sản phụ khoa", room: "Phòng 303",  servicePrice: 700000 },
    { id:BigInt(4), serviceName: "Nội soi tai mũi họng", department: "Tai mũi họng", room: "Phòng 404",  servicePrice: 400000 },
  ];
//   const healthRecords: DailyHealth =   {
//     id: BigInt(1),
//     treament_session_id: BigInt(101),
//     check_date: new Date("2024-10-29T08:30:00"),
//     temperature: 36.8,
//     blood_pressure: "120/80",
//     heart_rate: 75,
//     blood_sugar: 5.2,
//     note: "Không có triệu chứng bất thường",
//     created_at: new Date("2024-10-29T08:35:00"),
//     updated_at: new Date("2024-10-29T08:35:00"),
//   }
  const healthRecords: DailyHealth =   {
    id: BigInt(1),
    treament_session_id: BigInt(101),
    check_date: null,
    temperature: null,
    blood_pressure: null,
    heart_rate: null,
    blood_sugar: null,
    note: null,
  }


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
      gender: "male", // Khởi tạo giá trị mặc định cho giới tính
      phone: "", // Khởi tạo giá trị mặc định cho số điện thoại
      address: "", // Khởi tạo giá trị mặc định cho địa chỉ
      province_id: "", // Khởi tạo giá trị mặc định cho tỉnh/thành phố
      district_id: "", // Khởi tạo giá trị mặc định cho quận/huyện
      ward_id: "", // Khởi tạo giá trị mặc định cho phường/xã
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
  const handleEdit = (id: string|BigInt) => {
    // setError("");
    // const itemToEdit = departments.find((item) => item.id === id);
    // if (itemToEdit) {
    //   // Set edit data
    //   setEditData(itemToEdit);
    //   // Reset form with the selected item's data
    //   // Open dialog
    //    // Reset form with the selected item's data
    //   resetFormUpdate({
    //     name: itemToEdit.name,
    //     description: itemToEdit.description,
    //   });
    //   setIsOpenDialogUpdate(true);
    //   resetFormUpdate();
    // }
  };
  const handleView = (id: string | BigInt) => {
    // const department: DepartmentType | undefined = departments.find((department) => department.id === id);
    // const name = department?.name;
    // if (name) {
    //   setDeleteItem(department); // Lưu phần tử cần xóa
    // }
  };
  const handleDelete = (id: string | BigInt) => {
    // const department: DepartmentType | undefined = departments.find((department) => department.id === id);
    // const name = department?.name;
    // if (name) {
    //   setDeleteItem(department); // Lưu phần tử cần xóa
    // }
  };
  
     // Function to confirm and delete item
     const confirmDelete = async () => {
      // if (!deleteItem) return;
    
      // try {
      //   const response = await delete_department(deleteItem.id); // Gọi API để xóa phần tử từ backend
    
      //   if (response.success) {
      //     // Xóa thành công, cập nhật danh sách departments
      //     setDepartments((prevDepartments) => prevDepartments.filter((department) => department.id !== deleteItem.id));
    
      //     // Thông báo thành công
      //     toast({
      //       variant: "success",
      //       title: "Xóa thành công",
      //       description: `Khoa ${deleteItem.name} đã được xóa thành công.`,
      //       action: <ToastAction altText="Ok">Ok</ToastAction>,
      //     });
      //     fetchDepartments();
      //   } else {
      //     // Thông báo lỗi nếu có
      //     toast({
      //       variant: "destructive",
      //       title: "Lỗi khi xóa",
      //       description: response.error || "Đã xảy ra lỗi khi xóa khoa.",
      //       action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      //     });
      //   }
      // } catch (error) {
      //   console.error("Error deleting department:", error);
      //   toast({
      //     variant: "destructive",
      //     title: "Lỗi khi xóa",
      //     description: "Đã xảy ra lỗi khi xóa khoa.",
      //     action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      //   });
      // } finally {
      //   // Đóng dialog sau khi xóa hoặc có lỗi
      //   setDeleteItem(null);
      // }
    };
    const handleSwitchChange = async (id: string | BigInt, newStatus: number) => {

      // try {
      //   const result = await update_status_department(id, newStatus);
      //   if (result.error) {
      //     toast({
      //       variant: "destructive",
      //       title: "Cập nhật thất bại",
      //       description: result.error,
      //     });
      //   } else {
      //     toast({
      //       variant: "success",
      //       title: "Cập nhật thành công",
      //       description: "Trạng thái khoa đã được cập nhật.",
      //     });
    
      //     // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách departments
      //     setDepartments(prevDepartments =>
      //       prevDepartments.map(department =>
      //         department.id === id ? { ...department, status: newStatus } : department
      //       )
      //     );
      //   }
      // } catch (error) {
      //   console.error("Error updating status:", error);
      //   toast({
      //     variant: "destructive",
      //     title: "Lỗi",
      //     description: "Đã có lỗi xảy ra khi cập nhật trạng thái khoa.",
      //   });
      // } 
    };
    const switchConfig = [
      { key: "status", onStatusChange: handleSwitchChange },
    ];
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
    const columnServiceInfor = serviceData.length > 0 ? createColumns(serviceData,undefined, undefined, handleDelete, columnServiceInfoHeaderMap,{view: false, edit: false, delete: true},switchConfig ) : [];

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