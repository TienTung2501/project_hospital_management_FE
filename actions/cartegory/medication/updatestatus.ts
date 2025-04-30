"use server";

import { MedicationType } from "@/types";
import axios from "axios";

export const update_status_medication = async (id: bigint | string, newStatus: number) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy dịch vụ hoặc dữ liệu không hợp lệ." };
    }

    const medication :MedicationType= response.data.data.data;
    if (medication.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }

    const payload = {
      ...medication,
      medication_catalogue_id: Number(medication.medication_catalogue_id),
      name:medication.name,
      price:Number(medication.price),
      unit:medication.unit,
      measure_count:Number(medication.measure_count),
      status:newStatus,
    };

    const updateResponse = await axios.patch(endpoint, payload, { timeout: 5000 });

    if (updateResponse.status === 200) {
      return { success: "Cập nhật trạng thái thành công!" };
    } else {
      return { error: "Đã có lỗi khi cập nhật trạng thái, vui lòng thử lại." };
    }

  }catch (error: any) {
    // 4. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }
    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};