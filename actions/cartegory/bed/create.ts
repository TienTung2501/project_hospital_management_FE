"use server";

import * as z from "zod";
import axios from "axios";
import {  BedSchema } from "@/schema";

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
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds/create`;
    const response = await axios.post(createEndpoint, valuesConvert, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Tạo giường mới thành công!" };
    } else {
      return { error: "Có lỗi khi tạo giường, vui lòng thử lại." };
    }

  } catch (error: any) {
    // Kiểm tra lỗi từ phản hồi của server
    if (error.response && error.response.data) {
      const serverError = error.response.data;

      // Xử lý lỗi chi tiết từ server
      if (serverError.errors) {
        const errorMessages = Object.values(serverError.errors)
          .flat()
          .join("; ");
        
        return { error: errorMessages };
      }

      // Nếu có thông báo message tổng quát
      if (serverError.message) {
        return { error: serverError.message };
      }
    }

    // Xử lý các lỗi khác như timeout hoặc lỗi không xác định
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." };
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." };
  }
};
