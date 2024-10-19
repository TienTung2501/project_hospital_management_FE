export interface UserType{
    email:string;
    password:string;
    name:string;
    role:string;
}
export interface LinkBaseRoleType {
    role: string;
    link: string[];
  }

  export type UserInfoType = {
    id: BigInt;
    name: string;
    email: string;
    password: string;
    ward_id?: string;
    district_id?: string;
    province_id?: string;
    address?: string;
    phone?: string;
    cccd: string;
    certificate?: string;
    gender: 1 | 2 | 3; // 1 - male, 2 - female, 3 - other
    status: boolean; // 0 - inactive, 1 - active
    created_at: Date;
    updated_at: Date;
    position_id: BigInt;
    department_id: BigInt;
  };
  
  
  export type WardType = {
    id: string; // ID Phường/Xã
    name: string; // Tên Phường/Xã
    district_id: string; // Mã Quận/Huyện tham chiếu
  };
  
  export type DistrictType = {
    id: string; // ID Quận/Huyện
    name: string; // Tên Quận/Huyện
    province_id: string; // Mã Thành phố/Tỉnh tham chiếu
  };
  
  export type ProvinceType = {
    id: string; // ID Thành phố/Tỉnh
    name: string; // Tên Thành phố/Tỉnh
  };
  
  export type PositionType = {
    id: bigint; // ID tự tăng, khóa chính
    name: string; // Tên chức danh
    description?: string; // Mô tả (optional)
    status: number; // 1-đang hoạt động, 0-bị dừng hoạt động
    created_at: Date; // Ngày tạo
    updated_at: Date; // Ngày cập nhật
  };
  export type DepartmentType = {
    id: bigint; // hoặc bigint
    name: string; 
    description?: string; 
    status?: number; 
  };
  

  export type RoomCatalogueType = {
    id: bigint; // ID tự tăng, khóa chính
    keyword: string; // Keyword (e.g., "NOITRU")
    name: string; // Tên danh mục phòng
    description?: string; // Mô tả (optional)
    status: number; // 1-đang hoạt động, 0-bị dừng hoạt động
    created_at: Date; // Ngày tạo
    updated_at: Date; // Ngày cập nhật
  };
  export type RoomType = {
    id: bigint; // ID tự tăng, khóa chính
    code: string; // Mã phòng (unique)
    status: number; // Trạng thái hoạt động (1-đang hoạt động, 0-bị dừng)
    created_at: Date; // Ngày tạo
    updated_at: Date; // Ngày cập nhật
    room_catalogue_id: bigint; // Tham chiếu đến bảng room_catalogues
    department_id: bigint; // Tham chiếu đến bảng departments
    current_bed: number; // Trạng thái giường (0 - chưa đầy, 1 - đầy)
    total_bed: number; // Số giường có trong phòng
  };

  export type UserRoomType = {
    user_id: bigint; // Tham chiếu đến bảng users
    room_id: bigint; // Tham chiếu đến bảng rooms
  };

  export type BedType = {
    id: bigint; // ID tự tăng, khóa chính
    code: string; // Mã giường (unique)
    status: number; // Trạng thái (0-chưa có người nằm, 1-đã có người nằm)
    room_id: bigint; // Tham chiếu đến bảng rooms
    patient_id?: bigint; // Tham chiếu đến bảng patients (optional)
    price: number; // Giá giường
    created_at: Date; // Ngày tạo
    updated_at: Date; // Ngày cập nhật
  };

  export type PermissionType = {
    id: bigint; // ID tự tăng, khóa chính
    name: string; // Tên quyền
    keyword: string; // Từ khóa quyền
    created_at: Date; // Ngày tạo
    updated_at: Date; // Ngày cập nhật
  };

  export type PositionPermissionType = {
    position_id: bigint; // Tham chiếu đến bảng positions
    permission_id: bigint; // Tham chiếu đến bảng permissions
  };

  export type DataRow = {
    id: string; // Thêm trường id nếu cần
    [key: string]: any; // Cho phép các trường khác với kiểu dữ liệu không xác định
  }
  // Loại phòng (phòng khám tai-mũi họng, phòng nội trú, phòng xét nghiệm,..)
  export type RoomCatalogue = {
  id: bigint;
  keyword: string; // ví dụ phòng nội trú thì keyword là 'NOITRU'
  name: string;
  description?: string;
  status: 1 | 0; // 1 - đang hoạt động, 0 - bị dừng hoạt động
  created_at: Date;
  updated_at: Date;
};

