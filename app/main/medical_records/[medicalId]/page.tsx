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
import { MedicalRecord, PatientCurrently, PatientPaymentInfo, PatientServiceInfo, ServiceInfo, UserInfoType } from '@/types';
import { useRouter,useParams } from 'next/navigation'
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
const billsData = [
    {
        id: 1,
        total_price: 5000000,
        patient_id: 1,
        status: 1,
        created_at: "2024-10-10T10:00:00Z",
        updated_at: "2024-10-10T10:00:00Z",
    },
    {
        id: 2,
        total_price: 3000000,
        patient_id: 1,
        status: 0,
        created_at: "2024-10-15T11:30:00Z",
        updated_at: "2024-10-15T11:30:00Z",
    },
    {
        id: 3,
        total_price: 4500000,
        patient_id: 2,
        status: 1,
        created_at: "2024-10-12T09:00:00Z",
        updated_at: "2024-10-12T09:00:00Z",
    },
    {
        id: 4,
        total_price: 7000000,
        patient_id: 3,
        status: 1,
        created_at: "2024-10-14T14:00:00Z",
        updated_at: "2024-10-14T14:00:00Z",
    },
    {
        id: 5,
        total_price: 2500000,
        patient_id: 4,
        status: 0,
        created_at: "2024-10-20T08:15:00Z",
        updated_at: "2024-10-20T08:15:00Z",
    },
    {
        id: 6,
        total_price: 8000000,
        patient_id: 5,
        status: 1,
        created_at: "2024-10-21T10:45:00Z",
        updated_at: "2024-10-21T10:45:00Z",
    },
];
const billDetailsData = [
    {
        id: 1,
        bill_id: 1,
        model_id: 101,
        model_name: "Dịch vụ khám bệnh",
        price: 2000000,
        health_insurance_applied: 1,
        health_insurance_value: 20,
    },
    {
        id: 2,
        bill_id: 1,
        model_id: 102,
        model_name: "Xét nghiệm máu",
        price: 1500000,
        health_insurance_applied: 1,
        health_insurance_value: 15,
    },
    {
        id: 3,
        bill_id: 2,
        model_id: 103,
        model_name: "Khám chuyên khoa",
        price: 3000000,
        health_insurance_applied: 0,
        health_insurance_value: 0,
    },
    {
        id: 4,
        bill_id: 3,
        model_id: 104,
        model_name: "Siêu âm",
        price: 2500000,
        health_insurance_applied: 1,
        health_insurance_value: 10,
    },
    {
        id: 5,
        bill_id: 3,
        model_id: 105,
        model_name: "Dịch vụ xét nghiệm nước tiểu",
        price: 2000000,
        health_insurance_applied: 1,
        health_insurance_value: 15,
    },
    {
        id: 6,
        bill_id: 4,
        model_id: 106,
        model_name: "Thăm khám định kỳ",
        price: 1500000,
        health_insurance_applied: 1,
        health_insurance_value: 25,
    },
    {
        id: 7,
        bill_id: 4,
        model_id: 107,
        model_name: "Dịch vụ điều trị vật lý trị liệu",
        price: 5500000,
        health_insurance_applied: 0,
        health_insurance_value: 0,
    },
    {
        id: 8,
        bill_id: 5,
        model_id: 108,
        model_name: "Khám lần đầu",
        price: 2500000,
        health_insurance_applied: 1,
        health_insurance_value: 5,
    },
    {
        id: 9,
        bill_id: 6,
        model_id: 109,
        model_name: "Dịch vụ xét nghiệm di truyền",
        price: 7000000,
        health_insurance_applied: 1,
        health_insurance_value: 30,
    },
    {
        id: 10,
        bill_id: 6,
        model_id: 110,
        model_name: "Khám tổng quát",
        price: 1000000,
        health_insurance_applied: 1,
        health_insurance_value: 10,
    },
];

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
  const patientExaminations = [
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
    },
    {
      id: 2,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
    },
    {
      id: 3,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
    },
    {
      id: 4,
      reason: "Đau bụng",
      doctor: "Bác sĩ Trần Thị B",
      diagnosis: "Viêm ruột thừa",
      conclusion: "Cần phẫu thuật",
      admissionDate: "2024-10-26",
      dischargeDate: "",
      followUpDate: "2024-11-05",
      inpatientTreatment: false,
      followUpStatus: "Chưa tái khám",
    },
  ];

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
const columnServiceHeaderMap: { [key: string]: string } = {
    serviceName: "Dịch vụ",
    department: "khoa",
    room: "Phòng",
    referringDoctor: "Bác sĩ chỉ định",
    servicePrice: "Giá dịch vụ",
    insuranceApplicable:"Áp dụng bảo hiểm",
    insuranceCoveragePercentage:"Phần trăm",
    amountDue:"Giá tiền thanh toán",
    paymentStatus:"Trạng thái thanh toán",
    examination_status:"Trạng thái khám dịch vụ"
  // Add more mappings as needed
};
const columnMedicalRecordMedicationHeaderMap: { [key: string]: string } = {
    medicationName:"Tên thuốc",
    dosage:"Đơn vị",
    frequency:"Liều lượng",
    duration:"Số ngày dùng",
    notes:"Ghi chú",
  // Add more mappings as needed
};
const columnInpatientHeaderMap: { [key: string]: string } = {
    department:"Khoa điều trị",
    room:"Phòng",
    bed:"Giường",
    treatingDoctor:"Bác sĩ điều trị",
    start_date:"ngày vào",
    end_date:"ngày ra",
    reasonForTreatment:"Tình trạng bệnh",
    treatmentStatus: "Tình trạng điều trị",
    notes: "Ghi chú",
  // Add more mappings as needed
};
const columnPaymentHeaderMap: { [key: string]: string } = {
    billId: "ID Hóa Đơn",
    totalPrice: "Tổng Tiền",
    status: "Trạng Thái",
    createdAt: "Ngày Tạo",
    modelName: "Tên Đối Tượng",
    price: "Giá",
    healthInsuranceApplied: "Bảo Hiểm Y Tế",
    healthInsuranceValue: "Giá Trị Bảo Hiểm",
};


