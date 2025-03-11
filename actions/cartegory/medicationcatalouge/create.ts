"use server";

import * as z from "zod";
import axios from "axios";
import { MedicationCatalogueSchema } from "@/schema";
import { MedicationCatalogue } from "@/types";

export const create_medication_catalogue = async (values: z.infer<typeof MedicationCatalogueSchema>,level:number|undefined) => {
  // Kiểm tra dữ liệu từ phía frontend
  const validateFields = MedicationCatalogueSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại các trường thông tin." };
  }
  const { name } = validateFields.data;
  try {
//1. checkdupdicate
const endpointCheckDupdicate = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues`;
const responseCheckDupdicate = await axios.get(endpointCheckDupdicate, {
  params: {
    keyword: name, // Truy vấn theo tên chức danh
  },
  timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
});

const existingMedicationCatalogue: MedicationCatalogue[] =
responseCheckDupdicate?.data?.data?.data || [];
console.log(existingMedicationCatalogue)
if (
existingMedicationCatalogue.length > 0 &&
existingMedicationCatalogue.some(
  (medicationCatalogue) =>
    medicationCatalogue?.name.trim().toLowerCase() === name.trim().toLowerCase()
)
) {
return { error: "Nhóm dược đã tồn tại, vui lòng nhập từ khóa khác." };
}
// thực hiện create
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues/create`;
    const response = await axios.post(createEndpoint, { ...values, level: level === undefined ? 0 : level+1 }, { timeout: 5000 });
    if (response.status === 200) {
      return { success: "Thêm nhóm dược mới thành công!" };
    } else {
      return { error: "Có lỗi khi thêm nhóm dược, vui lòng thử lại." };
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