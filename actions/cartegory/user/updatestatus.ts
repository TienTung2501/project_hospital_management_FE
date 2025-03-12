"use server";

import axios from "axios";

export const update_status_user = async (id: bigint | string, newStatus: number) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });
    console.log(response)
    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy người dùng hoặc dữ liệu không hợp lệ." };
    }

    const user = response.data.data.data;
    if (user.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }
    
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`;
    const payload = {
      name:user.name,
      cccd:user.cccd,
      email:user.email,
      position_id: Number(user.position_id),
      department_id:Number(user.department_id),
      address:user.address,
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