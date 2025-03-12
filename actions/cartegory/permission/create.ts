"use server";

import * as z from "zod";
import axios from "axios";
import {  PermissionSchema } from "@/schema";
import { PermissionType } from "@/types";


export  const create_permission = async (values: z.infer<typeof PermissionSchema>) => {
  // 1. Validate input từ form
  const validateFields = PermissionSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi khi validation không thành công
  }


  const { name } = validateFields.data;

  try {
    // 2. Kiểm tra xem khoa có tồn tại với tên tương tự
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions`;
    const response = await axios.get(endpoint, {
      params: {
        keyword: name, // Truy vấn theo tên khoa
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingPermissions: PermissionType[] =
    response?.data?.data?.data || [];
  
  if (
    existingPermissions.length > 0 &&
    existingPermissions.some(
      (permission) =>
        permission?.name.trim().toLowerCase() === name.trim().toLowerCase()
    )
  ) {
    return { error: "Tên khoa đã tồn tại, vui lòng chọn tên khác." };
  }
    // 3. Tạo khoa mới
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions/create`;
    const responseCreate = await axios.post(createEndpoint, values, {
      timeout: 5000, // Thêm timeout cho việc tạo khoa
    });

    if (responseCreate.status === 200) {
      return { success: "Tạo khoa mới thành công!" }; // Thành công
    } else {
      return { error: "Có lỗi khi tạo khoa, vui lòng thử lại." }; // Lỗi khi tạo
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
