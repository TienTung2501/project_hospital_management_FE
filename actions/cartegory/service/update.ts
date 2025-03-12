"use server";

import * as z from "zod";
import axios from "axios";
import {  ServiceSchema } from "@/schema";
import { ServiceType } from "@/types";

export const update_service = async (id: bigint, values: z.infer<typeof ServiceSchema>) => {
  const validateFields = ServiceSchema.safeParse(values);
  if (!validateFields.success) {
    console.log(validateFields.error); // Xem chi tiết lỗi validation
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  
  const valuesConvert={
    ...values,
    health_insurance_value:Number(values.health_insurance_value),
    service_catalogue_id: Number(values.service_catalogue_id),
    room_catalogue_id: Number(values.room_catalogue_id),
  }
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services`;
   
    const existingRoomResponse = await axios.get(`${endpoint}/${id}`);
    const existingRoom:ServiceType = existingRoomResponse.data.data.data;
    if (
      existingRoom.name === valuesConvert.name && 
      existingRoom.description === valuesConvert.name && 
      existingRoom.price === valuesConvert.price && 
      existingRoom.health_insurance_applied === valuesConvert.health_insurance_applied && 
      Number(existingRoom.room_catalogue_id )=== valuesConvert.room_catalogue_id && 
      Number(existingRoom.service_catalogue_id) === valuesConvert.service_catalogue_id && 
      Number(existingRoom.health_insurance_value) === Number(valuesConvert.health_insurance_value) 
      
    ) {
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }
    else{
    // 3.kiểm tra xem có dữ liệu trùng không:
    const responseCheck = await axios.get(endpoint, {
      params: {
        keyword: valuesConvert.name,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });


    const existingService: ServiceType[] =

    responseCheck?.data?.data?.data || [];
      
      if (
        existingService.length > 0 &&
        existingService.some(
          (service) =>
            service?.name.trim().toLowerCase() === valuesConvert.name.trim().toLowerCase()
        )
      ) {
        return { error: "Tên dịch vụ đã tồn tại, vui lòng chọn tên khác." };
      }

    }
    const response = await axios.patch(`${endpoint}/${id}`, valuesConvert, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Cập nhật thông tin phòng thành công!" };
    } else {
      return { error: "Không thể cập nhật thông tin, vui lòng thử lại." };
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