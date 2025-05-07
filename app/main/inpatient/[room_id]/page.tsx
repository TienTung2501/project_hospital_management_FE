"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."
import React, { useEffect, useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Combobox } from '@/components/combobox'
import { MedicalRecord, Patient, PatientCurrently,  RoomType,  TreatmentSessionInpatient,  UserInfoType } from '@/types';
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
  bed_code:"Giường",
  visit_date:"Ngày đến khám",
  start_date:"Ngày bắt đầu điều trị",
  end_date:"Ngày kết thúc điều trị",
  diagnosis:"Chuẩn đoán",
  notes:"Ghi chú của bác sĩ khám",
  conclusion_of_treatment:"Kết luận điều trị",
  status_treatment_session:"Trạng thái",
  // Add more mappings as needed
};

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]



const InpatientPage = () => {
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
  const [inpatient, setInpatient]=useState<TreatmentSessionInpatient[]>([]);
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
  const { room_id } = useParams(); // Thêm kiểu dữ liệu nếu cần thiết
  const handleClick = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
  const handleSelectRecords = (value: number | null) => {
  }
  const handleSelecLimit = (value: number | null) => {
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
  
    const buttonColumnConfig = {
      id: 'customButton',
      header: 'Chi tiết thông tin',
      onClickConfig: (id: string | BigInt) => {
        const item = inpatient.find((pati) => pati.id === id);
        router.push(`/main/inpatient/detail/${item?.medical_record_id}`); // Điều hướng đến trang chi tiết lần khám
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
          params: { limit: 1000 } // Truyền tham số limit vào đây
        });
    
        const data = response?.data?.data?.data; // Lấy mảng dữ liệu
        if (Array.isArray(data)) {
          // Thay `room_id` bằng giá trị ID bạn muốn tìm
          const roomData = data.find((item) => Number(item.id) === Number(room_id)); // Tìm phòng có `id` phù hợp
    
          if (roomData) {
            // Chuyển đổi roomData thành kiểu RoomType
            const infoRoom: RoomType = {
              id: roomData.id,
              code: roomData.code,
              description: roomData.room_catalogues?.description || "N/A", // Lấy mô tả từ room_catalogue
              status: roomData.status,
              room_catalogue_id: roomData.room_catalogue_id,
              department_id: roomData.department_id,
              beds_count: roomData.total_beds,
              occupied_beds:roomData.occupied_beds,
              status_bed: roomData.status_bed,
              department_name: roomData.departments?.name || "N/A", // Lấy tên phòng ban từ department
              room_catalogue_code: roomData.room_catalogues?.name || "N/A", // Lấy tên mã phòng từ room_catalogue
            };
            setInforRoom(infoRoom);
          } else {
            console.error(`Không tìm thấy phòng với ID: ${room_id}`);
            setInforRoom(undefined); // Nếu không tìm thấy, đặt giá trị null
          }
        } else {
          console.error("Dữ liệu không phải là một mảng:", data);
          setInforRoom(undefined);
        }
      } catch (err) {
        setError("Error fetching rooms. Please try again.");
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false); // Kết thúc trạng thái loading
      }
    };
    
    const fetchMedicalRecords = async () => {
      try {
        const responseInPatient = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`, {
          params: {
            // status: 0, // Lọc status = 0 ngay tại API (nếu API hỗ trợ)
            keyword,
            user_inpatient_id: Number(user_id),  // ✅ ép về number
            room_inpatient_id: Number(room_id),
            limit:1000,
          },
        });
        const data1 = responseInPatient?.data?.data?.data || [];
        if (!Array.isArray(data1)) throw new Error("Invalid response format");
        // Chuyển đổi dữ liệu API thành kiểu `MedicalRecord`
        const fetchedTreatmentSessions: TreatmentSessionInpatient[] = data1
          .flatMap((record: any) =>
            record.treatment_sessions?.map((session: any) => ({
              id: BigInt(session.id),
              patient_name: record.patients?.name || "",
              bed_code: session.beds?.code || "",
              visit_date: record.visit_date,
              medical_record_id: BigInt(record.id),
              bed_id: BigInt(session.bed_id),
              start_date: session.start_date,
              end_date: session.end_date,
              diagnosis: record.diagnosis,
              notes: record.notes,
              conclusion_of_treatment: session.conclusion_of_treatment||"Chưa kết luận",
              status_treatment_session: session.status,
            })) || []
          );
        setTotalRecords(fetchedTreatmentSessions.length);
        setInpatient(fetchedTreatmentSessions);  // Cập nhật danh sách phòng phụ trách
      } catch (error) {
        console.error("Error fetching medical records:", error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      if (user_id && room_id) {
        fetchRooms();
      }
    }, []);  // Khi user_id hoặc room_id thay đổi, gọi lại API
  
    useEffect(() => {
        fetchMedicalRecords();
      }, [limit, pageIndex,status]);
      if (loading) {
        return <div>Loading...</div>;
      }
    
    const columnPatientNotExamined = inpatient.length > 0 ? createColumns(inpatient,undefined, undefined, undefined,columnPartientNotExaminedHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
   // const columnMedicalRecords = medicalRecords.length > 0 ? createColumns(medicalRecords,handleView, handleEdit, handleDelete, columnPartientCurrentlyHeaderMap,{view: true, edit: false, delete: false},switchConfig ) : [];
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className=" w-full">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân điều trị</h1>
          <h1 className="text-lg font-semibold md:text-xl">Khoa: {currentUser?.department_name}</h1>
          <h1 className="text-lg font-semibold md:text-xl">Nhóm phòng: {inforRoom?.room_catalogue_code}</h1>
          <h2 className="text-lg font-semibold md:text-x">Phòng: {inforRoom?.code}</h2>
          <h2 className="text-lg font-semibold md:text-x">Bác sĩ: {currentUser?.name}</h2>
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          
        <Tabs defaultValue="currentlyExamining" className='w-full mt-2'>
          <TabsList className="grid w-full grid-cols-2 w-[300px]">
            <TabsTrigger value="currentlyExamining">Danh sách điều trị</TabsTrigger>
          </TabsList>

          <TabsContent value="currentlyExamining">
            <Card className='mb-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách bệnh nhân điều trị</CardTitle>
                <CardDescription>
                  Các bệnh nhân đang điều trị
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
                       <Input type="text" placeholder="Tìm kiếm" 
                        value={keyword} // Đặt giá trị từ state keyword
                        onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Button  onClick={() => fetchMedicalRecords()}>Lọc</Button>
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
                  data={inpatient}
                  columns={columnPatientNotExamined}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                  setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                  />
                  )}


</div>
              </CardContent>  
            </Card >
          </TabsContent> 
        </Tabs>
       
          </div>
      </main>
  );
};

export default InpatientPage;