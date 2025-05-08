"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."

import React, { useEffect, useMemo, useState, useTransition } from 'react'
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
import { AdvancePaymentBill, Bill, BillDetail, DepartmentType, MedicalRecord, MedicalRecordNewpatient, Patient, PatientBill, PatientCurrently, RoomCatalogueType, RoomType, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, CalendarIcon, ChevronDownIcon, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, MedicalRecordSchema, PatientSchema, SaveAdvancePayment } from '@/schema';
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
import { Dialog, DialogFooter, DialogHeader,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import LoadingWrapper from '@/components/LoadingWrapper';

import {formatDateCustom} from '@/utils'


const columnBillHeaderMap: { [key: string]: string } = {
  patient_name: "Họ tên bệnh nhân",
  patient_phone: "Số điện thoại",
  patient_cccd: "CCCD",
  bill_type: "Loại hóa đơn",
  create_date:"Ngày tạo",
  total_price: "Tổng tiền",
  total_insurance_covered: "Bảo hiểm chi trả",
  total_pay: "Tiền đã thanh toán",
  total_amount_due: "Tổng cần thu",
  refunded_amount: "Hoàn trả",
  amount_due: "Còn phải thu",
  payment_status: "Trạng thái",
};
const columnAdvancePaymentBillHeaderMap: { [key: string]: string } = {
  patient_name: "Họ tên bệnh nhân",
  patient_phone: "Số điện thoại",
  patient_cccd: "CCCD",
  payment_date:"Ngày tạm ứng",
  amount_advance: "Số tiền tạm ứng",
  current_cost: "Chi phí hiện tại",
  total_advance_payment: "Tổng tạm ứng",
  refunded_amount: "Đã hoàn",
  payment_status_treatment_session: "Trạng thái thanh toán",
};


const columnBillDetailHeaderMap: { [key: string]: string } = {
  model_name: "Tên dịch vụ",
  unit: "Đơn vị",
  quantity: "Số lượng",
  price: "Đơn giá",
  total_price: "Thành tiền",
  total_insurance_covered: "Bảo hiểm chi trả",
  total_amount_due: "Cần thanh toán",
  health_insurance_applied: "Áp dụng BHYT",
  health_insurance_value: "Tỉ lệ BHYT (%)",
};


const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const statusOptions = [
  { value: 0, label: "Chưa thanh toán" },
  { value: 1, label: "Đã thanh toán" },
  { value: 2, label: "Tât cả" },
]
const Billing = () => {
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [pageIndex, setPageIndex] = useState(1);
  const [patient,setPatient]=useState<PatientBill>();
  
  const [bills,setBills]=useState<Bill[]>();
  const [billSelected,setBillSelected]=useState<Bill>();
  
  const [billDetails,setBillDetails]=useState<BillDetail[]>();
  const [advancePayment,setAdvancePayment]=useState<AdvancePaymentBill[]>();
  const [advancePaymentDetail,setAdvancePaymentDetail]=useState<AdvancePaymentBill>();
  const [amountToSubmit,setAmountToSubmit]=useState<Number>();

  const [loading, setLoading] = useState(false);

  const [isOpenDialogBillDetail, setIsOpenDialogBillDetail] = useState(false);
  const [isOpenDialogSaveAdvancePayment, setIsOpenDialogSaveAdvancePayment] = useState(false);
  const [showConfirmDialogSaveAdvancePayment, setShowConfirmDialogSaveAdvancePayment] = useState(false);
  const [showConfirmDialogSaveBill, setShowConfirmDialogSaveBill] = useState(false);


  // action end treatment session
  const formSaveAdvancePayment=useForm<z.infer<typeof SaveAdvancePayment>>({
    resolver:zodResolver(SaveAdvancePayment),
    });

  const fetchBill = async () => {
    setLoading(true);
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/bills`;
    try {
      const response = await axios.get(endpoint, {
        params: {
          limit: limit, // Số bản ghi trên mỗi trang
          page: pageIndex, // Trang hiện tại
          status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
          keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
        },
      })
      const { data } = response.data.data;
      const bills: Bill[] = data.map((item: any) => ({
        id: BigInt(item.id),
        treatment_session_id: BigInt(item.treatment_session_id),
        patient_id: BigInt(item.patient_id),
        patient_name:item.patients.name,
        patient_phone:item.patients.phone,
        patient_cccd:item.patients.cccd_number,
        bill_type: item.bill_type,
        total_price: item.total_price,
        total_insurance_covered: item.total_insurance_covered,
        total_pay: item.total_paid,
        total_amount_due: item.total_amount_due,
        refunded_amount: item.refunded_amount,
        amount_due: item.amount_due,
        payment_status: item.status,
        create_date:item.createdAt,
        patients: {
          id: BigInt(item.patients.id),
          name: item.patients.name,
          birthday: item.patients.birthday,
          address: item.patients.address,
          phone: item.patients.phone,
          cccd_number: item.patients.cccd_number,
          health_insurance_code: item.patients.health_insurance_code,
          guardian_phone: item.patients.guardian_phone,
          gender: item.patients.gender,
          description: item.patients.description,
        },
        bill_details: item.bill_details.map((detail: any) => ({
          id: BigInt(detail.id),
          bill_id: BigInt(detail.bill_id),
          model_id: BigInt(detail.model_id),
          model_type: detail.model_type,
          model_name: detail.model_name,
          unit: detail.unit,
          quantity: detail.quantity,
          price: detail.price,
          total_price: detail.total_price,
          total_insurance_covered: detail.total_insurance_covered,
          total_amount_due: detail.total_amount_due,
          health_insurance_applied: detail.health_insurance_applied,
          health_insurance_value: detail.health_insurance_value||"0",
        })),
      }));
      setBills(bills)
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAdvance = async () => {
    setLoading(true);
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`;
      const response = await axios.get(endpoint, {
        params: {
          limit: limit, // Số bản ghi trên mỗi trang
          page: pageIndex, // Trang hiện tại
          status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
          keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
        },
      })
      const { data } = response.data.data;
      const advanceData: AdvancePaymentBill[] = data.flatMap((item: any) => {
        const patient = item.patients;
      
        return item.treatment_sessions?.map((session: any) => {
          const latestPaymentDate = session.advance_payments && session.advance_payments.length > 0
            ? session.advance_payments.reduce((latest: string, curr: any) => {
                return new Date(curr.payment_date) > new Date(latest) ? curr.payment_date : latest;
              }, session.advance_payments[0].payment_date)
            : null;
      
          return {
            id: BigInt(session.id),
            treatment_session_id: BigInt(session.id),
            patient_name: patient?.name || "",
            patient_phone: patient?.phone || "",
            patient_cccd: patient?.cccd_number || "",
            amount_advance: session.total_advance_payment || "0.00",
            current_cost: session.current_cost || "0.00",
            total_advance_payment: session.total_advance_payment || "0.00",
            refunded_amount: session.refunded_amount || "0.00",
            payment_status_treatment_session: session.payment_status || 0,
            payment_date: latestPaymentDate,
            patient: {
              id: BigInt(patient?.id || 0),
              name: patient?.name || "",
              birthday: patient?.birthday || "",
              address: patient?.address || "",
              phone: patient?.phone || "",
              cccd_number: patient?.cccd_number || "",
              health_insurance_code: patient?.health_insurance_code || "Không có",
              guardian_phone: patient?.guardian_phone || "",
              gender: patient?.gender || 0,
              description: patient?.description || null,
            },
          };
        }) || [];
      });
      
      
      setAdvancePayment(advanceData);
      }
     catch (error) {
      console.error("Error fetching advance payments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const onSubmitSaveAvancePayment = async (values: z.infer<typeof SaveAdvancePayment>) => {
    setAmountToSubmit(values.amount);
    setShowConfirmDialogSaveAdvancePayment(true); // chỉ mở xác nhận nếu chưa thanh toán đủ
  };
  
  
  const handleConfirmSubmit = async () => {
    if (!advancePaymentDetail?.treatment_session_id || !amountToSubmit) return;
  
    setLoading(true);
    const payload = {
      treatment_session_id: Number(advancePaymentDetail.treatment_session_id),
      amount: amountToSubmit,
    };
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/treatmentSessions/createPivotAdvancePayment`,
        payload,
        { timeout: 5000 }
      );
  
  
      if (response.status === 200) {
        toast({
          variant: "success",
          title: "Thành công",
          description: "Ứng tiền viện phí thành công.",
        });
  
        // Đóng dialog và reset form
  
        // Refetch dữ liệu nếu cần
        await fetchBill();
        await fetchAdvance();
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể ứng tiền viện phí.",
        });
      }
    
      setIsOpenDialogSaveAdvancePayment(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi khi gửi yêu cầu",
        description: error?.response?.data?.message || error.message,
      })} finally {
      setLoading(false);
    }
  };
  
  
  const onSubmitSaveBill = async () => {
    if (!billSelected?.id) return;
    if (billSelected?.payment_status===1) {
      alert("Bệnh nhân đã thanh toán đủ, không cần thanh toán nữa!");
      return;
    }
    const payload = {
      status: 1  };
    setLoading(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bills/${billSelected.id}`,
        payload,
        { timeout: 5000 }
      );
  
      if (response.status === 200) {
        toast({
          variant: "success",
          title: "Thành công",
          description: "Thanh toán thành công.",
        });
  
        // Đóng dialog và reset form
  
        // Refetch dữ liệu nếu cần
        await fetchBill();
        await fetchAdvance();

      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Thanh toán không thành công.",
        });
      }
    
      setIsOpenDialogBillDetail(false);
    } catch (error: any) {
      console.log(error)
      toast({
        variant: "destructive",
        title: "Lỗi khi gửi yêu cầu",
        description: error?.response?.data?.message || error.message,
      })} finally {
      setLoading(false);
    }
  };
      
  
  const router = useRouter(); 
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
  const buttonBillColumnConfig = {
    id: 'buttonBillColumnConfig',
    header: 'Chi tiết',
    onClickConfig: (id: string | bigint) => {
      const billSelect=bills?.find((item:Bill)=>BigInt(item.id)===BigInt(id))
      if(billSelect){
        setBillSelected(billSelect);
        setPatient(billSelect.patients);
        setBillDetails(billSelect.bill_details);
        setIsOpenDialogBillDetail(true);
      }
      // set thông tin cho bill sellected
    },
    content: 'Xem',
    };
  const buttonAdvanceColumnConfig = {
    id: 'buttonAdvanceColumnConfig',
    header: 'Tạm ứng cho bệnh nhân',
    onClickConfig: (id: string | bigint) => {
      console.log(advancePayment)
      const advanceData=advancePayment?.find((item:AdvancePaymentBill)=>BigInt(item.id)===BigInt(id))
      if(advanceData){
        console.log(advanceData)
        if (advanceData?.payment_status_treatment_session===1) {
          alert("Bệnh nhân đã thanh toán đủ, không cần ứng thêm");
          return;
        }
        setAdvancePaymentDetail(advanceData);
        setPatient(advanceData.patient);
        formSaveAdvancePayment.setValue("amount",Number(advanceData.current_cost)-Number(advanceData.refunded_amount));
        setIsOpenDialogSaveAdvancePayment(true);
      }
      
    },
    content: 'Đóng tiền',
    };
  const columnBill = useMemo(() => {
    return bills&&bills.length > 0
      ? createColumns(
        bills,
          undefined,
          undefined,
          undefined,
          columnBillHeaderMap,
          { view: false, edit: false, delete: false },
          undefined,
          buttonBillColumnConfig
        )
      : [];
  }, [bills, columnBillHeaderMap,buttonBillColumnConfig]);
  const columnBillDetail = useMemo(() => {
    return billDetails&&billDetails.length > 0
      ? createColumns(
        billDetails,
          undefined,
          undefined,
          undefined,
          columnBillDetailHeaderMap,
          { view: false, edit: false, delete: false }
        )
      : [];
  }, [billDetails, columnBillDetailHeaderMap]);
  const columnAdvancePayment = useMemo(() => {
    return advancePayment&&advancePayment.length > 0
      ? createColumns(
        advancePayment,
          undefined,
          undefined,
          undefined,
          columnAdvancePaymentBillHeaderMap,
          { view: false, edit: false, delete: false },
          undefined,
          buttonAdvanceColumnConfig
        )
      : [];
  }, [advancePayment, columnAdvancePaymentBillHeaderMap,buttonAdvanceColumnConfig]);
  useEffect(() => {
    const fetchData = async () => {
      await fetchBill();
      await fetchAdvance();
    };
    fetchData();
  }, [limit, keyword, status]);
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchBill();
      await fetchAdvance();
    };
    fetchData();
  }, []);
  
  return(
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div
      className="flex pb-5 flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
    >
       <Tabs defaultValue="Bill" className='w-full mt-2'>
                <TabsList className="grid w-full grid-cols-2 w-fit">
                  <TabsTrigger value="Bill">Hóa đơn</TabsTrigger>
                  <TabsTrigger value="AdvanPayment">Viện phí</TabsTrigger>
                </TabsList>
                <TabsContent value="Bill">
                  <Card>
                    <CardHeader>

                    <CardTitle>
                      Danh sách các hóa đơn
                    </CardTitle>
                    <CardDescription>
                     Danh sách các hóa đơn
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div>
                      <div className="flex flex-col gap-1 border-b pb-5">
                      <div className="mb-6 border-b">
                        <h3 className="text-lg font-bold">Các hóa đơn trong ngày</h3>
                    </div>  
                      <div className='flex mt-5 justify-between'>
                    
                        <Combobox<number>
                        options={numberOptions}
                        onSelect={handleSelecLimit}
                        placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                        />
                      <div className="flex items-center space-x-5">
                            <div className='flex'>
                            <Combobox<number>
                                options={statusOptions}
                                onSelect={handleSelectStatus}
                                defaultValue={null} // No default selection for status
                                placeholder="Chọn trạng thái thanh toán"  // Thêm placeholder tùy chỉnh
                              />
                            </div>
                            <div className="flex items-center space-x-2 bg-white">
                              <Input type="text" placeholder="Tìm kiếm" 
                                value={keyword} // Đặt giá trị từ state keyword
                                onChange={(e) => setKeyword(e.target.value)}
                              />
                              <Button type="submit" onClick={() => fetchBill()}>Lọc</Button>
                            </div>
                      </div>
                      </div>
                      </div>
                      <div className='flex item-center justify-center'>
                      <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={bills??[]}
                        columns={columnBill}
                        totalRecords={bills?bills.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
                  </div>
      
                        </div>
                    </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="AdvanPayment">
                <Card>
                  <CardHeader>

                    <CardTitle>
                      Danh sách khoản tạm ứng
                    </CardTitle>
                    <CardDescription>
                     Danh sách các khoản tạm ứng
                    </CardDescription>
                  </CardHeader>
                    <CardContent>
                    <div>
                      <div className="flex flex-col gap-1 border-b pb-5">
                      <div className="mb-6 border-b">
                        <h3 className="text-lg font-bold">Khoản tạm ứng trong ngày</h3>
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
                              <Button type="submit" onClick={() => fetchBill()}>Lọc</Button>
                            </div>
                      </div>
                      </div>
                      </div>
                      <div className='flex item-center justify-center'>
                      <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={advancePayment??[]}
                        columns={columnAdvancePayment}
                        totalRecords={advancePayment?advancePayment.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
                  </div>
      
                        </div>
                    </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                  <Dialog open={isOpenDialogSaveAdvancePayment} onOpenChange={setIsOpenDialogSaveAdvancePayment}
                  
                  >
                    <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                    <DialogTitle>
                     Đóng tiền tạm ứng viện phí
                    </DialogTitle>
                    <DialogDescription>
                    Đóng tiền tạm ứng viện phí
                    </DialogDescription>
                     <div className="grid grid-cols-1 p-4 col-span-1">
                      <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                      <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                      <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                      <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                      <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                      <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                      <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                      <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>
                      </div>
                    </DialogHeader>
                   
                     <Form {...formSaveAdvancePayment}>
                          <form onSubmit={formSaveAdvancePayment.handleSubmit(onSubmitSaveAvancePayment)}>
                          <FormField
                              control={formSaveAdvancePayment.control}
                              name="amount"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Số tiền đóng
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                        {...field}
                                      
                                        placeholder="Example:Nhập số tiền 1.000.000VND"
                                        type="number"
                                        onChange={(e) => {
                                          // Chuyển giá trị từ chuỗi thành number trước khi lưu vào state của form
                                          const newValue = e.target.value ? parseFloat(e.target.value) : undefined;
                                          field.onChange(newValue);
                                        }}
                                      />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                                                         <DialogFooter>
                                            <Button
                                            className='mt-4'
                                            size="sm"
                                            type="submit"
                                            variant="outline"
                                            >
                                              Lưu
                                            </Button>
                    
                                            </DialogFooter>
                                                        </form>
                                                        </Form>
                    </DialogContent>
                  </Dialog>
                   <AlertDialog open={showConfirmDialogSaveAdvancePayment} onOpenChange={setShowConfirmDialogSaveAdvancePayment}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận đóng viện phí</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xác nhận đóng viện phí cho bệnh nhân không?
                         {/* thêm thông tin về số tiền và tên bệnh nhân, cccd */}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmSubmit}>
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog open={showConfirmDialogSaveBill} onOpenChange={setShowConfirmDialogSaveBill}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
      <AlertDialogDescription>
        Bạn có chắc chắn muốn xác nhận thanh toán cho bệnh nhân{" "}
        <strong>{billSelected?.patients?.name}</strong>, CCCD:{" "}
        <strong>{billSelected?.patients?.cccd_number}</strong> với số tiền{" "}
        <strong>
          {billSelected?.total_amount_due != null
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(billSelected.total_amount_due))
            : "—"}
        </strong>
        ?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Hủy</AlertDialogCancel>
      <AlertDialogAction onClick={onSubmitSaveBill}>
        Xác nhận
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

                </Tabs>
                <Dialog open={isOpenDialogBillDetail} onOpenChange={setIsOpenDialogBillDetail}>
                    <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                    <DialogTitle>
                      Chi tiết hóa đơn
                    </DialogTitle>
                    <DialogDescription>
                      List các dịch vụ, đơn thuốc, viện phí cần thanh toán
                    </DialogDescription>
                    <div className="grid grid-cols-1 p-4 col-span-1">
                      <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                      <p><strong>Ngày sinh:</strong> {patient?.birthday? formatDateCustom(patient.birthday): "Không có"}</p>
                      <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                      <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                      <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                      <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                      <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                      <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>
                      </div>
                    </DialogHeader>
                  

                    

                  <div className="flex item-center justify-center w-full">
                    <LoadingWrapper loading={loading}>
                      <DataTable
                        data={billDetails??[]}
                        columns={columnBillDetail}
                        totalRecords={billDetails?billDetails.length:0}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={setPageIndex}
                      />
                    </LoadingWrapper>
                  </div>
                  <div className='flex justify-end'>
                    Tổng tiền thanh toán:{" "}
                    <strong>
                      {billSelected?.total_amount_due != null
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(billSelected.total_amount_due))
                        : "—"}
                    </strong>
                  </div>
                  <DialogFooter>
                    <Button size="sm" variant="outline" onClick={() => setShowConfirmDialogSaveBill(true)}>
                      Xác nhận thanh toán
                    </Button>
                  </DialogFooter>

                  </DialogContent>
                  </Dialog>
    </div>
    </main>
  )
};

export default Billing;