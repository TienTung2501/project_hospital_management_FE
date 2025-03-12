"use server";

import * as z from "zod";
import axios from "axios";
import {  BedSchema } from "@/schema";
import { BedType } from "@/types";

export const create_bed = async (values: z.infer<typeof BedSchema>) => {
  // Kiểm tra dữ liệu từ phía frontend
  const validateFields = BedSchema.safeParse(values);
  if (!validateFields.success) {
    // Lấy chi tiết lỗi từ validateFields.error
    console.error("Lỗi validate:", validateFields.error.format());
    return { error: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại các trường thông tin." };
  }
  const valuesConvert={
    ...values,
    room_id: Number(values.room_id),
  }
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds`;
    const responseCheck = await axios.get(endpoint, {
      params: {
        keyword: valuesConvert.code, // Truy vấn theo Mã phòng
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
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
    
      const response = await axios.post(`${endpoint}/create`, valuesConvert, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Tạo giường mới thành công!" };
    } else {
      return { error: "Có lỗi khi tạo giường, vui lòng thử lại." };
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