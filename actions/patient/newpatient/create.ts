"use server";
import * as z from "zod";
import axios from "axios";
import { MedicalRecordSchema } from "@/schema";
import { Patient } from "@/types";

export const create_patient = async (
  values: z.infer<typeof MedicalRecordSchema>
) => {
  // 1. Validate dữ liệu đầu vào
  const validateFields = MedicalRecordSchema.safeParse(values);
  if (!validateFields.success) {
    const errors = validateFields.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return { error: "Dữ liệu nhập không hợp lệ.", details: errors };
  }

  // Chuyển đổi timestamp -> YYYY-MM-DD
  const convertTimestampToDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };
  const formattedDate = convertTimestampToDate(values.birthday);

  const convertValue = {
    name: values.name,
    birthday: formattedDate,
    address: values.address,
    phone: values.phone,
    cccd_number: values.cccd_number,
    health_insurance_code: values.health_insurance_code,
    guardian_phone: values.guardian_phone,
    gender: values.gender,
  };

  try {
    let idPatient: bigint | undefined;

    // 2. Kiểm tra bệnh nhân đã tồn tại chưa
    const checkPatientEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients`;
    const checkPatientResponse = await axios.get(checkPatientEndpoint, { params: { limit: 1000 } });

    const patients = checkPatientResponse.data?.data?.data || [];
    if (Array.isArray(patients) && patients.length > 0) {
      const patient = patients.find((item) => String(item.cccd_number) === String(values.cccd_number));
      if (patient) idPatient = patient.id;
    }

    // 3. Nếu bệnh nhân chưa tồn tại -> tạo mới
    if (!idPatient) {
      const createPatientEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients/create`;
      const response = await axios.post(createPatientEndpoint, convertValue, { timeout: 5000 });
      idPatient = response.data?.data?.data?.id;

      if (!idPatient) return { error: "Không thể tạo bệnh nhân mới." };
    }

    // 4. Lấy thông tin phòng & bác sĩ
    const getRoomEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${values.room_id}`;
    const getRoom = await axios.get(getRoomEndpoint);
    const users = getRoom?.data?.data?.data?.users || [];
    
    if (users.length === 0) return { error: "Không tìm thấy bác sĩ trong phòng." };
    
    const user_id = users[0].id;

    // 5. Tạo hồ sơ bệnh án với `visit_date`
    const createMedicalRecordEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/create`;
    const medicalRecordData = {
      patient_id: Number(idPatient),
      user_id: Number(user_id),
      room_id: Number(values.room_id),
    };

    const medicalRecordResponse = await axios.post(createMedicalRecordEndpoint, medicalRecordData, { timeout: 5000 });

    if (medicalRecordResponse.status === 200 || medicalRecordResponse.data.message === "created") {
      return {
        success: true,
        message: "Bệnh nhân và hồ sơ bệnh án đã được tạo thành công.",
        data: medicalRecordResponse.data.data,
      };
    } else {
      return { error: "Lỗi khi tạo hồ sơ bệnh án." };
    }

  } catch (error: any) {
    console.error("API error:", error.response ? error.response.data : error);
    return { error: "Đã xảy ra lỗi khi tạo bệnh nhân và hồ sơ bệnh án." };
  }
};
