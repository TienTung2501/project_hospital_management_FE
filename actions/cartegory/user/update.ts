"use server";

import * as z from "zod";
import axios from "axios";
import { UpdateUserSchema } from "@/schema";
import { UserInfoType } from "@/types";

export const update_user = async (id:bigint|undefined,values: z.infer<typeof UpdateUserSchema>,selectedRooms: Number[]) => {
  // 1. Validate input from form
  const validateFields = UpdateUserSchema.safeParse(values);
  if (!validateFields.success) {
    console.error("Validation error:", validateFields.error); // Log validation errors
    return { error: "Dữ liệu nhập không hợp lệ." }; // Return error if validation fails
  }
  const { name,email,  department_id, position_id,cccd,address,gender, ...otherFields } = validateFields.data;
  
  console.log(validateFields)
  try {
    // 2. Create new user with the provided details
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
    const response = await axios.get(`${endpoint}/${id}`, { timeout: 5000 });

    const responseCheckDupdicate = await axios.get(`${endpoint}`, {
      params: {
        keyword: values.email, // Truy vấn theo tên chức danh
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingUser:UserInfoType[]=
    responseCheckDupdicate?.data?.data?.data || [];
      if (
        existingUser.length > 0 &&
        existingUser.some(
          (user) =>
            user?.email.trim().toLowerCase() === email.trim().toLowerCase()
        )
        ) {
        return { error: "Người dùng có email đã tồn tại, vui lòng nhập email khác." };
        }
    


    const user = response.data.data;
 
    const payload = { 
      name:values.name,
      cccd:values.cccd,
      email:values.email,
      gender:values.gender,
      password:user.password,
      department_id: Number(values.department_id), // Convert BigInt to Number
      position_id: Number(values.position_id),      // Convert BigInt to Number
      address: values.address,
      room_ids: selectedRooms,                    // Example room IDs
    };


    const responseCreate = await axios.patch(`${endpoint}/${id}`, payload, { timeout: 5000 });

    if (responseCreate.status === 200) { // Check for the correct status code (201 for created)
      return { success: "Chỉnh sửa thông tin người dùng thành công!" }; // Success
    } else {
      console.error("Error during user creation:", responseCreate.data); // Log any errors from response
      return { error: "Có lỗi khi chỉnh sửa người dùng, vui lòng thử lại." }; // Error during creation
    }

  } catch (error: any) {
    // 3. Handle detailed errors
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Timeout error
    }

    if (error.response) {
      console.error("API response error:", error.response.data); // Log API response error

      if (error.response.status === 409) {
        return { error: "Email đã tồn tại, vui lòng chọn email khác." }; // Email conflict error
      } else if (error.response.status === 500) {
        return { error: "Lỗi từ phía server, vui lòng thử lại sau." }; // Server error
      }
    } else {
      console.error("Unexpected error:", error); // Log unexpected error
    }

    return { error: "Có lỗi xảy ra khi kết nối với API." }; // General error
  }
};
