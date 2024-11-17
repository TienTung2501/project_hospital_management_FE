"use client";
// components/ServiceForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'next/navigation';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientCurrently, ServiceInfo } from '@/types';
import { Textarea } from '@/components/ui/textarea';
// call thông tin liên quan đến bệnh nhân
// call thông tin liên quan đến service
// call thông tin liên quan đến bác sĩ
// cần phải bổ sung thêm 1 trường để thể hiện trạng thái khám của bệnh nhân
const patientCurrentlyData: PatientCurrently = 
{
    id:BigInt(1),
    patient_id: BigInt(1),
    user_id: BigInt(1),
    gender: 1,
    visit_date: "2024-10-26T10:30:00",
    diagnosis: "Viêm phổi cấp",
    notes: "Bệnh nhân có triệu chứng ho nhiều, khó thở.",
    inpatient_detail: "Điều trị nội trú tại phòng A1, giường 3.",
    examination_status: 2, // 2: Đang khám
};

export type Service = {
  ServiceID: bigint;
  ServiceName: string;
  DepartmentID: bigint;
  ServiceType: string;
  Price: number;
  Description: string;
  ResultTemplate: { [key: string]: string };
};

const servicesData: Service[] = [
  {
    ServiceID: BigInt(1),
    ServiceName: "Xét nghiệm máu",
    DepartmentID: BigInt(1),
    ServiceType: "Xét nghiệm",
    Price: 250000,
    Description: "Xét nghiệm máu tổng quát.",
    ResultTemplate: {
      hemoglobin: "g/dL",
      leukocytes: "cells/µL",
      platelets: "cells/µL",
    },
  },
  {
    ServiceID: BigInt(2),
    ServiceName: "Xét nghiệm nước tiểu",
    DepartmentID: BigInt(2),
    ServiceType: "Xét nghiệm",
    Price: 150000,
    Description: "Xét nghiệm nước tiểu tổng quát.",
    ResultTemplate: {
      glucose: "mg/dL",
      protein: "mg/dL",
      pH: "pH",
    },
  },
  {
    ServiceID: BigInt(3),
    ServiceName: "Xét nghiệm phân",
    DepartmentID: BigInt(3),
    ServiceType: "Xét nghiệm",
    Price: 100000,
    Description: "Xét nghiệm phân tổng quát.",
    ResultTemplate: {
      color: "N/A",
      consistency: "N/A",
      blood: "N/A",
    },
  },
];

const ServiceForm = () => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { serviceId } = useParams();

  // Xử lý chuyển đổi serviceId thành kiểu BigInt
  const serviceIdBigInt = Array.isArray(serviceId) ? BigInt(serviceId[0]) : BigInt(serviceId);
  const service = servicesData.find((service) => service.ServiceID === serviceIdBigInt);
  const details = service?.ResultTemplate;

  const createSchema = (details: { [key: string]: string } | undefined) => {
    if (!details) return z.object({});

    const shape: { [key: string]: z.ZodTypeAny } = {};
    Object.keys(details).forEach((key) => {
      shape[key] = z.string().nonempty(`Field for ${key} is required`);
    });
    return z.object(shape);
  };

  const schema = createSchema(details);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: any) => {
    // Xử lý submit ở đây
    console.log(data);
  };

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
      <div className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm">
                <Card className="mb-5 mt-5 bg-muted/40">
                  <CardHeader className="pb-0">
                    <CardTitle>Thông tin xét nghiệm</CardTitle>
                    <CardDescription>Chi tiết thông tin dịch vụ</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Khoa:</strong> Xét nghiệm
                    </div>
                    <div>
                      <strong>Phòng:</strong> Phòng xét {service?.ServiceName} 302
                    </div>
                    <div>
                      <strong>Mô tả:</strong> {service?.Description}
                    </div>
                    <div>
                      <strong>Bác sĩ phụ trách:</strong> Bác sĩ Nguyễn Văn A
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mb-5 mt-5">
                  <CardHeader className="pb-0">
                    <CardTitle>Thông tin bệnh nhân</CardTitle>
                    <CardDescription>Chi tiết thông tin của bệnh nhân</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Mã bệnh nhân:</strong> {patientCurrentlyData.patient_id}
                    </div>
                    <div>
                      <strong>Tên bệnh nhân:</strong> Nguyễn Văn B {/* Ví dụ để hiển thị tên bệnh nhân */}
                    </div>
                    <div>
                      <strong>Giới tính:</strong> {patientCurrentlyData.gender === 1 ? "Nam" : "Nữ"}
                    </div>
                    <div>
                      <strong>Ngày khám:</strong> {new Date(patientCurrentlyData.visit_date).toLocaleString()}
                    </div>
                    <div>
                      <strong>Chẩn đoán:</strong> {patientCurrentlyData.diagnosis}
                    </div>
                    <div>
                      <strong>Ghi chú:</strong> {patientCurrentlyData.notes}
                    </div>
                    <div>
                      <strong>Chi tiết nội trú:</strong> {patientCurrentlyData.inpatient_detail ? patientCurrentlyData.inpatient_detail : "Không"} <strong>(hoặc không)</strong>
                    </div>
                    <div>
                      <strong>Trạng thái khám:</strong> {patientCurrentlyData.examination_status === 2 ? "Đang khám" : "Khác"}
                    </div>
                  </CardContent>
                </Card>

        
        <Card className="mb-5 mt-5">
          <CardHeader className="pb-0">
            <CardTitle>Thông tin chi tiết xét nghiệm</CardTitle>
            <CardDescription>
              Các bệnh nhân đang chờ xét nghiệm của phòng xét nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {details && Object.keys(details).map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      
                         {`${key.charAt(0).toUpperCase() + key.slice(1)} (Đơn vị: ${details[key]})`}
    
                    </FormLabel>
                    <FormControl>

                        <Input {...field} type="text" placeholder={`Nhập ${key}`} />
              
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

                {submitError && <FormError message={submitError} />}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang lưu..." : "Lưu"}
            
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Quay lại
                </Button>
                Chú ý cần có 1 trường để lưu trạng thái thực hiện dịch vụ của người thực hiện để sau khi lưu xong thì cập nhật trạng thái này
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ServiceForm;