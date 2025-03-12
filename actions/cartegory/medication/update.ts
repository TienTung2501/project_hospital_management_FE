"use server";

import * as z from "zod";
import axios from "axios";
import {  MedicationSchema } from "@/schema";
import { MedicationType } from "@/types";

export const update_medication = async (id: bigint, values: z.infer<typeof MedicationSchema>) => {
  const validateFields = MedicationSchema.safeParse(values);
  if (!validateFields.success) {
    console.log(validateFields.error); // Xem chi tiết lỗi validation
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  
  const valuesConvert={
    ...values,
    name:values.name,
    medication_catalogue_id: Number(values.medication_catalogue_id),
    price: Number(values.price),
    measure: values.measure,
    measure_count: Number(values.measure_count),
  }
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medications`;
   
    const existingMedicationResponse = await axios.get(`${endpoint}/${id}`);
    const existingMedication:MedicationType = existingMedicationResponse.data.data.data;
    if (
      existingMedication.name === valuesConvert.name &&  
      existingMedication.measure === valuesConvert.measure && 
      Number(existingMedication.medication_catalogue_id )=== valuesConvert.medication_catalogue_id && 
      Number(existingMedication.price) === valuesConvert.price && 
      Number(existingMedication.measure_count) === Number(valuesConvert.measure_count) 
      
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


    const existingMedication: MedicationType[] =

    responseCheck?.data?.data?.data || [];
      
      if (
        existingMedication.length > 0 &&
        existingMedication.some(
          (medication) =>
            medication?.name.trim().toLowerCase() === valuesConvert.name.trim().toLowerCase()
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