// app/main/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/context/UserContext";

type RoomType = {
  id: bigint;
  code: string;
  description: string;
  department_name: string;
};

const sampleRooms: RoomType[] = [
  {
    id: BigInt(1),
    code: "R101",
    description: "Phòng khám tổng quát",
    department_name: "Khoa Nội",
  },
  {
    id: BigInt(2),
    code: "R102",
    description: "Phòng siêu âm",
    department_name: "Khoa Chẩn đoán hình ảnh",
  },
  {
    id: BigInt(3),
    code: "R103",
    description: "Phòng hồi sức cấp cứu",
    department_name: "Khoa Cấp cứu",
  },
  {
    id: BigInt(4),
    code: "R104",
    description: "Phòng xét nghiệm",
    department_name: "Khoa Xét nghiệm",
  },
];

const page = () => {
  const { currentUser } = useUser(); // Lấy thông tin người dùng từ context
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    if (currentUser) {
      // Giả lập fetch phòng phụ trách từ dữ liệu của user
      const userRoomIds = currentUser.room_ids || []; // Dùng room_ids của user để lọc
      const filteredRooms = sampleRooms.filter((room) =>
        userRoomIds.includes(Number(room.id)) // So sánh room.id với userRoomIds
      );
      setRooms(filteredRooms);
      setLoading(false); // Đã tải xong dữ liệu
    }
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading trong khi thông tin người dùng chưa có
  }

  return (
    <div className="flex w-full flex-col justify-center items-center h-screen space-y-4">
      <h1 className="text-xl font-bold">
        Xin chào {currentUser?.name}, bạn đang đăng nhập vào hệ thông với vai trò: Bác sĩ khám
      </h1>
      <p className="text-lg">Danh sách các phòng phụ trách</p>
      <ul className="w-full max-w-md space-y-3">
        {rooms.map((room) => (
          <li
            key={room.id.toString()}
            className="border rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <Link href={`/main/receivepatient/${room.code}`}>

                <h2 className="font-semibold text-lg">{room.description}</h2>
                <p className="text-sm text-gray-600">Phòng: {room.code}</p>
                <p className="text-sm text-gray-600">
                  Khoa: {room.department_name}
                </p>

            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default page;
