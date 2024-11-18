"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."

import React, { useEffect, useState, useTransition } from 'react'
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
import { MedicalRecord, Patient, PatientCurrently,  RoomType,  UserInfoType } from '@/types';
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
import axios from 'axios';
import { useUser } from '@/components/context/UserContext';

const columnPartientNotExaminedHeaderMap: { [key: string]: string } = {
  patient_name: "Bệnh nhân",
  user_id: "Bác sĩ",
  visit_date: "Ngày khám",
  // Add more mappings as needed
};

const columnPartientNotConclusionHeaderMap: { [key: string]: string } = {
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
  const [patientNotExamined, setPatientNotExamined]=useState<MedicalRecord[]>([]);
  const [patientNotConclusion, setPatientNotConclusion]=useState<MedicalRecord[]>([]);
  const [inforRoom, setInforRoom]=useState<RoomType>();
  
  const user = useUser();  // Giả sử đây là hook lấy thông tin người dùng
  let currentUser: UserInfoType | null = null;

  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }

  // Lấy user_id nếu currentUser tồn tại
  const user_id = currentUser ? currentUser.id : null;

  // Lấy room_id từ URL params
  const { room_id } = useParams<{ room_id: string }>(); // Thêm kiểu dữ liệu nếu cần thiết

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
  
    const buttonColumnConfig = {
      id: 'customButton',
      header: 'Chi tiết thông tin',
      onClickConfig: (id: string | BigInt) => {
        const item = patientNotExamined.find((pati) => pati.id === id);
        router.push(`/main/receivepatient/detail/${item?.id}`); // Điều hướng đến trang chi tiết lần khám
      },
      content: 'Chi tiết',
    };
    const buttonColumnConfig2 = {
      id: 'customButton',
      header: 'Chi tiết thông tin',
      onClickConfig: (id: string | BigInt) => {
        const item = patientNotConclusion.find((pati) => pati.id === id);
        router.push(`/main/medical_records/${item?.id}`); // Điều hướng đến trang chi tiết lần khám
      },
      content: 'Chi tiết',
    };
    const fetchRooms = async () => {
      if (!currentUser) return; // Không làm gì nếu chưa có thông tin người dùng
    
      setLoading(true); // Bắt đầu trạng thái loading
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
    
      try {
        // Gửi yêu cầu với tham số limit để lấy tất cả các phòng
        const response = await axios.get(endpoint, {
          params: { room_id:room_id },
        });
        
      const data = response?.data?.data.data[0];
       // Chuyển đổi dữ liệu API thành kiểu `RoomType`
        const infoRoom:RoomType = {
          id: data.id,
          code: data.code,
          description: data.room_catalogue?.description || "N/A", // Lấy mô tả từ room_catalogue
          status: data.status,
          room_catalogue_id: data.room_catalogue_id,
          department_id: data.department_id,
          beds_count: data.beds_count,
          status_bed: data.status_bed,
          department_name: data.department?.name || "N/A", // Lấy tên phòng ban từ department
          room_catalogue_code: data.room_catalogue?.name || "N/A", // Lấy tên mã phòng từ room_catalogue
        }
        console.log(data)
        setInforRoom(infoRoom);
      } catch (err) {
        setError("Error fetching rooms. Please try again.");
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false); // Kết thúc trạng thái loading
      }
    };
    
   
    useEffect(() => {
      const fetchMedicalRecords = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`, {
            params: {
              status: 0, // Lọc status = 0 ngay tại API (nếu API hỗ trợ)
              user_id, // Lọc theo user_id
              room_id,  // Lọc theo room_id
            },
          });
  
          const data = response?.data?.data?.data || [];
          if (!Array.isArray(data)) throw new Error("Invalid response format");
  
          // Chuyển đổi dữ liệu API thành kiểu `MedicalRecord`
          const fetchedMedicalRecord: MedicalRecord[] = data.map((item: any) => ({
            id: item.patient_id,
            patient_id: item.patient_id,
            user_id: item.user_id,
            room_id: item.room_id,
            visit_date: item.visit_date,
            diagnosis: item.diagnosis,
            notes: item.notes,
            apointment_date: item.apointment_date,
            is_inpatient: item.is_inpatient,
            inpatient_detail: item.inpatient_detail,
            status: item.status,
            patient_name: item.patient.name,
            service_ids: item.services.map((service: any) => service.id),
            service_names: item.services.map((service: any) => service.name),
          }));
  
          setPatientNotExamined(fetchedMedicalRecord);  // Cập nhật danh sách phòng phụ trách
        } catch (error) {
          console.error("Error fetching medical records:", error);
        } finally {
          setLoading(false);
        }
      };
  
      if (user_id && room_id) {
        fetchRooms();
        fetchMedicalRecords();
      }
    }, [user_id, room_id]);  // Khi user_id hoặc room_id thay đổi, gọi lại API
  
  
    if (loading) {
      return <div>Loading...</div>;
    }
   
    const columnPatientNotExamined = patientNotExamined.length > 0 ? createColumns(patientNotExamined,undefined, undefined, undefined,columnPartientNotExaminedHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
    const columnPatientNotConclusion = patientNotConclusion.length > 0 ? createColumns(patientNotConclusion,undefined, undefined, undefined,columnPartientNotConclusionHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig2 ) : [];
   // const columnMedicalRecords = medicalRecords.length > 0 ? createColumns(medicalRecords,handleView, handleEdit, handleDelete, columnPartientCurrentlyHeaderMap,{view: true, edit: false, delete: false},switchConfig ) : [];
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className=" w-full">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân</h1>
          <h1 className="text-lg font-semibold md:text-xl">Khoa: {currentUser?.department_name}</h1>
          <h1 className="text-lg font-semibold md:text-xl">Nhóm phòng khám:{inforRoom?.room_catalogue_code}</h1>
          <h2 className="text-lg font-semibold md:text-x">Phòng Khám: {inforRoom?.code}</h2>
          <h2 className="text-lg font-semibold md:text-x">Bác sĩ: {currentUser?.name}</h2>
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
                 
              </div>
              </div>
              </div>
              <div className='flex item-center justify-center'>

                  {loading ? (
                  <p className='flex item-center justify-center'>Loading...</p>
                  ) : (

                  <DataTable
                  data={patientNotExamined}
                  columns={columnPatientNotExamined}
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
              </div>
              </div>
              </div>
              <div className='flex item-center justify-center'>

              {loading ? (
          <p className='flex item-center justify-center'>Loading...</p>
        ) : (
          
            <DataTable
            data={patientNotConclusion}
            columns={columnPatientNotExamined}
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