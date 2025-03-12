"use server";

import * as z from "zod";
import axios from "axios";
import { CreateUserSchema } from "@/schema";
import { UserInfo } from "@/lib/dal";
import { UserInfoType } from "@/types";

export const create_user = async (values: z.infer<typeof CreateUserSchema>,selectedRooms:Number[]) => {
  // 1. Validate input from form
  const validateFields = CreateUserSchema.safeParse(values);
  if (!validateFields.success) {
    console.error("Validation error:", validateFields.error); // Log validation errors
    return { error: "Dữ liệu nhập không hợp lệ." }; // Return error if validation fails
  }

  const { email, password, department_id, position_id, ...otherFields } = validateFields.data;

  try {
    
    // 2. Create new user with the provided details
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
    
    const payload = { 
      ...otherFields, 
      email, 
      password, 
      department_id: Number(department_id), // Convert BigInt to Number
      position_id: Number(position_id),      // Convert BigInt to Number
      room_ids: selectedRooms,                      // Example room IDs
    };

    const responseCheckDupdicate = await axios.get(endpoint, {
      params: {
        keyword: values.email, // Truy vấn theo tên chức danh
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingUser: UserInfoType[] =
    responseCheckDupdicate?.data?.data?.data || [];
    console.log(existingUser)
    if (
    existingUser.length > 0 &&
    existingUser.some(
      (service) =>
        service?.email.trim().toLowerCase() === values.email.trim().toLowerCase()
    )
    ) {
    return { error: "Người dùng có email đã tồn tại, vui lòng nhập email khác." };
    }


    const responseCreate = await axios.post(`${endpoint}/create`, payload, { timeout: 5000 });

    if (responseCreate.status === 200) { // Check for the correct status code (201 for created)
      return { success: "Tạo người dùng mới thành công!" }; // Success
    } else {
      console.error("Error during user creation:", responseCreate.data); // Log any errors from response
      return { error: "Có lỗi khi tạo người dùng, vui lòng thử lại." }; // Error during creation
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