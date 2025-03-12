"use server";

import * as z from "zod";
import axios from "axios";
import { PermissionSchema } from "@/schema";
import { error } from "console";
import { PermissionType } from "@/types";

// Hàm cập nhật thông tin quyền
export const update_permission = async (
  id: bigint, 
  values: z.infer<typeof PermissionSchema>
) => {
  // 1. Validate dữ liệu từ form
  const validateFields = PermissionSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi nếu validation không thành công
  }

  const { name, keyword } = validateFields.data;

  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions`;
    // 2. Kiểm tra nếu không có thay đổi trong dữ liệu
    const existingPermissionResponse = await axios.get(`${endpoint}/${id}`);
    const existingPermission = existingPermissionResponse.data.data.data;
    if (
      existingPermission.name === name && 
      existingPermission.keyword === keyword
    ) {
      console.log("dữ liệu không có sự thay đổi")
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }
    else{
    // 3.kiểm tra xem có dữ liệu trùng không:
    const responseCheckDupdicate = await axios.get(endpoint, {
      params: {
        keyword: keyword,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });


    const existingPermisions: PermissionType[] =
    responseCheckDupdicate?.data?.data?.data || [];

    if (
    existingPermisions.length > 0 &&
    existingPermisions.some(
      (permission) =>
        permission?.keyword.trim().toLowerCase() === keyword.trim().toLowerCase()
    )
    ) {
    return { error: "Tên khoa đã tồn tại, vui lòng chọn tên khác." };
    }

    }
   

    // 4. Gửi yêu cầu cập nhật khoa
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${id}`;
    const responseUpdate = await axios.patch(updateEndpoint, values, {
      timeout: 5000,
    });

    if (responseUpdate.status === 200) {
      return { success: "Cập nhật thông tin khoa thành công!" };
    } else {
      return { error: "Không thể cập nhật thông tin, vui lòng thử lại." };
    }

  } catch (error: any) {
    // 5. Xử lý lỗi chi tiết hơn
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại sau." }; // Lỗi timeout
    }

    if (error.response) {
      if (error.response.status === 404) {
        return { error: "Khoa không tồn tại." }; // Lỗi khoa không tìm thấy
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi từ phía server
      }
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung không xác định
  }
};
