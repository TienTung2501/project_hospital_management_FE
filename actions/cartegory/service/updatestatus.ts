"use server";

import { ServiceType } from "@/types";
import axios from "axios";

export const update_status_service = async (id: bigint | string, newStatus: number) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });
  
    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy dịch vụ hoặc dữ liệu không hợp lệ." };
    }

    const service:ServiceType = response.data.data.data;
    if (service.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }
    console.log(service)
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`;

    
    const payload = {
      name:service.name, // Giữ lại thông tin hiện tại
      price:service.price,
      room_catalogue_id:service.room_catalogue_id,
      service_catalogue_id:service.service_catalogue_id,
      status:newStatus,
    };
    

    const updateResponse = await axios.patch(updateEndpoint, payload, { timeout: 5000 });
    if (updateResponse.status === 200) {
      return { success: "Cập nhật trạng thái thành công!" };
    } else {
      return { error: "Đã có lỗi khi cập nhật trạng thái, vui lòng thử lại." };
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