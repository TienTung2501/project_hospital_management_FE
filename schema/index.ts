import { description } from "@/app/custom/page";
import * as z from "zod";

// zod dùng để validate
export const LoginSchema=z.object({
    email:z.string().email({
        message:"Email is require",
        
    }),
    password:z.string().min(1,{
        message:"Password is require",
    })
})

export const RegisterSchema=z.object({
    email:z.string().email({
        message:"Email is require",
        
    }),
    password:z.string().min(6,{
        message:"Minimum 6 character require",
    }),
    name:z.string().min(1,{
        message:"name is require",
    })
})

export const CreateProvinceSchema=z.object({// Shema cho tỉnh thành phố
    province:z.string().min(1,{
        message:"Province is require",
        
    }),
})
export const CreateDistrictSchema=z.object({// Shema cho tỉnh thành phố
    province:z.string().min(1,{
        message:"Province is require",
    }),
    district:z.string().min(1,{
        message:"district is require",
    }),
})
export const CreateWardSchema=z.object({// Shema cho tỉnh thành phố
    province:z.string().min(1,{
        message:"Province is require",
        
    }),
})

export const CreateDepartmentSchema = z.object({
    name: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    description: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
});



export const CreateUserSchema = z.object({
    name: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    cccd: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    gender: z.enum(['male', 'female'], {
        errorMap: () => ({ message: "Yêu cầu chọn giới tính" }),
    }),
    email: z.string().min(1, {
        message: "Yêu cầu điền",
    }).email("Email không hợp lệ"),
    password: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    certificate: z.string().optional(), // Trường này có thể có hoặc không
    phone: z.string().min(1, {
        message: "Yêu cầu điền số điện thoại",
    }), // Thêm validate cho Số điện thoại
    address: z.string().min(1, {
        message: "Yêu cầu điền địa chỉ",
    }), // Thêm validate cho Địa chỉ
    province: z.string().min(1, {
        message: "Yêu cầu điền tỉnh/thành phố",
    }), // Thêm validate cho Tỉnh/Thành phố
    district: z.string().min(1, {
        message: "Yêu cầu điền quận/huyện",
    }), // Thêm validate cho Quận/Huyện
    ward: z.string().min(1, {
        message: "Yêu cầu điền phường/xã",
    }), // Thêm validate cho Phường/Xã
    department: z.number().min(1, {
        message: "Yêu cầu chọn khoa",
    }), // Thêm validate cho Khoa
    room: z.number().min(1, {
        message: "Yêu cầu chọn phòng",
    }), // Thêm validate cho Phòng
    position: z.number().min(1, {
        message: "Yêu cầu chọn chức danh",
    }), // Thêm validate cho Chức danh
});
export const RoomCatalogueSchema = z.object({
    keyword: z.string().min(1), // keyword không được bỏ trống
    name: z.string().min(1), // tên không được bỏ trống
    description: z.string().optional(), // description là tùy chọn
    status: z.union([z.literal(1), z.literal(0)]), // status chỉ nhận 1 hoặc 0
  });

  export const RoomSchema = z.object({
    code: z.string().min(1, { message: "Mã phòng là bắt buộc." }), // Mã phòng (unique)
    room_catalogue_id: z.bigint(), // Tham chiếu đến bảng room_catalogues
    department_id: z.bigint(), // Tham chiếu đến bảng departments
    status: z.union([z.literal(1), z.literal(0)]), // st // Trạng thái hoạt động (1-đang hoạt động, 0-bị dừng)
    current_bed: z.union([z.literal(1), z.literal(0)]), 
    total_bed: z.number().nonnegative({ message: "Số giường không thể âm." }), // Số giường có trong phòng
  });

  export const BedSchema = z.object({
    code: z.string().min(1, "Mã giường là bắt buộc"), // Mã giường (unique)
    room_id: z.bigint(), // Tham chiếu đến bảng rooms
    patient_id: z.bigint().optional(), // Tham chiếu đến bảng patients (optional)
    status: z.number().int().min(0).max(1, "Trạng thái không hợp lệ"), // Trạng thái (0-chưa có người nằm, 1-đã có người nằm)
    price: z.number().min(0, "Giá giường không được âm"), // Giá giường
    created_at: z.date(), // Ngày tạo
    updated_at: z.date(), // Ngày cập nhật
  });

  export const PermissionSchema = z.object({
    name: z.string()
      .min(1, { message: "Tên quyền không được để trống" }), // Tên quyền là chuỗi và không được để trống
    keyword: z.string()
      .min(1, { message: "Keyword không được để trống" }), // Keyword là chuỗi và không được để trống

  });

  export const ServiceCatalogueSchema = z.object({
    name: z.string()
      .min(1, { message: "Tên nhóm dịch vụ không được để trống" }), // Tên nhóm dịch vụ là chuỗi và không được để trống
    description: z.string().optional(), // Mô tả là chuỗi và có thể là tùy chọn
    status: z.number().int().min(0).max(1).default(1), // Changed to a number
  });



  export const ServiceSchema = z.object({
    name: z.string().min(1, "Tên dịch vụ là bắt buộc"),
    description: z.string().optional(),
    price: z.number().min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0"),
    serviceCatalogueId: z.bigint(),
    status: z.union([z.literal(0), z.literal(1)]),
    detail: z.string().optional(),
    healthInsuranceApplied: z.union([z.literal(0), z.literal(1)]).optional(),
    healthInsuranceValue: z.number().optional(),
    roomCatalogueId: z.bigint(),
  });

  export const MedicationCatalogueSchema = z.object({
    name: z.string().min(1, 'Tên nhóm dược là bắt buộc'), // Tên nhóm dược
    description: z.string().optional(), // Mô tả nhóm dược
  });


