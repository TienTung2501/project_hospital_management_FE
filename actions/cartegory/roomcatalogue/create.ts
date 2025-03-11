"use server";

import * as z from "zod";
import axios from "axios";
import { RoomCatalogueSchema } from "@/schema";
import { RoomCatalogueType } from "@/types";

export const create_room_catalogue = async (values: z.infer<typeof RoomCatalogueSchema>) => {
  // Kiểm tra dữ liệu từ phía frontend
  const validateFields = RoomCatalogueSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại các trường thông tin." };
  }
  const { keyword } = validateFields.data;
  try {
  //1. checkdupdicate
    const endpointCheckDupdicate = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
    const responseCheckDupdicate = await axios.get(endpointCheckDupdicate, {
      params: {
        keyword: keyword, // Truy vấn theo tên chức danh
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingRoomCatalogue: RoomCatalogueType[] =
    responseCheckDupdicate?.data?.data?.data || [];
  console.log(existingRoomCatalogue)
  if (
    existingRoomCatalogue.length > 0 &&
    existingRoomCatalogue.some(
      (roomCatalogue) =>
        roomCatalogue?.keyword.trim().toLowerCase() === keyword.trim().toLowerCase()
    )
  ) {
    return { error: "Nhóm phòng đã tồn tại, vui lòng nhập từ khóa khác." };
  }
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues/create`;
    const response = await axios.post(createEndpoint, values, { timeout: 5000 });
    if (response.status === 200) {
      return { success: "Tạo phòng mới thành công!" };
    } else {
      return { error: "Có lỗi khi tạo phòng, vui lòng thử lại." };
    }
  }
    catch (error: any) {
      // 4. Xử lý lỗi chi tiết
      if (error.code === 'ECONNABORTED') {
        return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
      }
      console.error("API error:", error); // Log lỗi API để debug
      return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
    }
};
