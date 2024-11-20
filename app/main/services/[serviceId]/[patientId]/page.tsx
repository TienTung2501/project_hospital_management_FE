"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

// Import UI Components
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { DataTable } from "@/components/data-table";
import createColumns from "@/components/column-custom";

// Types
export type ServiceType = {
  id: bigint;
  name: string;
  description?: string;
  price: number;
  status: number;
  detail: string; // API trả về detail dạng string
  health_insurance_applied?: number;
  health_insurance_value?: number;
  service_catalogue_id: bigint;
  room_catalogue_id: bigint;
};

// Mock Patient Data
const patientCurrentlyData = {
  id: BigInt(1),
  patient_id: BigInt(1),
  user_id: BigInt(1),
  gender: 1,
  visit_date: "2024-10-26T10:30:00",
  diagnosis: "Viêm phổi cấp",
  notes: "Bệnh nhân có triệu chứng ho nhiều, khó thở.",
  inpatient_detail: "Điều trị nội trú tại phòng A1, giường 3.",
  examination_status: 2, // 2: Đang khám
};

// Dữ liệu ban đầu từ API (ví dụ, không có trường value)
const detail = [
  {
    "keyword": "RBC",
    "name": "Số lượng hồng cầu",
    "reference_range": "74-110",
    "unit": "mg/dL"
  },
  {
    "keyword": "wbc",
    "name": "Số lượng bạch cầu",
    "reference_range": ">130",
    "unit": "g/dL"
  }
];
// Khai báo kiểu cho một đối tượng trong detail
interface DetailItem {
  keyword: string;
  name: string;
  reference_range: string;
  unit: string;
  value?: string;  // Trường value sẽ được thêm vào sau
  id?: string|undefined;  // Trường value sẽ được thêm vào sau có thể xóa.
}
interface DetailItemConvert {
  keyword: string;
  name: string;
  reference_range: string;
  unit: string;
  value?: string;  // Trường value sẽ được thêm vào sau
  id: string;  // Trường value sẽ được thêm vào sau có thể xóa.
}
const columnHeaderMap: { [key: string]: string } = {
  keywrod: "Từ khóa",
  name: "Tên thuộc tính",
  reference_range:"Khoảng tham chiếu",
  unit:"Đơn vị",
  value:"Kết quả",
};
// Main Component
const ServiceForm = () => {
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [service, setService] = useState<ServiceType | null>(null);
  const [enrichedDetail, setEnrichedDetail] = useState<DetailItem[]>([]);
  const [enrichedDetailConverColumn, setEnrichedDetailConverColumn] = useState<DetailItemConvert[]>([]);

// Sử dụng dữ liệu giả lập
useEffect(() => {
  setService({
    id: BigInt(1),
    name: "Dịch vụ xét nghiệm máu",
    price: 150000,
    status: 1,
    detail: JSON.stringify(detail),
    service_catalogue_id: BigInt(10),
    room_catalogue_id: BigInt(20),
  });
}, []);
  
  const DetailResultSchema = (detail: DetailItem[]) => {
    const schemaObject: Record<string, z.ZodString> = {};
  
    // Tạo mỗi trường value với keyword và xác thực nó
    detail.forEach(item => {
      schemaObject[item.keyword] = z.string().min(1, { message: `${item.name} là bắt buộc` });
    });
  
    return z.object(schemaObject);
  };
  // useEffect(() => {
  //   const fetchService = async () => {
  //     try {
  //       const service_id = 1; // Giả lập ID dịch vụ
  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/services/${service_id}`
  //       );

  //       const serviceData: ServiceType = response.data.data;

  //       // Parse detail từ string sang JSON
  //       const parsedDetails = JSON.parse(serviceData.detail || "{}");

  //       setService(serviceData);
  //       setDetails(parsedDetails);
  //     } catch (error) {
  //       console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
  //     }
  //   };

  //   fetchService();
  // }, []);


 // Tạo schema zod động để xác thực các trường value
  // Thêm trường value vào mỗi đối tượng trong mảng detail
  useEffect(() => {
    // Chỉ thực hiện cập nhật state một lần khi component mount
    const enrichedDetailWithValues = detail.map(item => ({
      ...item,
      value: "",  // Thêm trường 'value' và khởi tạo với giá trị rỗng
    }));

    // Cập nhật state chỉ khi enrichedDetail không có giá trị hoặc đã thay đổi
    setEnrichedDetail(enrichedDetailWithValues);
  }, []); // Chỉ chạy khi component mount

const schema = DetailResultSchema(detail); // Gọi schema tạo động từ `detail`
const form=useForm({
  resolver:zodResolver(schema),
});
const onSubmit = (data:any) => {
  // Gán giá trị từ form vào trường value của mỗi đối tượng
  const enrichedDetailWithValues = enrichedDetail.map(item => ({
    ...item,
    value: data[item.keyword] || ""  // Lấy giá trị từ form và gán vào value
  }));
  const enrichedDetailWithValuesColumn = enrichedDetail.map(item => ({
    ...item,
    id:item.keyword,
    value: data[item.keyword] || ""  // Lấy giá trị từ form và gán vào value
  }));
  setEnrichedDetail(enrichedDetailWithValues);
  setEnrichedDetailConverColumn(enrichedDetailWithValuesColumn);
  
};
 
  // const onSubmit = async (data: any) => {
  //   setIsLoading(true);
  //   try {
  //     const payload = {
  //       ...data,
  //       service_id: service?.id,
  //       patient_id: patientCurrentlyData.patient_id,
  //     };

  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/results`,
  //       payload
  //     );

  //     console.log("Lưu thành công:", response.data);
  //   } catch (error) {
  //     setSubmitError("Lỗi khi lưu kết quả, vui lòng thử lại.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  if (!service) return <p>Đang tải dữ liệu...</p>;
  const columns = enrichedDetailConverColumn.length > 0 ? createColumns(enrichedDetailConverColumn,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false} ) : [];
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 bg-muted/40">
      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin dịch vụ</CardTitle>
          <CardDescription>Chi tiết dịch vụ được thực hiện</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Dịch vụ:</strong> {service.name}
          </div>
          <div>
            <strong>Giá:</strong> {service.price.toLocaleString()} VND
          </div>
          <div>
            <strong>Mô tả:</strong> {service.description}
          </div>
        </CardContent>
      </Card>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bệnh nhân</CardTitle>
          <CardDescription>Chi tiết thông tin của bệnh nhân</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Mã bệnh nhân:</strong> {patientCurrentlyData.patient_id.toString()}
          </div>
          <div>
            <strong>Chẩn đoán:</strong> {patientCurrentlyData.diagnosis}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nhập kết quả xét nghiệm</CardTitle>
          <CardDescription>Điền thông tin xét nghiệm theo mẫu</CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...form}> {/* Đây là wrapper form mà bạn muốn sử dụng */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {enrichedDetail.map((item) => (
          <FormField
          key={item.keyword}
          control={form.control}
          name={item.keyword}  // Sử dụng item.keyword làm tên trường, không phải item.value
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {item.name} ({item.reference_range}, {item.unit})
              </FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage>
                <FormError/>
              </FormMessage>
            </FormItem>
          )}
        />
        
        ))}
        <button type="submit">Submit</button>
      </form>
      </Form>
        </CardContent>
        <div className='flex item-center justify-center'>

{loading ? (
<p className='flex item-center justify-center'>Loading...</p>
) : (

<DataTable
data={enrichedDetailConverColumn}
columns={columns}
totalRecords={totalRecords}
pageIndex={pageIndex}
pageSize={limit}
onPageChange={(newPageIndex) => {
setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
}}
/>
)}


</div>
      </Card>
    </main>
  );
};

export default ServiceForm;
