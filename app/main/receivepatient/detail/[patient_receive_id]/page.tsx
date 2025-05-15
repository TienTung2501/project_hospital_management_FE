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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formatDate } from "@/utils"; // hoặc path đúng của bạn
import { DailyHealth, MedicalOrder, MedicalRecord, MedicalRecordHistoryDetail, MedicalRecordRecordServiceDetail, MedicationCatalogue, MedicationDetail, MedicationType, Patient, PatientCurrently , PatientServiceInfo, RoomType, ServiceCatalogue, ServiceDetailPatientResul, ServiceType, TreatmentSession, UserInfoType } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, ChevronDownIcon, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import {  CreateMedication, MedicalRecordUpdateDiagnose, PatientServiceSchema } from '@/schema';
import axios from 'axios';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '@/components/ui/popover';
import { DayPicker } from 'react-day-picker';
import {formatDateCustom} from '@/utils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useUser } from '@/components/context/UserContext';
import { format } from 'date-fns';
import ServiceInvoicePrint, { ServiceInvoicePrintHandle } from '@/components/ServiceInvoicePrint';
import { useMemo } from 'react';
import { useRef } from 'react';
import LoadingWrapper from "@/components/LoadingWrapper";
export type ServicePatient={
  id:bigint;
  service_name:string;
  department_name:string;
  room_code:string;
  price:number;
  service_id:bigint;
  room_id:bigint;
}
const columnServicePartientNotHeaderMap={
  service_name:"Tên dịch vụ",
  department_name:"Tên khoa",
  room_code:"Phòng",
  price: "giá",
}
const columnTreatmentSessionHeaderMap={
  user_name:"Bác sĩ điều trị",
  department_name:"Khoa điều trị",
  room_code:"Phòng",
  bed_code: "Mã giường",
  start_date: "Ngày bắt đầu",
  end_date: "Ngày kết thúc",
  diagnosis: "Chuẩn đoán ban đầu",
  notes: "Ghi trú",
  conclusion_of_treatment: "Kết luận sau điều trị",
  current_cost:"Tiền viện phí",
  total_advance_payment: "Tiền tạm ứng",
  refunded_amount: "Tiền hoàn lại",
  payment_status_treatment_session: "Trạng thái thanh toán",
  status_treatment_session:"Trạng thái điều trị",
}
const columnTreatmentSessionDetailDailyHealthListHeaderMap={
  check_date: "Ngày theo dõi",
  temperature: "Nhiệt độ cơ thể",
  blood_pressure: "Huyết áp",
  heart_rate: "Nhịp tim",
  notes: "Ghi chú",
}
const columnTreatmentSessionDetailMedicalOrderListHeaderMap={
  typeSub:"Loại chỉ thị",
  date:"Ngày tạo",
  notes:"Ghi chú của bác sĩ",
}

