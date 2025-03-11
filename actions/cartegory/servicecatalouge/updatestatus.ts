"use server";

import axios from "axios";

export const update_status_service_catalogue = async (id: bigint | string, newStatus: number) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy phòng hoặc dữ liệu không hợp lệ." };
    }
    
    const serviceData = response.data.data.data;
    if (serviceData.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }

    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues/${id}`;
    const payload = {
      name:serviceData.name, // Giữ lại thông tin hiện tại
      status: newStatus
    };
    const updateResponse = await axios.patch(updateEndpoint, payload, { timeout: 5000 });

    if (updateResponse.status === 200) {
      return { success: "Cập nhật trạng thái thành công!" };
    } else {
      return { error: "Đã có lỗi khi cập nhật trạng thái, vui lòng thử lại." };
    }

  } catch (error: any) {
    console.error("Lỗi API:", error); // Log toàn bộ lỗi để debug

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Phản hồi từ server:", error.response.data); // Log dữ liệu phản hồi từ server
        return {
          error: `Lỗi API ${error.response.status}: ${error.response.data?.message || "Lỗi không xác định"}`
        };
      }

      if (error.code === "ECONNABORTED") {
        return { error: "Yêu cầu bị timeout, vui lòng thử lại." };
      }

      return { error: "Lỗi mạng hoặc API không phản hồi." };
    }

    return { error: "Có lỗi xảy ra khi kết nối với API." };
  }
};
