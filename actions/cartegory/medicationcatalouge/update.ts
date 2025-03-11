"use server";

import * as z from "zod";
import axios from "axios";
import { MedicationCatalogueSchema } from "@/schema";
import { MedicationCatalogue } from "@/types";

export const update_medication_catalogue = async (id: bigint, values: z.infer<typeof MedicationCatalogueSchema>,level:number|undefined) => {
  const validateFields = MedicationCatalogueSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  const { name, description,parent_id } = validateFields.data;

  try {
    // check
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues`;
    
    // 2. Kiểm tra nếu không có thay đổi trong dữ liệu
    const existingMedicationCatalogueResponse = await axios.get(`${endpoint}/${id}`);
    const existingMedicationCatalogue:MedicationCatalogue = existingMedicationCatalogueResponse.data.data.data;
    const levelcompare=level  === undefined ? 0 : level+1
    if (
      existingMedicationCatalogue.name === name && 
      existingMedicationCatalogue.description === description && 
      existingMedicationCatalogue.parent_id === parent_id&&
      existingMedicationCatalogue.level === levelcompare

    ) {
      console.log("Dữ liệu không có sự thay đổi")
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }
    else{
       // 3.kiểm tra xem có dữ liệu trùng không:
    const responseCheckDupdicate = await axios.get(`${endpoint}`, {
      params: {
        keyword: name,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });

   
    const existingMedicationCatalogues: MedicationCatalogue[] =
    responseCheckDupdicate?.data?.data?.data || [];
  if (
    existingMedicationCatalogues.length > 0 &&
    existingMedicationCatalogues.some(
      (medicationCatalogue) =>
        medicationCatalogue?.name.trim().toLowerCase() === name.trim().toLowerCase()
    )
  ) {
    return { error: "Nhóm dược đã tồn tại, vui lòng nhập tên nhóm dược khác." };
  }
    }
   
    // thực hiện update
    const response = await axios.patch(`${endpoint}/${id}`, { ...values, level: level === undefined ? 0 : level+1 }, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Cập nhật thông tin dịch vụ thành công!" };
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