const columnHeaderMap={
  name:"Tên dịch vụ",
  assigning_doctor_name:"Bác sĩ chỉ định",
  health_insurance_applied:"Áp dụng bảo hiểm",
  health_insurance_value: "Phần trăm",
}
const columnHeaderMapDetailResultService={
  keyword:"Từ khóa",
  name:"Thuộc tính",
  reference_range:"Khoảng tham chiếu",
  unit:"Đơn vị",
  value: "Kết quả",
}
const columnHeaderMapMedicationDetail={
  name:"Tên thuốc",
  dosage:"Số lượng kê",
  measure:"Đơn vị",
  description: "Hướng dẫn dùng",
}
const columnHeaderMapMedicalRecordHistoryDetail={
  visit_date: "Ngày khám",
  diagnosis: "Chẩn đoán",
  notes: "Ghi chú",
  appointment_date: "Ngày hẹn tái khám",
  is_inpatient: "Đối tượng nội trú",
  inpatient_detail: "Chi tiết nội trú",
}
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
export  type DetailResultService={
  id:string;
  keyword:string;
  name:string;
  reference_range:string;
  unit:string;
  value:string;
}
const PatientReceive = () => {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<ServicePatient >();
  const [isAssignService,setIsAssignService]=useState(false);
  const [isConclusion,setIsConclusion]=useState(false);
  const [isOpenInvoiceDialog, setIsOpenInvoiceDialog] = useState(false);

  const [serviceCatalogues,setServiceCatalogues] =useState<ServiceCatalogue []>([]);
 
  const [services,setServices]   =useState<ServiceType [] >([]);

  const [rooms,setRooms]  =useState<RoomType[] >([]);

  const printRef = useRef<ServiceInvoicePrintHandle>(null);

  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]);
  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);

  const [patient,setPatient]=useState<Patient>();                               
  const {patient_receive_id}=useParams();
  const [servicePatients,setServicePatients]=useState<ServicePatient[]>([]);
  const form=useForm<z.infer<typeof PatientServiceSchema>>({
  resolver:zodResolver(PatientServiceSchema),
  });
  const handleReset = () => {
    form.reset(); 
    form.clearErrors(); 
  };
  const onSubmit = (values: z.infer<typeof PatientServiceSchema>) => {
    const { service_catalogue_id, service_id, room_id } = values;
  
    const service = services.find((s) => BigInt(s.id )=== service_id);
    const room = rooms.find((r) => BigInt(r.id) === room_id);
    if (service && room) {
      // Thêm dịch vụ vào danh sách
      setServicePatients((prev) => {
        const updatedList = [
          ...prev,
          {
            id: service_id + BigInt(1), // Tạo ID mới cho dịch vụ
            service_name: service.name,
            department_name: serviceCatalogues.find((c) => c.id === service_catalogue_id)?.name || "Không xác định",
            room_code: room.code,
            price: service.price,
            service_id,
            room_id,
          },
        ];
        return updatedList;
      });
  
      // Reset form sau khi thêm
      form.reset({
        service_catalogue_id: undefined,
        service_id: undefined,
        room_id: undefined,
      });
    }
  };
  const handleSaveConfirmed = () => {
    const payload = {
      patient_id:Number(patient?.id),
      treatment_session_id:null,
      medical_record_id: Number(patient_receive_id), // ID của hồ sơ bệnh án
      services: servicePatients.map(({ service_id, room_id, service_name }) => ({
        service_id: Number(service_id),
        service_name,
        room_id: Number(room_id),
        patient_id: Number(patient?.id),
      })),
    };
    console.log(payload)
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/createPivot`, payload)
      .then((res) => {
        console.log("Kết quả trả về từ API:", res);
  
        if (res.status === 200) {
          toast({
            variant: "success",
            title: "Thêm dịch vụ thành công",
            description: res.statusText,
          });
          
          setServicePatients([]);
         router.back();
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi khi thêm dịch vụ",
            description: "Không thể thêm dịch vụ vào hồ sơ bệnh án.",
          });
        }
      })
      .catch((err) => {
  if (axios.isAxiosError(err)) {
    console.error("🔥 AxiosError:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data, // thông báo lỗi chi tiết từ backend
      headers: err.response?.headers,
    });
  } else {
    console.error("❗Lỗi không phải AxiosError:", err);
  }

  toast({
    variant: "destructive",
    title: "Lỗi",
    description: err?.response?.data?.message || err.message,
  });
});
  }
  const handleDelete = (id:bigint|string) => {
    // Xóa dịch vụ khỏi danh sách
    setServicePatients((prev) =>
      prev.filter((service) => !(service.id===id))
    );
  };
  const fetchRooms = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
    try {
      const response = await axios.get(endpoint, {
        params: {
          limit: limit, // Số bản ghi trên mỗi trang
          page: pageIndex, // Trang hiện tại
          status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
          keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
        },
      })
      const { data } = response.data.data
      if (Array.isArray(data)) {
        const fetchedRooms: RoomType[] = data.map((item: any) => ({
          id: item.id,
          code: item.code,
          department_name:item.departments.name,
          room_catalogue_code:item.room_catalogues.name,
          description: item.room_catalogues.description,
          occupied_beds: item.occupied_beds,
          beds_count: item.total_beds,
          status_bed:item.status_bed,
          user_id:item.users[0]?.id,
          status: item.status,
          department_id: item.department_id,
          room_catalogue_id: item.room_catalogue_id,
          
        }));
        setRooms(fetchedRooms) // Cập nhật danh sách phòng ban
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
  };
  
  const fetchServiceCatalogues = async () => {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues`;
      
      try {
          const response = await axios.get(endpoint);
          const totalRecords = response.data.data.total;
  
          // Gọi API để lấy tất cả các bản ghi
          const responseAll = await axios.get(endpoint, { params: { limit: totalRecords } });
          const { data } = responseAll.data.data;
          console.log(data)
          if (Array.isArray(data)) {
              const serviceCatalogueList: ServiceCatalogue[] = data
                  .filter((item: any) => item.status === 1)
                  .map((item: any) => ({
                      id: BigInt(item.id), // Chuyển id thành bigint
                      name: item.name,
                      description: item.description,
                      status: item.status,
                  }));
              setServiceCatalogues(serviceCatalogueList);
          } else {
              console.warn("Data is not an array:", data);
          }
      } catch (err) {
          console.error("Error fetching service catalogues:", err);
          toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load service catalogues.",
          });
      }
  };
  const fetchServices = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services`;
    try {
      const response = await axios.get(endpoint, {
        params: {
          limit: 1000, // Số bản ghi trên mỗi trang
        },
      })
      const { data } = response.data.data
      if (Array.isArray(data)) {
        const fetchedServices: ServiceType[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          unit: item.unit,
          status:item.status,
          detail:item.detail,
          health_insurance_applied:item.health_insurance_applied,
          health_insurance_value:item.health_insurance_value,
          service_catalogue_id: item.service_catalogue_id,
          room_catalogue_id: item.room_catalogue_id,
          // department_name:item.department.name,
          // room_catalogue_code:item.room_catalogue.name,
          
        }));
        setServices(fetchedServices) // Cập nhật danh sách phòng ban
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching RoomCatalogues') // Xử lý lỗi
      console.error('Error fetching RoomCatalogues:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  };
  useEffect(() => {
    if (rooms.length > 0 && services.length > 0 && serviceCatalogues.length > 0) {
      fetMedicalRecord();
    }
  }, [rooms, services, serviceCatalogues]);
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchRooms();
      await fetchServiceCatalogues();
      await fetchServices();
    };
  
    fetchData();
  }, []);

  const fetMedicalRecord= async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`;
    
    try {
        // Gọi API để lấy tất cả các bản ghi
        const responseAll = await axios.get(endpoint, { params: { limit: 1000 } });
        const { data } = responseAll.data.data;
        console.log("data",data);
        if (Array.isArray(data)) {
          const medicalRecords: any = data
            .filter(
              (item: any) =>
                // item.status === 0 && BigInt(item.id) === BigInt(Number(patient_receive_id)) // So sánh id chính xác
                BigInt(item.id) === BigInt(Number(patient_receive_id)) // So sánh id chính xác
            )
            
            const firstRecord = medicalRecords[0]; // Kiểm tra bản ghi đầu tiên
            const patient: Patient | undefined = firstRecord?.patients
              ? {
                  id: BigInt(firstRecord.patients.id),
                  name: firstRecord.patients.name || "",
                  birthday: firstRecord.patients.birthday || "",
                  address: firstRecord.patients.address || "",
                  phone: firstRecord.patients.phone || undefined,
                  cccd_number: firstRecord.patients.cccd_number || "",
                  health_insurance_code: firstRecord.patients.health_insurance_code || undefined,
                  guardian_phone: firstRecord.patients.guardian_phone || undefined,
                  gender: firstRecord.patients.gender,
                }
              : undefined;
              setPatient(patient);
              if(patient)
              await fetchMedicalRecordHistoryDetail(patient?.id);
        } else {
            console.warn("Data is not an array:", data);
        }
    } catch (err) {
        console.error("Error fetching service catalogues:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load service catalogues.",
        });
    }
  };
  const handleSelectServiceCatalogue = (value: bigint | null) => {
      if(value!==null){

      form.setValue('service_catalogue_id', BigInt(value)); // Update the form value directly
      // Lọc danh sách services
        const filteredServices = services.filter(
          (service) =>  BigInt(service.service_catalogue_id )=== value
        );
        // Xử lý `filteredServices` tại đây, ví dụ cập nhật state:
        setFilteredServices(filteredServices);
      
      }
    };
  const handleSelectService=(value: bigint | null)=>{
    if(value!==null){
      form.setValue('service_id', BigInt(value)); // Update the form value directly
        
        const servicelist= services.filter(
          (service) => service.id === value
        );
        const filteredRooms= rooms.filter(
          (room) => room.room_catalogue_id === servicelist[0].room_catalogue_id
        );
        setFilteredRooms(filteredRooms);
      
      }
  };

  const handleSelectRoom=(value: bigint | null)=>{
    if(value!==null){
      form.setValue('room_id', BigInt(value)); // Update the form value directly
    }
  }

  const handleClickPrint = () => {
    if (servicePatients.length === 0) {
      alert("Vui lòng thêm dịch vụ cho bệnh nhân");
    } else {
      setIsOpenInvoiceDialog(true); // Mở dialog thay vì in ngay
    }
  };

  const columnServicePatient = servicePatients.length > 0 ? createColumns(servicePatients,undefined, undefined, handleDelete,columnServicePartientNotHeaderMap,{view:false,edit: false, delete: true},undefined) : [];
  // chuan doan, ghi chu va lich su kham
  const [medicationCatalogues, setMedicationCatalogues] = useState<MedicationCatalogue[]>([]);
  const [medications, setMedications] = useState<MedicationType[]>([]);
  const [medicationDetails,setMedicationDetails]=useState<MedicationDetail[]>([]);
  const [editMedicationDetail, setEditMedicationDetail] = useState<MedicationDetail>();
  const [deleteMedicationDetail, setDeleteMedicationDetail] = useState<MedicationDetail>();
  const [isEditing, setIsEditing] = useState(true); // Ban đầu đang chỉnh sửa
  const [isSaveDisabled, setIsSaveDisabled] = useState(true); // Ban đầu nút Lưu hồ sơ bị khóa

  const [serviceDetailPatients,setServiceDetailPatients]=useState<ServiceDetailPatientResul[]>([]);
  const [seletedService,setSeletedService]=useState<ServiceDetailPatientResul>();
  const [detailResultSelectedService,setDetailResultSelectedService]=useState<DetailResultService[]>([])
  const [isOpenDialogServiceDetailResult, setIsOpenDialogServiceDetailResult] = useState(false);
  const [isOpenAddMedication, setIsOpenAddMedication] = useState(false);
  const [isOpenDialogMedicalRecordHistory, setIsOpenDialogMedicalRecordHistory] = useState(false);
  const [isPrescriptionVisible, setPrescriptionVisible] = useState(false);

  let currentUser: UserInfoType | null = null;
  const user = useUser();  
  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }
  const handleSelecLimit = (value: number | null) => {
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
  const formUpdateDiagnose=useForm<z.infer<typeof MedicalRecordUpdateDiagnose>>({
    resolver:zodResolver(MedicalRecordUpdateDiagnose),
  });
  const formCreateMedication=useForm<z.infer<typeof CreateMedication>>({
    resolver:zodResolver(CreateMedication),
  });
  const fetchMedications = async (value:Number) => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medications`;
    try {
      const response = await axios.get(endpoint, {
        params: {
          limit: limit, // Số bản ghi trên mỗi trang
          page: pageIndex, // Trang hiện tại
          status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
          keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
        },
      })
      
      const {data}    = response.data.data
      // Lọc mảng theo medication_catalogue_id nếu cần

      const medical = data.filter(
        (item: any) => item.medication_catalogue_id === value
      );

    console.log(medical)
      if (Array.isArray(medical)) {
        const fetchedMedication: MedicationType[] = medical.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          medication_catalogue_name:item.medication_catalogues.name,
          price: item.price,
          status:item.status,
          unit:item.unit,
          measure_count:item.measure_count,
          medication_catalogue_id:item.medication_catalogue_id,
        }));
        console.log(fetchedMedication)
        setMedications(fetchedMedication) // Cập nhật danh sách phòng ban
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      console.error('Error fetching medication Catalogues:', err)
    } finally {

    }
  }

  const handleDeleteMedication = (id: string | BigInt) => {
    const medicaion: MedicationDetail | undefined = medicationDetails.find((me) => me.id === id);
    const name = medicaion?.name;
    if (name) {
      setDeleteMedicationDetail(medicaion); // Lưu phần tử cần xóa
    }
  };

  const confirmDelete = async () => {
    if (!deleteMedicationDetail) return;

    // Xóa thành công, cập nhật danh sách medicationDetails
    setMedicationDetails((prevItems) => {
      if (!prevItems) {
        return []; // Trả về mảng rỗng nếu prevItems là undefined
      }

      // Lọc phần tử bị xóa
      const updatedItems = prevItems.filter((prevItem: any) => prevItem.id !== deleteMedicationDetail.id);

      // Cập nhật lại ID cho các phần tử còn lại, bắt đầu từ 1 và tăng dần
      const updatedItemsWithNewIds = updatedItems.map((item, index) => ({
        ...item,
        id: BigInt(index + 1), // Cập nhật ID bắt đầu từ 1 và chuyển thành BigInt
      }));

      return updatedItemsWithNewIds;
    });

    // Thông báo thành công
    toast({
      variant: "success",
      title: "Xóa thành công",
      description: `Thuốc ${deleteMedicationDetail.name} đã được xóa thành công.`,
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });

    // Reset trạng thái deleteMedicationDetail
    setDeleteMedicationDetail(undefined);
  };
  const handleSelectMedicationCatalogue = (value: Number | null) => {
    if(value!==null)
      fetchMedications(value);
  };
  const handleSelectMedication = (value: bigint | null) => {
    if(value)
      formCreateMedication.setValue('name',BigInt(value))
  };
  const fetchMedicationCatalogues = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues`;
    
    try {
        const response = await axios.get(endpoint);
        const totalRecords = response.data.data.total;

        // Gọi API để lấy tất cả các bản ghi
        const responseAll = await axios.get(endpoint, { params: { limit: totalRecords } });
        const { data } = responseAll.data.data;

        if (Array.isArray(data)) {
            const medicationCatalogueList: MedicationCatalogue[] = data
                .filter((item: any) => item.status === 1)
                .map((item: any) => ({
                    id: BigInt(item.id), // Chuyển id thành bigint
                    name: item.name,
                    description: item.description,
                    status: item.status,
                    level:item.level,
                    parent_id:item.parent_id,
                }));
            setMedicationCatalogues(medicationCatalogueList);
        } else {
            console.warn("Data is not an array:", data);
        }
    } catch (err) {
        console.error("Error fetching meidcation catalogues:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load meidcation catalogues.",
        });
    }
  };
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch medication catalogues
        await fetchMedicationCatalogues();
      } catch (error) {
        console.error("Error while fetching data:", error);
      }
    };

    fetchAllData();
  }, []);
  // convert medicalcatalogue 
  // Khi click vào nút "Sửa thông tin"
  const handleEditInformation = () => {
  setIsEditing(true); // Cho phép chỉnh sửa lại
  setIsSaveDisabled(true); // Khóa nút Lưu hồ sơ
  };
  const onSubmitDiagnose=(data: z.infer<typeof MedicalRecordUpdateDiagnose>)=>{
        setIsEditing(false); // Không cho chỉnh sửa input nữa
        setIsSaveDisabled(false); // Bật nút Lưu hồ sơ
  }
  // Hàm xử lý submit
  const onSubmitCreateMedication = (data: z.infer<typeof CreateMedication>) => {
  // Tạo ID mới, tăng từ 1 dựa trên mảng hiện tại
  const found = medications.find((item) => BigInt(item.id) === data.name);
  
    if (!found) {
      // Xử lý khi không tìm thấy thuốc, ví dụ báo lỗi hoặc return
      console.error("Không tìm thấy thuốc phù hợp");
      return;
    }
    const newMedication: MedicationDetail = {
      id: found.id,
      name: found.name,
      dosage: data.dosage,
      measure: data.measure,
      description: data.description || "",
    };
  // Thêm vào danh sách thuốc
  setMedicationDetails((prevDetails) => [...prevDetails, newMedication]);

  // Reset form sau khi thêm thành công
  formCreateMedication.reset({
    name:undefined,
    dosage:0,
    measure:"",
    description:"",
  });
  setIsOpenAddMedication(false);
  };
  const convertTimestampToDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' nếu tháng < 10
  const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' nếu ngày < 10
  return `${year}-${month}-${day}`;
  };
  const handleSaveDedicalRecordPatient=async ()=>{
  const appointment_date= convertTimestampToDate(formUpdateDiagnose.getValues('apointment_date'));
  const diagnosis=formUpdateDiagnose.getValues('diagnosis');
  const notes=formUpdateDiagnose.getValues('notes');
    try {
        const payload = {
          medical_record: {
            medical_record_id: Number(patient_receive_id),
            patient_id: Number(patient?.id),
            data: {
              appointment_date,
              diagnosis,
              notes,
            },
          },
          medications: medicationDetails.map((medication) => ({
            medication_id: Number(medication.id),
            name: medication.name,
            dosage: medication.dosage.toString(),
            measure: medication.measure,
            description: medication.description,
          })),
        };
      const updateMedicalRecord = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/save`;
      const response =await  axios.post(updateMedicalRecord, payload, { timeout: 5000 });
      if (response.status === 200) {
        // Hiển thị thông báo thành công
        toast({
          variant: "success",
          title: "Thành công",
          description: "Lưu hồ sơ bệnh án thành công.",
        });
        router.back()
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Có lỗi xảy ra khi lưu",
        });
      }
    } catch (error:any) {
      // Hiển thị thông báo lỗi
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.response?.data?.message || error.message,
      });
    }  
  }

  // const columnServiceDetails = serviceDetailPatients.length > 0 ? createColumns(serviceDetailPatients,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
  // const columnServiceDetailsResult = detailResultSelectedService.length > 0 ? createColumns(detailResultSelectedService,undefined, undefined, undefined,columnHeaderMapDetailResultService,{view:false,edit: false, delete: false} ) : [];
  // const columnMedicationDetail = medicationDetails.length > 0 ? createColumns(medicationDetails,undefined, undefined, handleDelete,columnHeaderMapMedicationDetail,{view:false,edit: false, delete: true} ) : [];
  // const columnMedicationDetailHistory = medicationDetails.length > 0 ? createColumns(medicationDetails,undefined, undefined, undefined,columnHeaderMapMedicationDetail,{view:false,edit: false, delete: false} ) : [];
  const buttonColumnConfigHistoryDetail = {
    id: 'buttonColumnConfigHistoryDetail',
    header: 'Chi tiết hồ sơ',
    onClickConfig: (id: string | bigint) => {
      const item: MedicalRecordHistoryDetail | undefined = medicalRecordHistoryDetails.find(
        (me) => BigInt(me.id) === BigInt(id)
      );
  
      if (!item) {
        console.error('Không tìm thấy hồ sơ bệnh án với id:', id);
        return;
      }
  
      const serviceDetailPatients: ServiceDetailPatientResul[] = item.services;
      const medicationDetails: MedicationDetail[] = item.medications;
      const treatmentSessions: TreatmentSession[] = item.treatment_sessions;
  
      // Thu thập toàn bộ pivot_ids từ medical_orders trong treatmentSessions
      const allServicePivotIdsInOrders = new Set<bigint>();
      const allMedicationPivotIdsInOrders = new Set<bigint>();
  
      for (const session of treatmentSessions) {
        for (const order of session.medical_orders || []) {
          if (order.typeEng === 'services') {
            order.pivot_ids.forEach((id) => allServicePivotIdsInOrders.add(BigInt(id)));
          } else if (order.typeEng === 'medications') {
            order.pivot_ids.forEach((id) => allMedicationPivotIdsInOrders.add(BigInt(id)));
          }
        }
      }
      // Lọc các services và medications chưa được đưa vào bất kỳ medical_order nào
      const servicePatientNotInTreatmentSessions = serviceDetailPatients.filter((s) => {
        const pivotId = s.pivot_id;
        if (pivotId === undefined) return false; // Nếu pivot_id là undefined, bỏ qua phần tử này.
        return !allServicePivotIdsInOrders.has(BigInt(pivotId));
      });
      
      const medicationPatientNotInTreatmentSessions = medicationDetails.filter((m) => {
        const pivotId = m.pivot_id;
        if (pivotId === undefined) return false; // Nếu pivot_id là undefined, bỏ qua phần tử này.
        return !allMedicationPivotIdsInOrders.has(BigInt(pivotId));
      });
      
      // Cập nhật state
      setServiceDetailPatients(serviceDetailPatients);
      setMedicationDetails(medicationDetails);
      setServicePatientNotInTreatmentSessions(servicePatientNotInTreatmentSessions);
      setMedicationPatientNotInTreatmentSessions(medicationPatientNotInTreatmentSessions);
      setTreatmentSessionList(treatmentSessions);
      setMedicalRecordHistoryDetailItem(item);
      setIsOpenDialogMedicalRecordHistory(true);
    },
    content: 'Xem',
  };
  
  const buttonColumnConfigTreatmentSessionDetail = {
    id: 'buttonColumnConfigHistoryDetailTreatmentSession',
    header: 'Chi tiết đợt điều trị',
    onClickConfig: (id: string | bigint) => {
      const item :TreatmentSession|any= treatmentSessionList?.find((me) => BigInt(me.id) === BigInt(id));
      if(item){
        const medical_orders: MedicalOrder[] = item.medical_orders;
        const daily_healths : DailyHealth[]=item.daily_healths;
        console.log("medical_orders",medical_orders)
        setTreatmentSessionDetailMedicalOrderList(medical_orders)
        setTreatmentSessionDetailDailyHealthList(daily_healths)
        setTreatmentSessionDetail(item)
        setIsOpenDialogMedicalRecordHistoryTreatmentSessionDetail(true);
      }
      else {
        console.error('Không tìm thấy hoặc result_detail không hợp lệ.');
      }
    },
    content: 'Xem',
  };
  const buttonColumnConfigTreatmentSessionDetailMedicalOrderDetail = {
    id: 'buttonColumnConfigTreatmentSessionDetailMedicalOrderDetail',
    header: 'Chi tiết chỉ thị của bác sĩ',
    onClickConfig: (id: string | bigint) => {
     
      const item: MedicalOrder | undefined = treatmentSessionDetailMedicalOrderList?.find(
        (me) => BigInt(me.id) === BigInt(id)
      );
      
      if (!item) {
        console.error('Không tìm thấy chỉ thị bác sĩ với id:', id);
        return;
      }
      if (item.typeEng === 'services') {
        const service_treatment_sessions: ServiceDetailPatientResul[] = serviceDetailPatients.filter((s) =>
          item.pivot_ids.some((pivotId) => BigInt(pivotId) === BigInt(s.pivot_id))
        );
        setServicePatientTreatmentSessions(service_treatment_sessions);
        setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderService(true);
      } else if (item.typeEng === 'medications') {
        const medication_treatment_sessions: MedicationDetail[] = medicationDetails.filter((m) => {
          // Kiểm tra xem pivot_id có hợp lệ không và chuyển đổi nó thành BigInt nếu đúng kiểu
          const pivotId = m?.pivot_id;
          if (pivotId && (typeof pivotId === 'string' || typeof pivotId === 'number')) {
            return item.pivot_ids?.some((id) => BigInt(id) === BigInt(pivotId));
          }
          return false;
        });
        
        
        setMedicationPatientTreatmentSessions(medication_treatment_sessions);
        setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderMedication(true);
      } else {
        console.error('Loại chỉ thị không hợp lệ:', item.typeEng);
      }
    },
    content: 'Xem',
  };
  
  const buttonColumnConfig = {
    id: 'customButton',
    header: 'Chi tiết kết quả',
    onClickConfig: (id: string | bigint) => {
      const item = serviceDetailPatients.find((pati) => pati.id === id);
  
      if (item?.result_detail) {
        const detailResultService = JSON.parse(item.result_detail).map(
          (result: DetailResultService) => ({
            id: result.keyword,
            keyword: result.keyword,
            name: result.name,
            reference_range: result.reference_range,
            value: result.value.toString(),
            unit: result.unit,
          })
        );
        setSeletedService(item);
        setDetailResultSelectedService(detailResultService);
        setIsOpenDialogServiceDetailResult(true)
      } else {
        console.error('Không tìm thấy hoặc result_detail không hợp lệ.');
      }
    },
    content: 'Xem',
    };
  // history: enpoint: http://localhost:8000/api/patients/history/{id}

  const fetchMedicalRecordHistoryDetail = async (id:bigint|string) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/history`;
    const response = await axios.get(endpoint);
    const data = response?.data?.data ;  // Kiểm tra response đúng cách
    console.log("history",data)
    const fetchedMedicalRecordHistoryDetail: MedicalRecordHistoryDetail[] = data.medical_records.map((item1:any) => ({
      id: item1.id,
      user_id: item1.user_id,
      user_name: item1.users.name,
      room_id: item1.room_id,
      visit_date: item1.visit_date,
      diagnosis: item1.diagnosis,
      notes: item1.notes,
      appointment_date: item1.appointment_date,
      is_inpatient: item1.is_inpatient,
      inpatient_detail: item1.inpatient_detail,
      services: item1.medical_record_service.map((item:any) => ({
        id: item.services?.id ?? null,
        name: item.service_name,
        description: item.services.description,
        health_insurance_applied: item.services.health_insurance_applied,
        health_insurance_value: item.services.health_insurance_value,
        assigning_doctor_id: item1.users.id,
        assigning_doctor_name: item1.users.name, // Assuming `currentUser` exists in scope
        pivot_id: item.id,
        result_detail: item.result_details,
      })),
      medications: item1.medical_record_medication.map((item:any) => ({
        id: item.medication_id,
        pivot_id:item.id,
        name: item.name,
        dosage: item.dosage,
        measure: item.unit, // Removed incorrect `medication.measure.pivot.measure`
        description: item.description,
      })),
      treatment_sessions: item1.treatment_sessions?.map((session: any) => ({
        id: session.id,
        medical_record_id: session.medical_record_id,
        bed_id: session.bed_id,
        bed_code:session.beds.code,
        room_id:session.room_id,
        room_code:session.rooms.code,
        department_id:session.department_id,
        department_name:session.departments.name,
        user_id:session.user_id,
        user_name:session.users.name,
        start_date: session.start_date,
        end_date: session.end_date,
        diagnosis: session.diagnosis,
        notes: session.notes,
        conclusion_of_treatment: session.conclusion_of_treatment,
        status_treatment_session: session.status,
        current_cost: session.current_cost,
        total_advance_payment: session.total_advance_payment,
        refunded_amount: session.refunded_amount,
        payment_status_treatment_session: session.payment_status,
        medical_orders: session.medical_orders?.map((order: any) => {
          let parsedDetail;
          try {
            parsedDetail = JSON.parse(order.detail);
          } catch (e) {
            parsedDetail = null; // hoặc {} hoặc throw error tùy cách bạn xử lý
          }
        
          return {
            id: order.id,
            treatment_session_id: order.treatment_session_id,
            typeSub: parsedDetail.type==="services"?"Dịch vụ( Xét nghiệm, Tiểu phẫu,...)":"Đơn thuốc(Đơn thuốc điều trị)", // ← Bây giờ là object { type: 'services', pivot_ids: [...] }
            typeEng: parsedDetail.type,
            pivot_ids: parsedDetail.pivot_ids, // ← Bây giờ là object { type: 'services', pivot_ids: [...] }
            notes: order.notes,
            date: order.createdAt,
          };
        }) ?? [],
        
        daily_healths: session.daily_healths?.map((health: any) => ({
          id: health.id,
          treatment_session_id: health.treatment_session_id,
          check_date: health.check_date,
          temperature: health.temperature,
          blood_pressure: health.blood_pressure,
          heart_rate: health.heart_rate,
          notes: health.notes,
        })) ?? [],
        advance_payments: session.advance_payments?.map((payment: any) => ({
          id: payment.id,
          treatment_session_id: payment.treatment_session_id,
          amount: payment.amount,
          payment_date: payment.payment_date,
        })) ?? [],
      })) ?? [],
    }));
    if (fetchedMedicalRecordHistoryDetail) {
      setMedicalRecordHistoryDetails(fetchedMedicalRecordHistoryDetail);
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu bệnh án:", error);
  } finally {
    setLoading(false);
  }
  };

// history:
  const [medicalRecordHistoryDetails, setMedicalRecordHistoryDetails] = useState<MedicalRecordHistoryDetail[]>([]);
  const [medicalRecordHistoryDetailItem, setMedicalRecordHistoryDetailItem] = useState<MedicalRecordHistoryDetail>();
  const [treatmentSessionList, setTreatmentSessionList] = useState<TreatmentSession[]>();
  const [treatmentSessionDetail, setTreatmentSessionDetail] = useState<TreatmentSession>();
  const [treatmentSessionDetailMedicalOrderList, setTreatmentSessionDetailMedicalOrderList] = useState<MedicalOrder[]>();
  const [treatmentSessionDetailMedicalOrderDetail, setTreatmentSessionDetailMedicalOrderDetail] = useState<MedicalOrder>();
  const [treatmentSessionDetailMedicalDailyHealthList, setTreatmentSessionDetailDailyHealthList] = useState<DailyHealth[]>();
  
  const [isOpenDialogMedicalRecordHistoryTreatmentSessionDetail, setIsOpenDialogMedicalRecordHistoryTreatmentSessionDetail] = useState(false);  
  const [isOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderService, setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderService] = useState(false);  
  const [isOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderMedicaTion, setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderMedication] = useState(false);  
  
  const [servicePatientNotInTreatmentSessions,setServicePatientNotInTreatmentSessions]=useState<ServiceDetailPatientResul[]>([]);
  const [servicePatientTreatmentSessions,setServicePatientTreatmentSessions]=useState<ServiceDetailPatientResul[]>([]);
  const [medicationPatientNotInTreatmentSessions,setMedicationPatientNotInTreatmentSessions]=useState<MedicationDetail[]>([]);
  const [medicationPatientTreatmentSessions,setMedicationPatientTreatmentSessions]=useState<MedicationDetail[]>([]);
// Columns cho dịch vụ (serviceDetailPatients)
const columnServiceDetails = useMemo(() => {
  return servicePatientNotInTreatmentSessions.length > 0
    ? createColumns(
      servicePatientNotInTreatmentSessions,
        undefined,
        undefined,
        undefined,
        columnHeaderMap,
        { view: false, edit: false, delete: false },
        undefined,
        buttonColumnConfig
      )
    : [];
}, [serviceDetailPatients, columnHeaderMap, buttonColumnConfig]);

// Columns cho kết quả dịch vụ đã chọn 
const columnServiceDetailsResult = useMemo(() => {
  return detailResultSelectedService.length > 0
    ? createColumns(
        detailResultSelectedService,
        undefined,
        undefined,
        undefined,
        columnHeaderMapDetailResultService,
        { view: false, edit: false, delete: false }
      )
    : [];
}, [detailResultSelectedService, columnHeaderMapDetailResultService]);

// Columns cho đơn thuốc hiện tại 
const columnMedicationDetail = useMemo(() => {
  return medicationDetails.length > 0
    ? createColumns(
        medicationDetails,
        undefined,
        undefined,
        handleDeleteMedication,
        columnHeaderMapMedicationDetail,
        { view: false, edit: false, delete: true }
      )
    : [];
}, [medicationDetails, columnHeaderMapMedicationDetail, handleDelete]);

// Columns cho đơn thuốc trong lịch sử
const columnMedicationDetailHistory = useMemo(() => {
  return medicationPatientNotInTreatmentSessions.length > 0
    ? createColumns(
      medicationPatientNotInTreatmentSessions,
        undefined,
        undefined,
        undefined,
        columnHeaderMapMedicationDetail,
        { view: false, edit: false, delete: false }
      )
    : [];
}, [medicationDetails, columnHeaderMapMedicationDetail]);

// Columns cho lịch sử khám bệnh
const columnMedicalHistoryDetail = useMemo(() => {
  return medicalRecordHistoryDetails.length > 0
    ? createColumns(
        medicalRecordHistoryDetails,
        undefined,
        undefined,
        undefined,
        columnHeaderMapMedicalRecordHistoryDetail,
        { view: false, edit: false, delete: false },
        undefined,
        buttonColumnConfigHistoryDetail
      )
    : [];
}, [medicalRecordHistoryDetails, columnHeaderMapMedicalRecordHistoryDetail, buttonColumnConfigHistoryDetail]);
const columnTreatmentSession = useMemo(() => {
  // Kiểm tra sự tồn tại của treatmentSessionList trước khi truy cập vào .length
  return treatmentSessionList && treatmentSessionList.length > 0
    ? createColumns(
        treatmentSessionList,
        undefined,
        undefined,
        undefined,
        columnTreatmentSessionHeaderMap,
        { view: false, edit: false, delete: false },
        undefined,
        buttonColumnConfigTreatmentSessionDetail
      )
    : [];
}, [treatmentSessionList, columnTreatmentSessionHeaderMap, buttonColumnConfigTreatmentSessionDetail]);


const columnMedicalOrder = useMemo(() => {
  return treatmentSessionDetailMedicalOrderList&&treatmentSessionDetailMedicalOrderList?.length > 0
    ? createColumns(
      treatmentSessionDetailMedicalOrderList,
        undefined,
        undefined,
        undefined,
        columnTreatmentSessionDetailMedicalOrderListHeaderMap,
        { view: false, edit: false, delete: false },
        undefined,
        buttonColumnConfigTreatmentSessionDetailMedicalOrderDetail
      )
    : [];
}, [treatmentSessionDetailMedicalOrderList, columnTreatmentSessionDetailMedicalOrderListHeaderMap, buttonColumnConfigTreatmentSessionDetailMedicalOrderDetail]);
const columnDailyHealth = useMemo(() => {
  return treatmentSessionDetailMedicalDailyHealthList&&treatmentSessionDetailMedicalDailyHealthList?.length > 0
    ? createColumns(
      treatmentSessionDetailMedicalDailyHealthList,
        undefined,
        undefined,
        undefined,
        columnTreatmentSessionDetailDailyHealthListHeaderMap,
        { view: false, edit: false, delete: false },
        undefined,
      )
    : [];
}, [treatmentSessionDetailMedicalDailyHealthList, columnTreatmentSessionDetailDailyHealthListHeaderMap]);

  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Chi tiết thông tin bệnh nhân đến khám</h1>
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Tabs defaultValue="CurrentPatien" className='w-full mt-2'>
          <TabsList className="grid w-full grid-cols-2 w-fit">
            <TabsTrigger value="CurrentPatien">Thông tin khám bệnh</TabsTrigger>
            <TabsTrigger value="HistoryMedicalRecordDetail">Lịch sử khám</TabsTrigger>
          </TabsList>
          <TabsContent value="CurrentPatien">
          <Card>
              <CardHeader className='pb-1'>
                <CardTitle>Tiếp nhận mới</CardTitle>
                <CardDescription>
                  Thêm thông tin tiếp nhận cho bệnh nhân
                </CardDescription>
               </CardHeader>
                <CardContent className="space-y-2">
                
                      
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
                              <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                              <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                              <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                              <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                              <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                              <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                              <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                              <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>
                              <p><strong>Chỉ định:</strong> 
                              <Button variant="link"    
                                onClick={()=>{
                                  setIsAssignService(true)
                                  setIsConclusion(false)
                                  }}>Cận lâm sàng</Button> /
                              <Button variant="link"    onClick={()=>{
                                  setIsConclusion(true)
                                  setIsAssignService(false)
                                  }}>Nhận xét</Button></p>
                              <div className='grid grid-cols-2 gap-4 mt-5 w-fit'>

                                
                              </div>
                              </div>
                           </div>
                         
                            <div className="items-start gap-4 lg:gap-8">
                            
                               {
                                isAssignService&&(
                                  <Card x-chunk="dashboard-07-chunk-3"  className="col-span-2">
                                  <CardHeader>
                                    <CardTitle>Chỉ định dịch vụ</CardTitle>
                                    <CardDescription>
                                      Chỉ định các dịch vụ cho bệnh nhân
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                  <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className=" w-fit grid grid-cols-3 gap-2">
                                          <FormField 
                                        control={form.control}
                                        name="service_catalogue_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                               options={serviceCatalogues.map(serviceCatalogue => ({
                                                value: serviceCatalogue.id,
                                                label: serviceCatalogue.name,
                                              }))}
                                                onSelect={handleSelectServiceCatalogue}
                                                placeholder="Chọn nhóm dịch vụ"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
           
                                          <FormField 
                                        control={form.control}
                                        name="service_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Dịch vụ</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                                options={filteredServices.map(service => ({
                                                  value: service.id,
                                                  label: service.name,
                                                }))}
                                                onSelect={handleSelectService}
                                                placeholder="Chọn dịch vụ"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                      
                                  
                                          <FormField 
                                        control={form.control}
                                        name="room_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Phòng</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                                options={filteredRooms.map(room => ({
                                                  value: room.id,
                                                  label: room.code,
                                                }))}
                                                onSelect={handleSelectRoom}
                                                placeholder="Chọn phòng"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                                    
                                        
                                      <Button className='w-[100px]' size="sm" variant="outline" onClick={form.handleSubmit(onSubmit)}>Lưu</Button>
                                    </div>
                                  </form>
                                  </Form>
                                   
                                      <Card x-chunk="dashboard-07-chunk-3" className='mt-8 '>
                                      <Button  className='m-5' size="sm" variant="outline" onClick={() => {
                                        if(servicePatients.length===0){
                                          alert('Vui lòng thêm dịch vụ cho bệnh nhân')
                                        }
                                        else{
                                          setConfirmSaveDialogOpen(true)
                                        }
                                        

                                      }}>Lưu dịch vụ</Button>
                                      <Button
                                        className="m-5"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleClickPrint}
                                      >
                                        In hóa đơn chỉ dịch vụ
                                      </Button>


                                            <Dialog open={isOpenInvoiceDialog} onOpenChange={setIsOpenInvoiceDialog}>
                                                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                                  <DialogHeader>
                                                    <DialogTitle>Hóa đơn dịch vụ</DialogTitle>
                                                  </DialogHeader>

                                                  {/* Gắn ref tại đây */}
                                                  <ServiceInvoicePrint
                                                    ref={printRef}
                                                    patient={patient}
                                                    servicePatients={servicePatients}
                                                  />

                                                  <div className="flex justify-end gap-2 mt-4">
                                                    <Button
                                                      variant="outline"
                                                      onClick={() => setIsOpenInvoiceDialog(false)}
                                                    >
                                                      Đóng
                                                    </Button>
                                                    <Button
                                                      onClick={() => {
                                                        printRef.current?.handlePrint();
                                                        setIsOpenInvoiceDialog(false);
                                                      }}
                                                    >
                                                      In hóa đơn
                                                    </Button>
                                                  </div>
                                                </DialogContent>
                                              </Dialog>

                                      <Button  className='m-5' size="sm" variant="outline" 
                                      
                                      onClick={() => {

                                        setIsAssignService(false)
                                        setServicePatients([]);
                                      }


                                      }>Hủy</Button>

                                <AlertDialog open={confirmSaveDialogOpen} onOpenChange={setConfirmSaveDialogOpen}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận thêm dịch vụ</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn thêm các dịch vụ vào hồ sơ bệnh án không? Hành động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setConfirmSaveDialogOpen(false)}>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setConfirmSaveDialogOpen(false);
                                          handleSaveConfirmed();
                                        }}
                                      >
                                      Xác nhận
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                                    <CardHeader className='pb-1'>
                                      
                                      <CardTitle>Danh sách các dịch vụ chỉ định</CardTitle>
                                      <CardDescription>
                                        Chỉ định các dịch vụ cho bệnh nhân
                                      </CardDescription>
                                      <div className='border-b'></div>
                                    </CardHeader>
                                    <CardContent >
                                    <div className="flex item-center justify-center w-full">
                                      <LoadingWrapper loading={loading}>
                                        <DataTable
                                          data={servicePatients}
                                          columns={columnServicePatient}
                                          totalRecords={servicePatients?servicePatients.length:0}
                                          pageIndex={pageIndex}
                                          pageSize={limit}
                                          onPageChange={setPageIndex}
                                        />
                                      </LoadingWrapper>
                                    </div>
                                    </CardContent>
                                    </Card>
                                  </CardContent>
                                </Card>
                                )
                               }
                                {
                                  isConclusion&&(
                                    <Card x-chunk="dashboard-07-chunk-3">
                                <div className='grid grid-cols-3 gap-5'>
                                  <Card className='col-span-1'>
                                <CardHeader className='pb-4 border-b mb-4'>
                                      <CardTitle>Nhận xét của bác sĩ</CardTitle>
                                      <CardDescription>
                                        Nhận xét, Chẩn đoán bệnh tình
                                      </CardDescription>
                                    </CardHeader >
                                  
                                    <CardContent className="space-y-2">
                                    <Form {...formUpdateDiagnose}>
                                    <form onSubmit={formUpdateDiagnose.handleSubmit(onSubmitDiagnose)}>
                                        <div className="mb-6 border-b max-w-[600px]">
                                            <h3 className="text-lg font-bold mb-4">Nhận xét của bác sĩ</h3>
                                          <FormField
                                              control={formUpdateDiagnose.control}
                                              name="diagnosis"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Chẩn đoán</FormLabel>
                                                  <FormControl>
                                                    <Textarea
                                                      {...field}
                                                      placeholder="Nhập Chẩn đoán"
                                                      disabled={!isEditing} // Khóa khi không chỉnh sửa
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          <FormField
                                              control={formUpdateDiagnose.control}
                                              name="notes"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Ghi chú</FormLabel>
                                                  <FormControl>
                                                    <Textarea
                                                      {...field}
                                                      placeholder="Uống đủ nước, ăn nhiều rau, thường xuyên tiếp xúc với ánh nắng"
                                                      disabled={!isEditing} // Khóa khi không chỉnh sửa
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                          <FormField
                                            control={formUpdateDiagnose.control}
                                            name="apointment_date"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Ngày tái khám</FormLabel>
                                                <FormControl>
                                                  <Popover>
                                                    <PopoverTrigger asChild>
                                                      <Button
                                                        disabled={!isEditing}
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
                                                        toYear={new Date().getFullYear() + 10}
                                                        disabled={{
                                                          before: new Date(), // Chặn ngày trước hôm nay
                                                        }}
                                                        className="custom-daypicker"
                                                      />
                                                                    </PopoverContent>
                                                  </Popover>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />

                                        </div> 
                                        
                                      </form>

                                  </Form>

                                  <Button variant="outline" className='mr-5'  onClick={() => 
                                    {
                                      setMedicationDetails([]);
                                      setPrescriptionVisible(!isPrescriptionVisible)
                                    }
                                  }> Kê thuốc</Button>
                                  <Button variant="outline" className='mr-5'  disabled={!isEditing} onClick={formUpdateDiagnose.handleSubmit(onSubmitDiagnose)}> Lưu thông tin</Button>
                                  <Button variant="outline" className='mr-5'  disabled={isSaveDisabled} onClick={handleEditInformation}> Sửa thông tin</Button>
                                  <Button variant="outline" className='mr-5'  disabled={isSaveDisabled} onClick={handleSaveDedicalRecordPatient}> Lưu hồ sơ</Button>
                                  <Button  className='m-5' size="sm" variant="outline" 
                                  onClick={() => {
                                    setIsConclusion(false)
                                    setMedicationDetails([])
                                  }

                                  }>Hủy</Button>

                        
                                  </CardContent>
                                  </Card> 
                                  {isPrescriptionVisible && (                               
                                  <Card className='mb-5 pt-5 col-span-2'>
                                    <CardContent>
                                      <Dialog open={isOpenAddMedication} onOpenChange={setIsOpenAddMedication}
                                    >
                                    <Form {...formCreateMedication}>
                                      <form onSubmit={formCreateMedication.handleSubmit(onSubmitCreateMedication)}>
                                          <DialogContent className="sm:max-w-[600px]">
                                          <DialogTrigger asChild>
                                        </DialogTrigger>
                                            <DialogHeader>
                                              <DialogTitle>Kê đơn thuốc</DialogTitle>
                                            </DialogHeader>
                                              <div className="grid gap-3">
                                                <div className="grid grid-cols-2 gap-4">
                        
                        
                                              <FormItem className="flex flex-col">
                                                <FormLabel className="mr-2">Nhóm dược</FormLabel>
                                                <FormControl className="flex-grow">
                                                  <Combobox<number>
                                                  options={
                                                    medicationCatalogues.map(medicationCatalogue => ({
                                                      value: Number(medicationCatalogue.id),
                                                      label: `${"|---".repeat(medicationCatalogue.level)}${medicationCatalogue.name}`,
                                                    }))}
                                                  placeholder="Chọn nhóm dược cha"
                                                  onSelect={handleSelectMedicationCatalogue}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                          
                                                  <FormField 
                                                    control={formCreateMedication.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                      <FormItem className="flex flex-col">
                                                        <FormLabel className="mr-2">Dược</FormLabel>
                                                        <FormControl className="flex-grow">
                                                          <Combobox<bigint>
                                                            options={medications.map(me => ({
                                                              value: me.id,
                                                              label: me.name,
                                                            }))}
                                                              placeholder="Chọn được"
                                                              onSelect={handleSelectMedication}
                                                          />
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )}
                                                  />
                                                  <FormField
                                                      control={formCreateMedication.control}
                                                      name="dosage"
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel>Số lượng kê</FormLabel>
                                                          <FormControl>
                                                            <Input
                                                              {...field}
                                                            
                                                              placeholder="Example: 80"
                                                              type="number"
                                                              onChange={(e) => {
                                                                // Chuyển giá trị từ chuỗi thành number trước khi lưu vào state của form
                                                                const newValue = e.target.value ? parseFloat(e.target.value) : undefined;
                                                                field.onChange(newValue);
                                                              }}
                                                            />
                                                          </FormControl>
                                                          <FormMessage />
                                                        </FormItem>
                                                      )}
                                                      />
                                                  <FormField
                                                    control={formCreateMedication.control}
                                                    name="measure"
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel>Đơn vị</FormLabel>
                                                        <FormControl>
                                                          <Input
                                                            {...field}
                                      
                                                            placeholder="Example:viên"
                                                            type="text"
                                                          />
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )}
                                                    />
                                                </div>
                                                <FormField
                                                  control={formCreateMedication.control}
                                                  name="description"
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Ghi chú</FormLabel>
                                                      <FormControl>
                                                        <Textarea
                                                          {...field}
                                                          placeholder="Example: Uống sau ăn, 2 viên 1 lần"                               />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <Button type='submit' onClick={formCreateMedication.handleSubmit(onSubmitCreateMedication)}>Lưu thuốc</Button>
                                              </div>           
                                          </DialogContent>
                                        </form>
                                    </Form>
                                      </Dialog>
                                    
                                      <Card className='mb-5 mt-5'>
                                      <CardHeader className='pb-4 border-b mb-4'>
                                        <CardTitle>Chi tiết đơn thuốc của bệnh nhân</CardTitle>
                                        <CardDescription>
                                          Thông tin đơn thuốc bác sĩ đã kê
                                        </CardDescription>
                                      </CardHeader >
                                    
                                      <CardContent className="space-y-2">
                                      <div className="flex flex-col gap-1 border-b pb-5">
                                            <div className="mb-6 border-b">
                                              <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
                                            </div>
                                          </div>
                                          <div className='flex mt-5 justify-between'>
                                    
                                        <Combobox<number>
                                        options={numberOptions}
                                        onSelect={handleSelecLimit}
                                        placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                                        />
                              

                                      <div className="flex items-center space-x-5">
                                            <div className='flex'>
                                          
                                            </div>
                                            <div className="flex items-center space-x-2 bg-white">
                                              <Input type="text" placeholder="Tìm kiếm" 
                                                value={keyword} // Đặt giá trị từ state keyword
                                                onChange={(e) => setKeyword(e.target.value)}
                                              />
                                              <Button type="submit">Lọc</Button>
                                              <Button variant="outline" onClick={()=>{setIsOpenAddMedication(true)}}>Thêm thuốc</Button>
                                            </div>
                                      </div>
                                      </div>
                                      <div className="flex item-center justify-center w-full">
                                          <LoadingWrapper loading={loading}>
                                            <DataTable
                                              data={medicationDetails}
                                              columns={columnMedicationDetail}
                                              totalRecords={medicationDetails?medicationDetails.length:0}
                                              pageIndex={pageIndex}
                                              pageSize={limit}
                                              onPageChange={setPageIndex}
                                            />
                                          </LoadingWrapper>
                                        </div>
                                      </CardContent>
                                    </Card> 
                                      </CardContent>
                                      <AlertDialog open={!!deleteMedicationDetail} onOpenChange={() => setDeleteMedicationDetail(undefined)}>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Hành động này không thể hoàn tác. Bạn đang xóa thuốc:{" "}
                                              <strong>{deleteMedicationDetail?.name}</strong>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setDeleteMedicationDetail(undefined)}>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>

                                  </Card>
                                      )}
                              </div>
                                </Card>
                                  )
                                }

                            </div>
                          
                        </div>
                 
                  </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="HistoryMedicalRecordDetail">
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Tiền sử khám bệnh của bệnh nhân</CardTitle>
                <CardDescription>
                  Thông tin lịch sử khám bệnh: {medicalRecordHistoryDetails.length>0?"Lịch sử đã khám":"Lần đầu khám"}
                </CardDescription>
                <div className='grid grid-cols-3 gap-4 border-t'>
                  <div className="grid grid-cols-1 p-4 ">
                  <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                  <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                  <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                  <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                  <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                  <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                  <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                  <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>

                    </div>
                </div>
              </CardHeader >
             
               <CardContent className="space-y-2">
            <div className='flex flex-col item-center justify-center w-full'>
                <CardTitle>Danh sách các lần khám</CardTitle>
                <CardDescription>
                  Thông tin khám bệnh của bệnh nhân
                </CardDescription>
                <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={medicalRecordHistoryDetails}
                        columns={columnMedicalHistoryDetail}
                        totalRecords={medicalRecordHistoryDetails?medicalRecordHistoryDetails.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
                  </div>
              </div>
              </CardContent>
              <Dialog open={isOpenDialogMedicalRecordHistory} onOpenChange={setIsOpenDialogMedicalRecordHistory}>
            <DialogContent className="w-[1200px] max-w-full max-h-[700px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle> Thông tin chi tiết đợt khám</DialogTitle>
              <DialogDescription>Thông tin chi tiết các dịch vụ sử dụng, kết quả, đơn thuốc được kê</DialogDescription>
            </DialogHeader>
              <Card className='mb-5 mt-5'>
                <CardHeader className='pb-4 border-b mb-4'>
                  <CardTitle>Thông tin chi tiết của bệnh nhân</CardTitle>
                  <CardDescription>
                    Chi tiết các thông tin cá nhân của bệnh nhân
                  </CardDescription>
                  <div className='grid grid-cols-3 gap-4 border-t'>
                    <div className="grid grid-cols-1 p-4 ">
                    <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                  <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                  <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                  <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                  <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                  <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                  <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                  <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>

                      </div>
                    <div className="grid grid-cols-1 p-4 ">
                          <div> <strong>Thông tin chung</strong></div>
                          <div><strong>Bác sĩ khám:</strong> {medicalRecordHistoryDetailItem?.user_name}</div>
                          <div><strong>Ngày vào khám:</strong> {medicalRecordHistoryDetailItem?.visit_date ? formatDateCustom(medicalRecordHistoryDetailItem?.visit_date) : 'Ngày không xác định'}</div>

                        
                      </div>
                      <div className="grid grid-cols-1 p-4">
                          <div> <strong>Bác sĩ nhận xét</strong></div>
                          <div><strong>Chẩn đoán: </strong> {medicalRecordHistoryDetailItem?.diagnosis||"Chưa chẩn đoán"}</div>
                          <div><strong>Ghi chú: </strong> {medicalRecordHistoryDetailItem?.notes||"Chưa có ghi chú"}</div>
                          <div><strong>Ngày hẹn tái khám: </strong> {medicalRecordHistoryDetailItem?.appointment_date ? formatDateCustom( medicalRecordHistoryDetailItem?.visit_date) : 'Ngày không xác định'}</div>
                      </div>
                  </div>
                  
                </CardHeader >
              
                <CardContent className="space-y-2">
                {
                  serviceDetailPatients?.length > 0 && 
                  <div>
                  <div className="flex flex-col gap-1 border-b pb-5">
                  <div className="mb-6 border-b">
                    <h3 className="text-lg font-bold">Dịch Vụ Đã Thực Hiện</h3>
                
                </div>  
                  </div>
                  <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={servicePatientNotInTreatmentSessions}
                        columns={columnServiceDetails}
                        totalRecords={servicePatientNotInTreatmentSessions?servicePatientNotInTreatmentSessions.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
                  </div>
                </div>
                }
              
                <Dialog open={isOpenDialogServiceDetailResult} onOpenChange={setIsOpenDialogServiceDetailResult} 
              >
                
              
              <DialogContent className="w-[1200px] max-w-full overflow-y-auto">
              <DialogHeader>
                <DialogTitle> Kết quả {seletedService?.name}</DialogTitle>
                <DialogDescription>Thông tin chi tiết {seletedService?.description}</DialogDescription>
              </DialogHeader>
                <div className="flex item-center justify-center w-full">
                  <LoadingWrapper loading={loading}>
                    <DataTable
                      data={detailResultSelectedService}
                      columns={columnServiceDetailsResult}
                      totalRecords={detailResultSelectedService?detailResultSelectedService.length:0}
                      pageIndex={pageIndex}
                      pageSize={limit}
                      onPageChange={setPageIndex}
                    />
                  </LoadingWrapper>
                </div>

        

              <DialogFooter>
              </DialogFooter>
              </DialogContent>
              </Dialog>

                </CardContent>
              </Card>
              {
                medicationDetails?.length > 0 && 
                <Card className='mb-5 mt-5'>
                  <CardHeader className='pb-4 border-b mb-4'>
                    <CardTitle>Chi tiết đơn thuốc ủa bệnh nhân</CardTitle>
                    <CardDescription>
                      Thông tin đơn thuốc bác sĩ đã kê
                    </CardDescription>
                  </CardHeader >
                
                  <CardContent className="space-y-2">
                  <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
                        </div>
                      </div>
                      <div className="flex item-center justify-center w-full">
                        <LoadingWrapper loading={loading}>
                          <DataTable
                            data={medicationPatientNotInTreatmentSessions}
                            columns={columnMedicationDetailHistory}
                            totalRecords={medicationPatientNotInTreatmentSessions?medicationPatientNotInTreatmentSessions.length:0}
                            pageIndex={pageIndex}
                            pageSize={limit}
                            onPageChange={setPageIndex}
                          />
                        </LoadingWrapper>
                      </div>
                  </CardContent>
                </Card> 

              }
              {treatmentSessionList&&treatmentSessionList?.length > 0 &&
                <Card className='mb-5 mt-5 overflow-x-auto w-full'>
                <CardHeader className='pb-4 border-b mb-4'>
                  <CardTitle>Thông tin điều trị của bệnh nhân</CardTitle>
                  <CardDescription>
                    Chi tiết thông tin điều trị
                  </CardDescription>
                </CardHeader >
              <CardContent className="space-y-2">
                    <div className="flex item-center justify-center w-full">
                      <LoadingWrapper loading={loading}>
                        <DataTable
                          data={treatmentSessionList}
                          columns={columnTreatmentSession}
                          totalRecords={treatmentSessionList?treatmentSessionList.length:0}
                          pageIndex={pageIndex}
                          pageSize={limit}
                          onPageChange={setPageIndex}
                        />
                      </LoadingWrapper>
                    </div>
                <Dialog open={isOpenDialogMedicalRecordHistoryTreatmentSessionDetail} onOpenChange={setIsOpenDialogMedicalRecordHistoryTreatmentSessionDetail} 
              >
                
              
              <DialogContent className="w-[1200px] max-w-full max-h-[700px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle> Thông tin đợt điều trị</DialogTitle>
                <DialogDescription>Thông tin chi tiết đợt điều trị</DialogDescription>
                <div className='grid grid-cols-3 gap-4 border-t'>
                    <div className="grid grid-cols-1 p-4 ">
                    <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                  <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                  <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                  <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                  <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                  <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                  <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                  <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>

                      </div>
                    <div className="grid grid-cols-1 p-4 ">
                          <div> <strong>Thông tin chung</strong></div>
                          <div><strong>Bác sĩ phụ trách:</strong> {treatmentSessionDetail?.user_name}</div>
                          <div><strong>Khoa điều trị:</strong> {treatmentSessionDetail?.department_name}</div>
                          <div><strong>Phòng điều trị:</strong> {treatmentSessionDetail?.room_code}</div>
                          <div><strong>Giường:</strong> {treatmentSessionDetail?.bed_code}</div>
                          <div><strong>Ngày bắt đầu:</strong> {treatmentSessionDetail?.start_date ? formatDateCustom(treatmentSessionDetail?.start_date) : 'Ngày không xác định'}</div>
                          <div><strong>Ngày kết thúc:</strong> {treatmentSessionDetail?.end_date ? formatDateCustom(treatmentSessionDetail?.end_date) : 'Ngày không xác định'}</div>
                          <div><strong>Viện phí:</strong> {treatmentSessionDetail?.current_cost?? 'Chưa có'}</div>
                          <div><strong>Viện phí tạm ứng:</strong> {treatmentSessionDetail?.total_advance_payment?? 'Chưa có'}</div>
                          <div><strong>Tiền hoàn lại:</strong> {treatmentSessionDetail?.refunded_amount?? 'Chưa có'}</div>
                          <div><strong>Trạng thái thanh toán:</strong> {treatmentSessionDetail?.payment_status_treatment_session===1?"Đã thanh toán": 'Chưa thanh toán'}</div>
                          <div><strong>Trạng thái điều trị:</strong> {treatmentSessionDetail?.status_treatment_session===1?"Đã kết thúc": 'Đang điều trị'}</div>

                        
                      </div>
                      <div className="grid grid-cols-1 p-4">
                          <div> <strong>Bác sĩ nhận xét</strong></div>
                          <div><strong>Chẩn đoán: </strong> {treatmentSessionDetail?.diagnosis||"Chưa chẩn đoán"}</div>
                          <div><strong>Ghi chú: </strong> {treatmentSessionDetail?.notes||"Chưa ghi chú"}</div>
                          <div><strong>Kết luận sau điều trị: </strong> {treatmentSessionDetail?.conclusion_of_treatment||"Chưa kết luận"}</div>
                      </div>
                </div>

                
              </DialogHeader>
              <Card className='mb-5 mt-5'>
                  <CardHeader className='pb-4 border-b mb-4'>
                    <CardTitle>Chỉ định của bác sĩ</CardTitle>
                    <CardDescription>
                      Thông tin chi tiết về các chỉ định của bác sĩ các dịch vụ hoặc đơn thuốc được chỉ định.
                    </CardDescription>
                  </CardHeader >
                
                  <CardContent className="space-y-2">
                  <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Thông tin chỉ định của bác sĩ</h3>
                        </div>
                      </div>
                      <div className="flex item-center justify-center w-full">
                        <LoadingWrapper loading={loading}>
                          <DataTable
                            data={treatmentSessionDetailMedicalOrderList ?? []}
                            columns={columnMedicalOrder}
                            totalRecords={treatmentSessionDetailMedicalOrderList?treatmentSessionDetailMedicalOrderList.length:0}
                            pageIndex={pageIndex}
                            pageSize={limit}
                            onPageChange={setPageIndex}
                          />
                        </LoadingWrapper>
                      </div>
                  </CardContent>
                </Card> 
              <Card className='mb-5 mt-5'>
                  <CardHeader className='pb-4 border-b mb-4'>
                    <CardTitle>Kết quả theo dõi hằng ngày</CardTitle>
                    <CardDescription>
                      Chi tiết các chỉ số sức khỏe theo dõi bệnh nhân hằng ngày bao gồm các chỉ số về huyết áp, nhịp tim, nhiệt độ, theo dõi sau phẫu thuật....
                    </CardDescription>
                  </CardHeader >
                
                  <CardContent className="space-y-2">
                  <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Thông tin chi tiết về chỉ số sức khỏe</h3>
                        </div>
                      </div>
                      <div className="flex item-center justify-center w-full">
                        <LoadingWrapper loading={loading}>
                        <DataTable 
                          data={treatmentSessionDetailMedicalDailyHealthList ?? []} // Nếu là undefined, sẽ dùng mảng rỗng
                          columns={columnDailyHealth}
                          totalRecords={treatmentSessionDetailMedicalDailyHealthList?treatmentSessionDetailMedicalDailyHealthList.length:0}
                          pageIndex={pageIndex}
                          pageSize={limit}
                          onPageChange={setPageIndex}
                        />
                        </LoadingWrapper>
                      </div>
                  </CardContent>
              </Card> 
              <DialogFooter>
              </DialogFooter>
              </DialogContent>
              </Dialog>
              </CardContent>
              </Card>
              }

                <Dialog open={isOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderService} onOpenChange={setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderService} 
              >
                
              
              <DialogContent className="w-[1200px] max-w-full overflow-y-auto">
              <DialogHeader>
                <DialogTitle> Dịch Vụ Đã Thực Hiện</DialogTitle>
                <DialogDescription>Các dịch vụ đã được chỉ định</DialogDescription>
              </DialogHeader>
              <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={servicePatientTreatmentSessions}
                        columns={columnServiceDetails}
                        totalRecords={servicePatientTreatmentSessions?servicePatientTreatmentSessions.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
              </div>

        

              <DialogFooter>
              </DialogFooter>
              </DialogContent>
              </Dialog>
                <Dialog open={isOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderMedicaTion} onOpenChange={setIsOpenDialogMedicalRecordHistoryTreatmentSessionMedicalOrderMedication} 
              >
                
              
              <DialogContent className="w-[1200px] max-w-full overflow-y-auto">
              <DialogHeader>
                <DialogTitle> Đơn thuốc đã được chỉ định</DialogTitle>
                <DialogDescription>Chi tiết đơn thuốc được chỉ định</DialogDescription>
              </DialogHeader>
              <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={medicationPatientTreatmentSessions}
                        columns={columnMedicationDetailHistory}
                        totalRecords={medicationPatientTreatmentSessions?medicationPatientTreatmentSessions.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
              </div>

        

              <DialogFooter>
              </DialogFooter>
              </DialogContent>
              </Dialog>
            </DialogContent>
              </Dialog>
          </Card>
          </TabsContent> 
          </Tabs>
          </div>
      </main>
)};

export default PatientReceive;