const inpatientTreatmentData:any = [
    {
        id: 1,
        department: "Nội khoa",
        room: "Phòng 101",
        bed: "Giường 1",
        treatingDoctor: "Bác sĩ Nguyễn Văn A",
        start_date: "2024-10-05",
        end_date: "2024-10-12",
        reasonForTreatment: "Viêm phổi nặng",
        treatmentStatus: "Đang điều trị",
        notes: "Bệnh nhân cần theo dõi thường xuyên.",
    },
    {
        id: 2,
        department: "Ngoại khoa",
        room: "Phòng 202",
        bed: "Giường 2",
        treatingDoctor: "Bác sĩ Trần Thị B",
        start_date: "2024-10-10",
        end_date: "2024-10-15",
        reasonForTreatment: "Phẫu thuật ruột thừa",
        treatmentStatus: "Đã xuất viện",
        notes: "Bệnh nhân đã hồi phục tốt.",
    },
    {
        id: 3,
        department: "Nhi khoa",
        room: "Phòng 305",
        bed: "Giường 3",
        treatingDoctor: "Bác sĩ Lê Văn C",
        start_date: "2024-10-01",
        end_date: "2024-10-08",
        reasonForTreatment: "Sốt virus",
        treatmentStatus: "Đang điều trị",
        notes: "Bệnh nhân cần được theo dõi triệu chứng.",
    },
    // Thêm dữ liệu mẫu khác nếu cần
];
const patientServiceData: PatientServiceInfo[] = [
    {
        id: BigInt(1),
      serviceName: "Xét nghiệm máu",
      department: "Huyết học",
      room: "101",
      referringDoctor: "Bác sĩ Nguyễn Văn K",
      servicePrice: 500000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 80,
      amountDue: 100000,
      paymentStatus: 1,
      examination_status:1,
    },
    {
        id: BigInt(2),
      serviceName: "Chụp X-quang",
      department: "Chẩn đoán hình ảnh",
      room: "202",
      referringDoctor: "Bác sĩ Trần Thị M",
      servicePrice: 300000,
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      amountDue: 300000,
      paymentStatus: 0,
      examination_status:1,
      
    },
    {
        id: BigInt(3),
      serviceName: "Khám tổng quát",
      department: "Nội tổng hợp",
      room: "305",
      referringDoctor: "Bác sĩ Lê Văn N",
      servicePrice: 700000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 50,
      amountDue: 350000,
      paymentStatus: 1,
      examination_status:1,
      
    },
    {
        id: BigInt(4),
      serviceName: "Soi dạ dày",
      department: "Tiêu hóa",
      room: "405",
      referringDoctor: "Bác sĩ Phạm Thị P",
      servicePrice: 1200000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 70,
      amountDue: 360000,
      paymentStatus: 1,
      examination_status:1,
      
    },
    {
        id: BigInt(5),
      serviceName: "Phẫu thuật ruột thừa",
      department: "Ngoại khoa",
      room: "501",
      referringDoctor: "Bác sĩ Lê Văn Q",
      servicePrice: 5000000,
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      amountDue: 5000000,
      paymentStatus: 0,
      examination_status:1,
      
    },
    // Thêm 5 bộ dữ liệu nữa
  ];
  const medicationsPrescribed:any = [
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
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
  

 const {medicalId}=useParams();
 const medicalIdBigInt = Array.isArray(medicalId) ? BigInt(medicalId[0]) : BigInt(medicalId);
  const medicalInfor:any = patientExaminations.find((medicalRecord) => BigInt(medicalRecord.id) === medicalIdBigInt);
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
  const addService = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
  // Cấu hình cho cột nút

//   const column = patientServiceData.length > 0 
//   ? createColumns(patientServiceData,
//     undefined, // onView
//     undefined, // onEdit
//     undefined, // onDelete
//     columnHeaderMap, // Cấu hình tiêu đề cột
//     undefined, // actionButtonsConfig
//     undefined, // switchConfig
//     buttonColumnConfig, // Cấu hình cho cột nút) 
//   ): [];
const buttonColumnConfig = {
    id: 'customButton',
    header: 'Kết quả',
    onClickConfig: (id: string | BigInt) => {
      // Điều hướng đến trang chi tiết cho bệnh nhân
    //   const item: PatientService | undefined = patientServiceData.find(patient => patient.id === id);
    //   router.push(`/main/services/${item?.service_id}/${id}`);
    },
    content: 'Xem kết quả',
  };
const buttonColumnConfigInpatient = {
    id: 'customButton',
    header: 'Xem chi tiết',
    onClickConfig: (id: string | BigInt) => {
      // Điều hướng đến trang chi tiết cho bệnh nhân
    //   const item: PatientService | undefined = patientServiceData.find(patient => patient.id === id);
    //   router.push(`/main/services/${item?.service_id}/${id}`);
    },
    content: 'Chi tiết',
  };
const currentDate = new Date();
const currentExaminationIndex = patientExaminations.findIndex((examination) => {
    const admissionDate = new Date(examination.admissionDate);
    const dischargeDate = examination.dischargeDate ? new Date(examination.dischargeDate) : null;
    return admissionDate < currentDate && (!dischargeDate || dischargeDate > currentDate);
  });
  const handleNavigate = (examinationId:any) => {
    router.push(`/medical_records/${examinationId}`); // Điều hướng đến trang chi tiết lần khám
};
const columnService = patientServiceData.length > 0 ? createColumns(patientServiceData,undefined, undefined, undefined, columnServiceHeaderMap,undefined,undefined,buttonColumnConfig ) : [];
const columnMedication = medicationsPrescribed.length > 0 ? createColumns(medicationsPrescribed,undefined, undefined, undefined, columnMedicalRecordMedicationHeaderMap) : [];
const columnInpatient = inpatientTreatmentData.length > 0 ? createColumns(inpatientTreatmentData,undefined, undefined, undefined, columnInpatientHeaderMap,undefined, undefined,buttonColumnConfigInpatient) : [];
// Chuyển đổi chi tiết hóa đơn thành định dạng bảng
const paymentInfo = billsData.map(bill => {
    const details = billDetailsData.filter(detail => detail.bill_id === bill.id);
    return {
        billId: bill.id,
        totalPrice: bill.total_price,
        status: bill.status,
        createdAt: bill.created_at,
        details: details,
    };
});
const paymentTableData:any = paymentInfo.flatMap(payment => 
    payment.details.map(detail => ({
        billId: payment.billId,
        totalPrice: payment.totalPrice,
        status: payment.status,
        createdAt: payment.createdAt,
        modelName: detail.model_name,
        price: detail.price,
        healthInsuranceApplied: detail.health_insurance_applied ? "Có" : "Không",
        healthInsuranceValue: detail.health_insurance_value,
    }))
);  
const columnPayment = paymentTableData.length > 0 ? createColumns(paymentTableData, undefined, undefined, undefined, columnPaymentHeaderMap) : [];

return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Thông tin chi tiết khám</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 '>
                <CardTitle>Thông tin chi tiết của bệnh nhân</CardTitle>
                <CardDescription>
                  Chi tiết các thông tin cá nhân của bệnh nhân
                </CardDescription>
                <div className="mb-6 ">
                    <div><strong>Lý do khám:</strong> {medicalInfor.reason}</div>
                    <div><strong>Bác sĩ khám:</strong> {medicalInfor.doctor}</div>
                    <div><strong>Chuẩn đoán:</strong> {medicalInfor.diagnosis}</div>
                    <div><strong>Kết luận:</strong> {medicalInfor.conclusion}</div>
                    <div><strong>Ngày vào khám:</strong> {medicalInfor.admissionDate}</div>
                    <div><strong>Ngày ra:</strong> {medicalInfor.dischargeDate}</div>
                    <div><strong>Ngày tái khám:</strong> {medicalInfor.followUpDate}</div>
                    <div><strong>Điều trị nội trú:</strong> {medicalInfor.inpatientTreatment ? "Có" : "Không"}</div>
                    <div><strong>Tình trạng tái khám:</strong> {medicalInfor.followUpStatus}</div>
            </div>
              </CardHeader >
             
              <CardContent className="space-y-2">
              <div>
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className="mb-6 border-b">
                <h3 className="text-lg font-bold">Dịch Vụ Đã Thực Hiện</h3>
                {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
            </div>  
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
                    <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                   
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={patientServiceData}
                  columns={columnService}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                    console.log("pageindex:", newPageIndex)
                    setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                />
              </div>
              </div>
              
              <div>
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className="mb-6 border-b">
                <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
                {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
            </div>  
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
                    <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                   
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={medicationsPrescribed}
                  columns={columnMedication}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                    console.log("pageindex:", newPageIndex)
                    setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                />
              </div>
              </div>
              <div>
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className="mb-6 border-b">
                <h3 className="text-lg font-bold">Thông tin thanh toán</h3>
                {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
            </div>  
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
                    <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                   
              </div>
              </div>
              </div>
              <div>
              <DataTable
                    data={paymentTableData}
                    columns={columnPayment}
                    totalRecords={paymentTableData.length}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                        console.log("pageindex:", newPageIndex);
                        setPageIndex(newPageIndex); // Cập nhật pageIndex với giá trị mới
                    }}
                />
              </div>
              </div>
              <div>
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className="mb-6 border-b">
                <h3 className="text-lg font-bold">Thông tin nội trú</h3>
                {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
            </div>  
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
                    <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                   
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={inpatientTreatmentData}
                  columns={columnInpatient}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                    console.log("pageindex:", newPageIndex)
                    setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                />
              </div>
              </div>


            {/* Bảng Thanh toán */}
            <div className="mb-6">
                <h3 className="text-lg font-bold">Thông Tin Thanh Toán</h3>
                {/* Thêm mã hiển thị bảng thanh toán ở đây */}
            </div>
  
              </CardContent>  
            


          


            </Card >
          </div>
      </main>
  );
};

export default PaymentPage;