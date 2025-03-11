"use server";

import * as z from "zod";
import axios from "axios";
import {   ServiceSchema } from "@/schema";
import { ServiceType } from "@/types";

export const create_service = async (values: z.infer<typeof ServiceSchema>) => {
  // Kiểm tra dữ liệu từ phía frontend
  console.log('Submitting form with values:', values);
  const validateFields = ServiceSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại các trường thông tin." };
  }
  try {
    const valuesConvert={
      ...values,
      service_catalogue_id: Number(values.service_catalogue_id),
      room_catalogue_id: Number(values.room_catalogue_id),
    }
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services`;

    const responseCheckDupdicate = await axios.get(endpoint, {
      params: {
        keyword: values.name, // Truy vấn theo tên chức danh
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingService: ServiceType[] =
    responseCheckDupdicate?.data?.data?.data || [];
    if (
    existingService.length > 0 &&
    existingService.some(
      (service) =>
        service?.name.trim().toLowerCase() === values.name.trim().toLowerCase()
    )
    ) {
    return { error: "Dịch vụ đã tồn tại, vui lòng nhập nhóm dịch vụ khác." };
    }

    const response = await axios.post(`${endpoint}/create`, valuesConvert, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Tạo dịch vụ mới thành công!" };
    } else {
      return { error: "Có lỗi khi tạo dịch vụ, vui lòng thử lại." };
    }

  } catch (error: any) {
    // 4. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }
    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};