// Phòng (402, 501,..)
export type Room = {
  id: bigint;
  code: string; // mã phòng như 402, 501
  status_active: 1 | 0; // 1 - đang hoạt động, 0 - không hoạt động
  created_at: Date;
  updated_at: Date;
  room_catalogue_id: bigint; // liên kết tới RoomCatalogue
  department_id: bigint; // liên kết tới bảng Department
  status_bed: 0 | 1; // 0 - chưa đầy, 1 - đầy
  total_bed: number; // số giường có trong phòng
};

    // Giường bệnh
export type Bed = {
  id: bigint;
  code: string; // mã giường, ví dụ 'B01', 'B02'
  status: 0 | 1; // 0 - chưa có người nằm, 1 - đã có người nằm
  room_id: bigint; // liên kết tới Room
  patient_id?: bigint; // liên kết tới Patient, có thể là undefined nếu chưa có người nằm
  price: number; // giá giường, mặc định là 200000
  created_at: Date;
  updated_at: Date;
};

// Quyền (Permissions)
export type Permission = {
  id: bigint;
  name: string; // tên quyền
  keyword: string; // keyword để nhận diện quyền
  created_at: Date;
  updated_at: Date;
};
// Định nghĩa cho nhóm dịch vụ
export type ServiceCatalogue = {
  id: bigint;                      // ID của nhóm dịch vụ
  name: string;                   // Tên nhóm dịch vụ
  description?: string;           // Mô tả về nhóm dịch vụ (tuỳ chọn)
  status: 0 | 1;                  // Trạng thái: 0 (dừng hoạt động) hoặc 1 (đang hoạt động)
  created_at: Date;                // Thời gian tạo
  updated_at: Date;                // Thời gian cập nhật
};

// Định nghĩa cho dịch vụ
export type Service = {
  id: bigint;                      // ID của dịch vụ
  name: string;                   // Tên dịch vụ
  description?: string;           // Mô tả về dịch vụ (tuỳ chọn)
  price: number;                  // Phí dịch vụ
  serviceCatalogueId: bigint;     // ID nhóm dịch vụ mà dịch vụ thuộc về
  status: 0 | 1;                  // Trạng thái: 0 (dừng hoạt động) hoặc 1 (đang hoạt động)
  detail?: string;                // Thông tin chi tiết về dịch vụ (tuỳ chọn)
  healthInsuranceApplied?: 0 | 1; // Có áp dụng giảm phí cho bệnh nhân có bảo hiểm y tế không (tuỳ chọn, mặc định là 0)
  healthInsuranceValue?: number;  // Giá trị giảm phí bảo hiểm y tế (%), mặc định là 0%
  roomCatalogueId: bigint;        // ID nhóm phòng mà dịch vụ thuộc về
  created_at: Date;                // Thời gian tạo
  updated_at: Date;                // Thời gian cập nhật
};

export type MedicationCatalogue = {
  id: bigint;                         // Khóa chính         // Khóa ngoại tham chiếu đến nhóm dược cha (nếu có)
  name: string;                       // Tên nhóm dược
  description?: string;               // Mô tả nhóm dược
  created_at: Date;                    // Thời gian tạo bản ghi
  updated_at: Date;                    // Thời gian cập nhật bản ghi              // Trạng thái xóa (true: đã xóa, false: chưa xóa)
};

export type Medication = {
  id: bigint;                         // Khóa chính
  name: string;                       // Tên dược phẩm
  medicationCatalogueId: number;      // Khóa ngoại tham chiếu đến nhóm dược
  price: number;                      // Giá của dược phẩm
  measure: string;                    // Đơn vị đo lường (ví dụ: viên, túi, ...)
  measureCount: number;               // Số lượng tính theo đơn vị
  description?: string;               // Mô tả dược phẩm
  created_at: Date;                    // Thời gian tạo bản ghi
  updated_at: Date;                    // Thời gian cập nhật bản ghi             // Trạng thái xóa (true: đã xóa, false: chưa xóa)
};
