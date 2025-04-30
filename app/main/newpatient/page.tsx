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
  AlertDialogTrigger,
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
import { DepartmentType, MedicalRecord, MedicalRecordNewpatient, Patient, PatientCurrently, RoomCatalogueType, RoomType, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, CalendarIcon, ChevronDownIcon, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, MedicalRecordSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import axios from 'axios';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserInfo } from '@/lib/dal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { create_patient } from '@/actions/patient/newpatient/create';
import { DayPicker } from 'react-day-picker';
import { FormError } from '@/components/form-error';



const columnPartientNotExaminedHeaderMap: { [key: string]: string } = {
  patient_name: "Bệnh nhân",
  visit_date: "Ngày khám",
  room_code: "Phòng khám",
  room_catalogue_code: "Nhóm phòng",
  service_newpatient: "Dịch vụ khám (chi tiết)", // Cột cho service_newpatient
  diagnosis_newpatient: "Chuẩn đoán",
  status_newpatient: "Trạng thái",
  is_inpatient_newpatient: "Đối tượng",
};


const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const statusOptions = [
  { value: 0, label: "Không hoạt động" },
  { value: 1, label: "Hoạt động" },
  { value: 2, label: "Tât cả" },
]
const NewPatient = () => {
  const router = useRouter(); 
  const [patientNotExamined, setPatientNotExamined]=useState<MedicalRecord[]>([]);
  const [patientNotExaminedWithRoomInfo, setPatientNotExaminedWithRoomInfo]=useState<MedicalRecordNewpatient[]>([]);
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();

  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomPatients, setRoomPatients] = useState<RoomType[]>([]);

  const [roomCatalogues,setRoomCatalogue]=useState<RoomCatalogueType[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false); // Để quản lý trạng thái dialog
  const form=useForm<z.infer<typeof MedicalRecordSchema>>({
    //resolver:zodResolver(MedicalRecordSchema),
  });
  const handleSelecLimit = (value: number | null) => {
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
    setError(""); // Xóa lỗi
    form.reset({
      name: '',
      birthday: undefined,
      address: '',
      phone: '',
      cccd_number: '',
      health_insurance_code: '',
      guardian_phone: '',
      gender: 1, // Mặc định là nam
      room_id:undefined,
    });

    form.clearErrors(); // Xóa lỗi validation
  };
    const handleSearch = async () => {
      setError("")
      if(keyword.trim()===""){
        alert("Vui lòng nhập căn cước công dân trước khi tìm")
        form.reset(); // Reset form fields
        form.clearErrors(); // Clear validation errors
      }
      else{
        try {
          // Gửi yêu cầu tìm kiếm bệnh nhân
          const response = await axios.get('http://localhost:8000/api/patients', {
            params: {
              limit: 100, // Các tham số query
            },
          });
          
    
          const patients = response.data.data.data; // Lấy danh sách bệnh nhân từ response
        // Lọc bệnh nhân có CCCD trùng với từ khoá
          const patient = patients.find((patient: Patient) => patient.cccd_number === keyword);
          // Kiểm tra nếu bệnh nhân tìm thấy
          if (patient) {
            // Cập nhật giá trị vào form
            form.setValue('name', patient.name);
            form.setValue('birthday', new Date(patient.birthday || '').getTime());
            form.setValue('address', patient.address || '');
            form.setValue('phone', patient.phone || '');
            form.setValue('cccd_number', patient.cccd_number);
            form.setValue('gender', patient.gender);
            form.setValue('health_insurance_code', patient.health_insurance_code || '');
            form.setValue('guardian_phone', patient.guardian_phone || '');
          } else {
            setDialogOpen(true); // Mở dialog nếu không tìm thấy bệnh nhân
          }
        } catch (err) {
          console.error('Lỗi tìm kiếm bệnh nhân:', err);
          setDialogOpen(true); // Mở dialog nếu có lỗi
        }
      }
      
    };
    const onSubmit = ( values: z.infer<typeof MedicalRecordSchema>) => {
      startTransition(() => {
        console.log(values)
        create_patient(values)
          .then((data) => {
            if (data?.error) {
              setError(data?.error);
             
            } else if (data?.success) {
              
              setError('');
              
              // Hiển thị toast cho thành công
              toast({
                variant:"success",
                title: "Thêm thành công",
                description: data?.success,
                action: <ToastAction altText="Thử lại">Ok</ToastAction>
              });
              handleReset();
               
              // Tắt sau khi thành công
            }
          })
      });
    };

    const fetchRoomCatalogues = async () => {
      setLoading(true) // Bắt đầu trạng thái loading
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
      try {
        const response = await axios.get(endpoint, {
          params: {
            keyword:"Khám",
            limit: 1000, // Số bản ghi trên mỗi trang
          },
        })
        const { data } = response.data.data
  
        if (Array.isArray(data)) {
          const fetchedRoomCatalogues: RoomCatalogueType[] = data.map((item: any) => ({
            id: item.id,
            keyword:item.keyword,
            name: item.name,
            description: item.description,
            status: item.status,
          })) // Chỉ lấy các thuộc tính cần thiết
      
          setRoomCatalogue(fetchedRoomCatalogues) // Cập nhật danh sách phòng ban
          setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
        } else {
          throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
        }
      } catch (err) {
        setError('Error fetching RoomCatalogues') // Xử lý lỗi
        console.error('Error fetching RoomCatalogues:', err)
      } finally {
        setLoading(false) // Kết thúc trạng thái loading
      }
    }
    const fetchRooms = async ({
      filterFn,
      onSuccess,
    }: {
      filterFn?: (item: any) => boolean;
      onSuccess: (rooms: RoomType[]) => void;
    }) => {
      setLoading(true);
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
    
      try {
        const initialResponse = await axios.get(endpoint);
        const totalRecords = initialResponse.data.data.total;
    
        const responseAll = await axios.get(endpoint, {
          params: { limit: totalRecords },
        });
    
        const { data } = responseAll.data.data;
        if (Array.isArray(data)) {
          const filtered = filterFn ? data.filter(filterFn) : data;
    
          const mappedRooms: RoomType[] = filtered.map((item: any) => ({
            id: item.id,
            code: item.code,
            department_name: item.departments.name,
            room_catalogue_code: item.room_catalogues.keyword,
            description: item.room_catalogues.description,
            beds_count: item.beds_count,
            occupied_beds: item.occupied_beds,
            status_bed: item.status_bed,
            status: item.status,
            department_id: item.department_id,
            room_catalogue_id: item.room_catalogue_id,
          }));
    
          onSuccess(mappedRooms);
          setTotalRecords(totalRecords);
        }
      } catch (err) {
        setError("Error fetching rooms");
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    

    

    const handleSelectRoom = (value: bigint | null) => {
      if (value !== null) {
        form.setValue('room_id', BigInt(value)); // Cập nhật phòng vào form
      }
    };
    const handleSelectRoomCatalogue=(value: bigint | null) => {
      if(value)
        fetchRooms({
          filterFn: (item) =>
            item.departments.name === "Khoa khám bệnh" &&
            item.room_catalogue_id === value &&
            item.users.length > 0,
          onSuccess: (rooms) => setRooms(rooms),
        });
       
      };

    const fetchMedicalRecords = async () => {
      try {
        const responsePatientNotExamined = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`, {
          params: {
            keyword,
            limit:limit,
          },
        });
        const data1 = responsePatientNotExamined?.data?.data?.data || [];
        if (!Array.isArray(data1)) throw new Error("Invalid response format");
        // Chuyển đổi dữ liệu API thành kiểu `MedicalRecord`
        const fetchedPatientNotExamined: MedicalRecord[] = data1
          .map((item: any) => ({
            id: item.id,
            patient_name: item.patients.name,
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
            result_details: item.medical_record_service.map((item: any) => item.result_details),
            service_ids: item.medical_record_service.map((item: any) => item.service_id),
            service_names:item.medical_record_service.map((item: any) => item.service_name),
            service_room_ids:item.medical_record_service.map((item: any) => item.room_id),
          }));
        setPatientNotExamined(fetchedPatientNotExamined);  // Cập nhật danh sách phòng phụ trách
      } catch (error) {
        console.error("Error fetching medical records:", error);
      } finally {
        setLoading(false);
      }
    };
/// ✅ Sau khi cả patientNotExamined và roomPatients đã có:
useEffect(() => {
  if (patientNotExamined.length === 0 || roomPatients.length === 0) return;

  const roomMap = new Map<BigInt, RoomType>();
  roomPatients.forEach(room => {
    roomMap.set(room.id, room);
  });

  const medicalRecordsWithRoom = patientNotExamined.map((record) => {
    const room = roomMap.get(record.room_id);
  
    const service_newpatient = (record.service_names || []).map((name, index) => {
      const room_id = record.service_room_ids?.[index];
      const result_details = record.result_details?.[index]; // Lấy kết quả chi tiết cho dịch vụ
      const room_info = room_id ? roomMap.get(room_id) : null;
      return {
        service_name: String(name),
        service_room: room_info?.code || '',
        service_room_catalogue_code: room_info?.room_catalogue_code || '', // Thêm trường này
        service_department_name: room_info?.department_name || '', // Thêm trường này
        had_result_details: result_details ? 1 : 0, // Xử lý kết quả nếu cần
      };
    });
  
    const {
      diagnosis,
      status,
      is_inpatient,
      service_names,
      service_room_ids,
      result_details,
      ...rest
    } = record;
  
    return {
      ...rest,
      room_code: room?.code || '',
      room_catalogue_code: room?.room_catalogue_code || '',
      department_name: room?.department_name || '',
      is_inpatient_newpatient: is_inpatient,
      status_newpatient: status,
      diagnosis_newpatient: diagnosis || "Chưa có kết quả",
      service_newpatient,
    };
  });
  console.log(medicalRecordsWithRoom)
  setPatientNotExaminedWithRoomInfo(medicalRecordsWithRoom);
}, [patientNotExamined.length, roomPatients.length]);

    // Fetch departments when the component loads
  useEffect(() => {
    fetchMedicalRecords();
  }, [limit, pageIndex,status]); // Empty dependency array, ensures this runs only once when the component mounts
  useEffect(() => {
    fetchRooms({
      onSuccess: (rooms) => setRoomPatients(rooms)
    });
    fetchRoomCatalogues();
  }, []); // Empty dependency array, ensures this runs only once when the component mounts
  const columnPatientNotExamined = patientNotExaminedWithRoomInfo.length > 0 ? createColumns(patientNotExaminedWithRoomInfo,undefined, undefined, undefined,columnPartientNotExaminedHeaderMap,{view:false,edit: false, delete: false},undefined,undefined ) : [];
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân mới</h1>
        </div>
          <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1">
          <Tabs defaultValue="newpatient" className='w-full mt-2'>
            <TabsList className="grid w-full grid-cols-2 w-[400px]">
              <TabsTrigger className='px-2' value="newpatient">Tiếp nhận mới</TabsTrigger>
              <TabsTrigger className='px-2' value="newpatientlist">Danh sách trong ngày</TabsTrigger>
            </TabsList>

            <TabsContent value="newpatient">
              <Card className='mb-5'>
                <CardContent className="space-y-2">
                  <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Không tìm thấy</AlertDialogTitle>
                        <AlertDialogDescription>
                        <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Không tìm thấy bệnh nhân</AlertTitle>
                    <AlertDescription>
                      Trước đây bệnh nhân chưa đến khám, vui lòng nhập thông tin cho bệnh nhân.
                    </AlertDescription>
                    </Alert>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Card>
                    <CardHeader className='pb-1'>
                      <CardTitle>Tiếp nhận mới</CardTitle>
                      <CardDescription>
                        Thêm thông tin tiếp nhận cho bệnh nhân
                      </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                          <main className="grid flex-1 w-full items-start gap-4 p-4 sm:px-6 sm:py-0  md:gap-8">
                            
                              
                                <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 mt-4">
                                  <div className="flex items-center gap-4">
                                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                      Thông tin bệnh nhân
                                    </h1>
                                    <div className="hidden items-center gap-2 md:ml-auto md:flex">
                                    <div className="flex items-center space-x-2 bg-white">
                                        <Input type="text" placeholder="Tìm kiếm bệnh nhân" 
                                          value={keyword} // Đặt giá trị từ state keyword
                                          onChange={(e) => setKeyword(e.target.value)}
                                          />
                                        <Button variant="outline" size="sm" onClick={handleSearch}>Tìm</Button>
                                      </div>
                                        

                                      <Button variant="outline" size="sm" type="submit" onClick={form.handleSubmit(onSubmit)}>Lưu thông tin</Button>
                                      <Button variant="outline" size="sm" onClick={handleReset}>
                                            Đặt lại
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={()=>router.back()}>
                                            Quay lại
                                      </Button>
                                    </div>

                                  </div>
                                  <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)}>
                                  <div className="grid grid-cols-2 auto-rows-max items-start gap-4 lg:gap-8">
                                  <div className="grid auto-rows-max items-start gap-4  lg:gap-8">
                                      <Card x-chunk="dashboard-07-chunk-0">
                                        <CardHeader>
                                          <CardTitle>Thông tin cá nhân</CardTitle>
                                          <CardDescription>
                                            Thông tin cá nhân của bệnh nhân
                                          </CardDescription>
                                        </CardHeader>
                                        
                                        <CardContent>
                                        <FormError message={error}/>
                                          <div className="grid gap-6">
                                            <div className="grid gap-3">
                                              <div className="grid grid-cols-[2fr_1fr] gap-4">
                                                <FormField
                                                  control={form.control}
                                                  name="name"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Tên bệnh nhân</FormLabel>
                                                      <FormControl>
                                                        <Input
                                                          {...field}
                                                          disabled={isPending}
                                                          placeholder="Example: Nguyễn Văn A"
                                                          type="text"
                                                        />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Giới tính</FormLabel>
                                    <FormControl>
                                      <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            value={1}
                                            checked={Number(field.value) === 1} // Convert field.value to a number
                                            onChange={() => field.onChange(1)}
                                            disabled={isPending}
                                          />
                                          <span>Nam</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            value={0}
                                            checked={Number(field.value) === 0} // Convert field.value to a number
                                            onChange={() => field.onChange(0)}
                                            disabled={isPending}
                                          />
                                          <span>Nữ</span>
                                        </label>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                                              </div>
                                            </div>
                                            <div className="grid gap-3">
                                            <FormField
                                                  control={form.control}
                                                  name="cccd_number"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Căn cước công dân</FormLabel>
                                                      <FormControl>
                                                        <Input
                                                          {...field}
                                                          disabled={isPending}
                                                          placeholder="123456789012"
                                                          type="text"
                                                        />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                          <FormField
                                                  control={form.control}
                                                  name="birthday"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel className="text-sm font-medium text-gray-700">Ngày sinh</FormLabel>
                                                      <FormControl>
                                                        <Popover>
                                                          <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              className={cn(
                                                                "flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                                !field.value && "text-gray-400"
                                                              )}
                                                            >
                                                              <div className="flex items-center space-x-2">
                                                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                                <span>
                                                                  {field.value
                                                                    ? format(new Date(field.value), "dd/MM/yyyy")
                                                                    : "Chọn ngày"}
                                                                </span>
                                                              </div>
                                                              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                                            </Button>
                                                          </PopoverTrigger>
                                                          <PopoverContent className="z-50 w-[320px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                                                          <DayPicker
                                                              mode="single"
                                                              selected={field.value ? new Date(field.value) : undefined}
                                                              onSelect={(date) =>
                                                                field.onChange(date ? date.getTime() : undefined)
                                                              }
                                                              captionLayout="dropdown"
                                                              fromYear={1900}
                                                              toYear={new Date().getFullYear()}
                                                              className="custom-daypicker"
                                                            />
                                                                          </PopoverContent>
                                                        </Popover>
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />

                                              <FormField
                                                control={form.control}
                                                name="health_insurance_code"
                                                render={({ field }) => (
                                                  <FormItem>
                                                    <FormLabel>Bảo hiểm y tế</FormLabel>
                                                    <FormControl>
                                                      <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="ASDFADFAF114AS"
                                                        type="text"
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card x-chunk="dashboard-07-chunk-3">
                                      <CardHeader>
                                          <CardTitle>Thông tin liên hệ</CardTitle>
                                          <CardDescription>
                                            Thông tin địa chỉ, số điện thoại liên hệ
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid gap-6">
                                              <div className="grid gap-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                  <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel>Số điện thoại liên hệ</FormLabel>
                                                        <FormControl>
                                                          <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="0901234567"
                                                            type="text"
                                                          />
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )}
                                                  />
                                      
                                                  <FormField
                                                    control={form.control}
                                                    name="guardian_phone"
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel>Số điện thoại người giám hộ</FormLabel>
                                                        <FormControl>
                                                          <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="0987654321"
                                                            type="text"
                                                          />
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )}
                                                  />
                                                </div>
                                              </div>

                                              <div className="grid gap-3">
                                              <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel>Địa chỉ liên lạc</FormLabel>
                                                        <FormControl>
                                                          <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="Số nhà, đường, phường, quận"
                                                            type="text"
                                                          />
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )}
                                                  />
                                              </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                  </div>
                                    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                                  
                                      <Card x-chunk="dashboard-07-chunk-3">
                                      <CardHeader>
                                          <CardTitle>Chỉ định nơi khám</CardTitle>
                                          <CardDescription>
                                            Chỉ định khoa khám, phòng khám, bác sĩ khám
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid gap-6">
                                          <FormItem className="flex flex-col">
                                                          <FormLabel className="mr-2">Nhóm phòng</FormLabel>
                                                          <FormControl className="flex-grow">
                                                          <Combobox<bigint|null>
                                                                options={roomCatalogues.map(roomCatalogue => ({
                                                                  value: roomCatalogue.id,
                                                                  label: roomCatalogue.name,
                                                                }))}
                                                                  placeholder="Chọn nhóm phòng"
                                                                  onSelect={handleSelectRoomCatalogue}
                                                                  />
                                                                  </FormControl>
                                                                  <FormMessage />
                                                    </FormItem>
                                                <FormField 
                                                      control={form.control}
                                                      name="room_id"
                                                      render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                          <FormLabel className="mr-2">Phòng</FormLabel>
                                                          <FormControl className="flex-grow">
                                                            <Combobox<bigint | null>
                                                            defaultValue={form.watch('room_id') || null} // Lấy giá trị động từ form
                                                            options={rooms.map(room => ({
                                                              value: room.id,
                                                              label: room.code,
                                                            }))}
                                                              placeholder="Chọn phòng"
                                                              onSelect={handleSelectRoom}
                                                              />
                                                          </FormControl>
                                                          <FormMessage />
                                                        </FormItem>
                                                      )}
                                                    />

                                                    
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  
                                    </div>
                                  </form>
                              </Form>
                                </div>
                          </main>
                        </CardContent>
                  </Card>
                </CardContent>  
              </Card >
            </TabsContent> 
            
            <TabsContent value="newpatientlist">
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
                              onSelect={handleSelecLimit}
                              placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                              defaultValue={limit} // Default to 20 records
                              />
                    
              
                            <div className="flex items-center space-x-5">
                                  <div className='flex'>
                                  <Combobox<number>
                                    options={statusOptions}
                                    onSelect={handleSelectStatus}
                                    placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                                    defaultValue={null} // No default selection for status
                                  />
                                  </div>
                                  <div className="flex items-center space-x-2 bg-white">
                                    <Input type="text" placeholder="Tìm kiếm" 
                                    value={keyword} // Đặt giá trị từ state keyword
                                    onChange={(e) => setKeyword(e.target.value)}
                                    />
                                    <Button  onClick={() => fetchMedicalRecords()}>Lọc</Button>
                                  </div>
                               
                            </div>
                            </div>
                            </div>
                            <div className='flex item-center justify-center'>
              
                                {loading ? (
                                <p className='flex item-center justify-center'>Loading...</p>
                                ) : (
              
                                <DataTable
                                data={patientNotExaminedWithRoomInfo}
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

export default NewPatient;