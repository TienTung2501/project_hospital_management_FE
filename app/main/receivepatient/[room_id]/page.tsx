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
import { MedicalRecord, PatientCurrently,  UserInfoType } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';

const columnMedicalRecordHeaderMap: { [key: string]: string } = {
  patient_name: "Bệnh nhân",
  user_id: "Bác sĩ",
  visit_date: "Ngày khám",
  // Add more mappings as needed
};
const columnPartientCurrentlyHeaderMap: { [key: string]: string } = {
  patient_name: "Bệnh nhân",
  gender: "Giới tính",
  visit_date: "Ngày khám",
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
const partient_currently: PatientCurrently[] = [
  {
    id: BigInt(1),
    patient_name: "John Doe",
    gender: 1,
    visit_date: "2024-10-01 10:30:00",
  },
  {
    id: BigInt(2),
    patient_name: "Jane Smith",
    gender: 0,
    visit_date: "2024-10-05 14:45:00",

  },
  {
    id: BigInt(3),
    patient_name: "Robert Lee",
    gender: 1,
    visit_date: "2024-09-20 09:15:00",
  },
  {
    id: BigInt(4),
    patient_name: "Emily Nguyen",
    gender: 0,
    visit_date: "2024-09-25 11:00:00",

  },
  {
    id: BigInt(5),
    patient_name: "Michael Johnson",
    gender: 1,
    visit_date: "2024-10-08 16:00:00",

  },
  {
    id: BigInt(6),
    patient_name: "Sophia Brown",
    gender: 0,
    visit_date: "2024-09-29 08:30:00",
  
  },
  {
    id: BigInt(7),
    patient_name: "Daniel Garcia",
    gender: 0,
    visit_date: "2024-09-18 13:20:00",
  },
  {
    id: BigInt(8),
    patient_name: "Olivia Martinez",
    gender: 1,
    visit_date: "2024-10-10 12:00:00",
  
  },
  {
    id: BigInt(9),
    patient_name: "William Davis",
    gender: 0,
    visit_date: "2024-09-12 10:00:00",
  },
  {
    id: BigInt(10),
    patient_name: "Isabella Wilson",
    gender: 1,
    visit_date: "2024-10-15 14:00:00",
  },
];
const medicalRecords: MedicalRecord[] = [
  {
    id: BigInt(1),
    patient_id: "John Doe",
    user_id: "Dr. Sarah Johnson",
    visit_date: "2024-10-01 10:30:00",
    appointment_date: "2024-10-15",
    diagnosis: "Common Cold",
    notes: "Prescribed rest and hydration.",
    examination_status:0,
  },
  {
    id: BigInt(2),
    patient_id: "Jane Smith",
    user_id: "Dr. Michael Brown",
    visit_date: "2024-10-05 14:45:00",
    appointment_date: "2024-10-19",
    diagnosis: "Migraine",
    notes: "Recommended medication and follow-up in 2 weeks.",
    examination_status:0,
  },
  {
    id: BigInt(3),
    patient_id: "Robert Lee",
    user_id: "Dr. Emily Davis",
    visit_date: "2024-09-20 09:15:00",
    appointment_date: "2024-10-04",
    diagnosis: "High Blood Pressure",
    notes: "Adjusted medication dosage.",
    examination_status:0,
  },
  {
    id: BigInt(4),
    patient_id: "Emily Nguyen",
    user_id: "Dr. James Wilson",
    visit_date: "2024-09-25 11:00:00",
    appointment_date: null,
    diagnosis: "Asthma",
    notes: "New inhaler prescribed. Regular check-ups advised.",
    examination_status:0,
  },
  {
    id: BigInt(5),
    patient_id: "Michael Johnson",
    user_id: "Dr. Laura Martinez",
    visit_date: "2024-10-08 16:00:00",
    appointment_date: "2024-10-22",
    diagnosis: "Diabetes",
    notes: "Routine check-up, blood sugar levels stable.",
    examination_status:0,
  },
  {
    id: BigInt(6),
    patient_id: "Sophia Brown",
    user_id: "Dr. David Anderson",
    visit_date: "2024-09-29 08:30:00",
    appointment_date: null,
    diagnosis: "Allergic Rhinitis",
    notes: "Suggested antihistamines and avoiding allergens.",
    examination_status:0,
  },
  {
    id: BigInt(7),
    patient_id: "Daniel Garcia",
    user_id: "Dr. Susan Taylor",
    visit_date: "2024-09-18 13:20:00",
    appointment_date: "2024-10-02",
    diagnosis: "Gastritis",
    notes: "Advised dietary changes and medication.",
    examination_status:0,
  },
  {
    id: BigInt(8),
    patient_id: "Olivia Martinez",
    user_id: "Dr. Chris Johnson",
    visit_date: "2024-10-10 12:00:00",
    appointment_date: "2024-10-24",
    diagnosis: "Back Pain",
    notes: "Prescribed physiotherapy exercises.",
    examination_status:0,
  },
  {
    id: BigInt(9),
    patient_id: "William Davis",
    user_id: "Dr. Emma Thompson",
    visit_date: "2024-09-12 10:00:00",
    appointment_date: "2024-09-26",
    diagnosis: "Flu",
    notes: "Advised rest and antiviral medication.",
    examination_status:0,
  },
  {
    id: BigInt(10),
    patient_id: "Isabella Wilson",
    user_id: "Dr. Anthony Walker",
    visit_date: "2024-10-15 14:00:00",
    appointment_date: "2024-10-25",
    diagnosis: "Sinusitis",
    notes: "Prescribed antibiotics. Follow-up in 10 days.",
    examination_status:0,
  },
];

const AdminPage = () => {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  
  const {room_id}=useParams();
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
    const buttonColumnConfig = {
      id: 'customButton',
      header: 'Chi tiết thông tin',
      onClickConfig: (id: string | BigInt) => {
        const item = partient_currently.find((pati) => pati.id === id);
        router.push(`/main/receivepatient/detail/${item?.id}`); // Điều hướng đến trang chi tiết lần khám
      },
      content: 'Chi tiết',
    };
    const buttonColumnConfig2 = {
      id: 'customButton',
      header: 'Chi tiết thông tin',
      onClickConfig: (id: string | BigInt) => {
        const item = partient_currently.find((pati) => pati.id === id);
        router.push(`/main/medical_records/${item?.id}`); // Điều hướng đến trang chi tiết lần khám
      },
      content: 'Chi tiết',
    };
    
   
    const columnPatientCurrently = partient_currently.length > 0 ? createColumns(partient_currently,undefined, undefined, undefined,columnPartientCurrentlyHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
    const columnPatientCurrently2 = partient_currently.length > 0 ? createColumns(partient_currently,undefined, undefined, undefined,columnPartientCurrentlyHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig2 ) : [];
   // const columnMedicalRecords = medicalRecords.length > 0 ? createColumns(medicalRecords,handleView, handleEdit, handleDelete, columnPartientCurrentlyHeaderMap,{view: true, edit: false, delete: false},switchConfig ) : [];
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
         
        <Tabs defaultValue="currentlyExamining" className='w-full mt-2'>
          <TabsList className="grid w-full grid-cols-2 w-[300px]">
            <TabsTrigger value="currentlyExamining">Chờ khám</TabsTrigger>
            <TabsTrigger value="appointmentList">Chờ kết luận</TabsTrigger>
          </TabsList>

          <TabsContent value="currentlyExamining">
            <Card className='mb-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách bệnh nhân chờ khám</CardTitle>
                <CardDescription>
                  Các bệnh nhân chờ khám
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
                    <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>
                    <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
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
              <div className='flex item-center justify-center'>

                  {loading ? (
                  <p className='flex item-center justify-center'>Loading...</p>
                  ) : (

                  <DataTable
                  data={partient_currently}
                  columns={columnPatientCurrently}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                  console.log("pageindex:", newPageIndex)
                  setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                  />
                  )}


</div>
              </CardContent>  
            </Card >
          </TabsContent> 
         
          <TabsContent value="appointmentList">
            <Card>
              <CardHeader className='pb-0'>
              <CardTitle>Danh sách chờ kết luận</CardTitle>
                <CardDescription>
                  Danh sách bệnh nhân chờ kết luận
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
              <div className="flex flex-col gap-1 border-b pb-5">
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
                    <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>
                    <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
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
              <div className='flex item-center justify-center'>

              {loading ? (
          <p className='flex item-center justify-center'>Loading...</p>
        ) : (
          
            <DataTable
            data={partient_currently}
            columns={columnPatientCurrently2}
            totalRecords={totalRecords}
            pageIndex={pageIndex}
            pageSize={limit}
            onPageChange={(newPageIndex) => {
              console.log("pageindex:", newPageIndex)
              setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
            }}
        />
        )}

      
      </div>
              </CardContent>
            </Card>
         
          </TabsContent>
        </Tabs>
       
          </div>
      </main>
  );
};

export default AdminPage;