"use server";

import * as z from "zod";
import axios from "axios";
import { BedSchema } from "@/schema";
import { BedType } from "@/types";

export const update_bed = async (id: bigint, values: z.infer<typeof BedSchema>) => {
  const validateFields = BedSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  const valuesConvert={
    ...values,
    room_id: Number(values.room_id),
  }

  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds`;
    const existingBedResponse = await axios.get(`${endpoint}/${id}`);
    const existingBed = existingBedResponse.data.data.data;
    if (
      existingBed.code === valuesConvert.code && 
      Number(existingBed.room_id) === Number(valuesConvert.room_id)&&
      Number(existingBed.price) === Number(valuesConvert.price)
    ) {
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }
    else{
    // 3.kiểm tra xem có dữ liệu trùng không:
    const responseCheck = await axios.get(endpoint, {
      params: {
        keyword: valuesConvert.code,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });


    const existingBeds: BedType[] =

    responseCheck?.data?.data?.data || [];
      
      if (
        existingBeds.length > 0 &&
        existingBeds.some(
          (bed) =>
            bed?.code.trim().toLowerCase() === valuesConvert.code.trim().toLowerCase()&&
            Number(bed?.room_id) === valuesConvert.room_id

        )
      ) {
        return { error: "Mã phòng đã tồn tại, vui lòng chọn tên khác." };
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