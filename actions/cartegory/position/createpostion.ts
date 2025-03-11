"use server";

import * as z from "zod";
import axios from "axios";
import { CreateDepartmentSchema } from "@/schema";
import { DepartmentType, PositionType } from "@/types";

export  const create_position = async (values: z.infer<typeof CreateDepartmentSchema>) => {
  // 1. Validate input từ form
  const validateFields = CreateDepartmentSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi khi validation không thành công
  }

  const { name } = validateFields.data;

  try {
    // 2. Kiểm tra xem chức danh có tồn tại với tên tương tự
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;
    const response = await axios.get(endpoint, {
      params: {
        keyword: name, // Truy vấn theo tên chức danh
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingPositions: PositionType[] =
    response?.data?.data?.data || [];
  
  if (
    existingPositions.length > 0 &&
    existingPositions.some(
      (position) =>
        position?.name.trim().toLowerCase() === name.trim().toLowerCase()
    )
  ) {
    return { error: "Tên chức danh đã tồn tại, vui lòng chọn tên khác." };
  }
    // 3. Tạo chức danh mới
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/create`;
    const responseCreate = await axios.post(createEndpoint, values, {
      timeout: 5000, // Thêm timeout cho việc tạo chức danh
    });

    if (responseCreate.status === 200) {
      return { success: "Tạo chức danh mới thành công!" }; // Thành công
    } else {
      return { error: "Có lỗi khi tạo chức danh, vui lòng thử lại." }; // Lỗi khi tạo
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
