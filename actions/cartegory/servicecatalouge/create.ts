"use server";

import * as z from "zod";
import axios from "axios";
import { ServiceCatalogueSchema } from "@/schema";
import { ServiceCatalogue } from "@/types";

export const create_service_catalogue = async (values: z.infer<typeof ServiceCatalogueSchema>) => {
  // Kiểm tra dữ liệu từ phía frontend
  const validateFields = ServiceCatalogueSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại các trường thông tin." };
  }
  const { name } = validateFields.data;
  try {
    //1. checkdupdicate
    const endpointCheckDupdicate = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues`;
    const responseCheckDupdicate = await axios.get(endpointCheckDupdicate, {
      params: {
        keyword: name, // Truy vấn theo tên chức danh
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingServiceCatalogue: ServiceCatalogue[] =
    responseCheckDupdicate?.data?.data?.data || [];
    if (
    existingServiceCatalogue.length > 0 &&
    existingServiceCatalogue.some(
      (serviceCatalogue) =>
        serviceCatalogue?.name.trim().toLowerCase() === name.trim().toLowerCase()
    )
    ) {
    return { error: "Nhóm dịch vụ đã tồn tại, vui lòng nhập nhóm dịch vụ khác." };
    }

    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues/create`;
    const response = await axios.post(createEndpoint, values, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Thêm nhóm dịch vụ mới thành công!" };
    } else {
      return { error: "Có lỗi khi thêm dịch vụ, vui lòng thử lại." };
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