export const MedicationSchema = z.object({
  id: z.bigint(),
  name: z.string().nonempty("Tên dược phẩm không được để trống"),
  medicationCatalogueId: z.number().min(1, "ID nhóm dược phẩm không hợp lệ"),
  price: z.number().min(0, "Giá thuốc không được âm"),
  measure: z.string().nonempty("Đơn vị không được để trống"),
  measureCount: z.number().min(1, "Số lượng phải lớn hơn 0"),
  description: z.string().optional(),
});

export const PatientSchema = z.object({
    id: z.bigint().optional(), // optional because it may be auto-generated
    name: z.string().max(250, "Tên bệnh nhân không được vượt quá 250 ký tự"),
    birthday: z.number().optional(), // optional if not provided
    ward_id: z.string().max(255, "Phường/xã không được vượt quá 255 ký tự").optional(),
    district_id: z.string().max(255, "Quận/huyện không được vượt quá 255 ký tự").optional(),
    province_id: z.string().max(255, "Thành phố/tỉnh không được vượt quá 255 ký tự").optional(),
    address: z.string().max(255, "Địa chỉ không được vượt quá 255 ký tự").optional(),
    phone: z.string().max(20, "Số điện thoại không được vượt quá 20 ký tự").optional(),
    cccd_number: z.string().max(20, "Số căn cước công dân không được vượt quá 20 ký tự"),
    health_insurance_code: z.string().max(25, "Mã bảo hiểm y tế không được vượt quá 25 ký tự").optional(),
    guardian_phone: z.string().max(20, "Số điện thoại người giám hộ không được vượt quá 20 ký tự").optional(),
    gender: z.enum(['male', 'female'], {
        errorMap: () => ({ message: "Yêu cầu chọn giới tính" }),
    }),
  });
  export const DailyHealthSchema = z.object({
    temperature: z.number().default(37), // Nhiệt độ mặc định
    blood_pressure: z.string().max(10, "Huyết áp không được vượt quá 10 ký tự").nonempty("Huyết áp không được để trống"),
    heart_rate: z.number().int().positive("Nhịp tim phải là số nguyên dương").nonnegative("Nhịp tim không hợp lệ"),
    blood_sugar: z.number().optional(), // Đường huyết, có thể có hoặc không
    diagnosis: z.string().optional(),   // Chuẩn đoán, có thể có hoặc không
    note: z.string().optional(),        // Ghi chú thêm, có thể có hoặc không
  });
  