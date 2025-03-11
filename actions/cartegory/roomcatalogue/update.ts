"use server";

import * as z from "zod";
import axios from "axios";
import { RoomCatalogueSchema } from "@/schema";
import { RoomCatalogueType } from "@/types";

export const update_room_catalogue = async (id: bigint, values: z.infer<typeof RoomCatalogueSchema>) => {
  const validateFields = RoomCatalogueSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  const { keyword,name, description } = validateFields.data;
  try {

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
    // 2. Kiểm tra nếu không có thay đổi trong dữ liệu
    const existingRoomCatalogueResponse = await axios.get(`${endpoint}/${id}`);
    const existingRoomCatalogue = existingRoomCatalogueResponse.data.data.data;
    if (
      existingRoomCatalogue.keyword === keyword && 
      existingRoomCatalogue.name === name && 
      existingRoomCatalogue.description === description
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

      
        const existingRoomCatalogues: RoomCatalogueType[] =
        responseCheckDupdicate?.data?.data?.data || [];
      if (
        existingRoomCatalogues.length > 0 &&
        existingRoomCatalogues.some(
          (roomCatalogue) =>
            roomCatalogue?.keyword.trim().toLowerCase() === keyword.trim().toLowerCase()
        )
      ) {
        return { error: "Nhóm phòng đã tồn tại, vui lòng nhập từ khóa khác." };
      }
    }
    const response = await axios.patch(`${endpoint}/${id}`, values, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Cập nhật thông tin nhóm phòng thành công!" };
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
        return { error: "Không thể kết nối tới server." }; // Lỗi khoa không tìm thấy
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi từ phía server
      }
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung không xác định
  }
};
