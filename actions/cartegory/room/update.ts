"use server";

import * as z from "zod";
import axios from "axios";
import { RoomSchema } from "@/schema";
import { RoomType } from "@/types";

export const update_room = async (id: bigint, values: z.infer<typeof RoomSchema>) => {
  const validateFields = RoomSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  const { code } = validateFields.data;
  const valuesConvert={
    ...values,
    department_id: Number(values.department_id),
    room_catalogue_id: Number(values.room_catalogue_id),
  }

  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
    const existingRoomResponse = await axios.get(`${endpoint}/${id}`);
    const existingRoom = existingRoomResponse.data.data.data;
    if (
      existingRoom.code === code && 
      existingRoom.department_id === valuesConvert.department_id&&
      existingRoom.room_catalogue_id === valuesConvert.room_catalogue_id
    ) {
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }
    else{
    // 3.kiểm tra xem có dữ liệu trùng không:
    const responseCheck = await axios.get(endpoint, {
      params: {
        keyword: code,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });


    const existingRooms: RoomType[] =

    responseCheck?.data?.data?.data || [];
      
      if (
        existingRooms.length > 0 &&
        existingRooms.some(
          (room) =>
            room?.code.trim().toLowerCase() === code.trim().toLowerCase()
        )
      ) {
        return { error: "Mã phòng đã tồn tại, vui lòng chọn tên khác." };
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