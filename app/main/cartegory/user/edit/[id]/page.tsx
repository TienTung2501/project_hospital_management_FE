"use client";
import React, {  useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {  UpdateUserSchema } from "@/schema"; // Đảm bảo rằng schema phù hợp
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DepartmentType, PositionType, RoomCatalogueType, RoomType, UserInfoType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import * as z from "zod";
import { create_user, update_user } from "@/actions/cartegory/user";
import { ToastAction } from "@/components/ui/toast";
 const  EditUser = () => {
    const [user,setUser]=useState<UserInfoType>();
    const [positions, setPositions] = useState<PositionType[]>([]);
    const [departments, setDepartments] = useState<DepartmentType[]>([]);
    const [selectedDepartment, setSelectedDepartment] = React.useState<bigint | null>(null);
    const [roomCatalogues,setRoomCatalogue]=useState<RoomCatalogueType[]>([]);
    const [rooms, setRooms] = useState<RoomType[]>([]);
    const [totalRecords, setTotalRecords] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>("");
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams(); // Lấy ID từ tham số URL
    const form = useForm<z.infer<typeof UpdateUserSchema>>({
        resolver: zodResolver(UpdateUserSchema),
      });
      const handleSelectRoomCatalogue=(value: bigint | null) => {
        if(value){
          setSelectedRooms([])
          fetchRooms(value); // Lấy danh sách phòng mới theo department_id
        }
          
        };
  const { reset} = form;

 // Fetch user data, departments and positions
 const fetchPositions = async () => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;
      
  try {
      const response = await axios.get(endpoint);
      const totalRecords = response.data.data.total;
      const responseAll = await axios.get(endpoint, {
          params: {
              limit: totalRecords, // Số bản ghi trên mỗi trang
          },
      });
      const { data } = responseAll.data.data;
      if (Array.isArray(data)) {
          const positionlist: PositionType[] = data
              .filter((item: any) => item.status === 1) // Lọc các phần tử có status bằng 1
              .map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  status: item.status,
              })); // Chỉ lấy các thuộc tính cần thiết
          setPositions(positionlist); // Cập nhật danh sách chức danh
      }
  } catch (err) {
      console.error("Error fetching positions:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not load positions." });
  }
};

const fetchDepartments = async () => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/departments`;
      
  try {
      const response = await axios.get(endpoint);
      const totalRecords = response.data.data.total;
      const responseAll = await axios.get(endpoint, {
          params: {
              limit: totalRecords, // Số bản ghi trên mỗi trang
          },
      });
      const { data } = responseAll.data.data;
      if (Array.isArray(data)) {
          const departmentlist: DepartmentType[] = data
              .filter((item: any) => item.status === 1) // Lọc các phần tử có status bằng 1
              .map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  status: item.status,
              }));    
          setDepartments(departmentlist); // Cập nhật danh sách phòng ban
      }
  } catch (err) {
      console.error("Error fetching departments:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not load departments." });
  }
};

const fetchUserData = async () => {
const userId = id; // Replace with actual ID
const userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`; // API endpoint to fetch user data

try {
  // Fetch user data
  const userResponse = await axios.get(userEndpoint);
  const userData = userResponse.data.data; // Assuming the API returns user data
  if (userData) {
    reset({
      name: userData.name,
      email: userData.email,
      cccd: userData.cccd,
      phone: userData.phone,
      address: userData.address,
      certificate: userData.certificate,
      gender: userData.gender,
      department_id: userData.department_id, // Giá trị phải khớp với options
      position_id: userData.position_id, // Giá trị phải khớp với options
    });
    setUser(userData); // Set user data correctly
  }
} catch (error) {
  console.error("Failed to fetch user data", error);
  toast({ variant: "destructive", title: "Error", description: "Could not fetch user data." });
}
};
const fetchRooms = async (value: bigint) => {
  setLoading(true);
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;

  try {
    // Gọi API để lấy tổng số bản ghi cho departmentId và keyword
    const initialResponse = await axios.get(endpoint, {
    });

    const totalRecords = initialResponse.data.data.total;

    // Gọi API với limit = totalRecords để lấy tất cả các phòng
    const response = await axios.get(endpoint, {
      params: {
        limit: totalRecords,
      },
    });

    const { data } = response.data.data;
    if (Array.isArray(data)) {
      // Lọc các phòng có room_catalogue.name là "NOTRU"
      const fetchedRooms: RoomType[] = data
        .filter((item: any) => item.department_id===selectedDepartment&&item.users.length===0&&item.room_catalogue_id===value) // Chỉ lấy phòng có tên "NOTRU"
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          department_name: item.department.name,
          room_catalogue_code: item.room_catalogue.keyword,
          description: item.room_catalogue.description,
          beds_count: item.beds_count,
          status_bed: item.status_bed,
          status: item.status,
          department_id: item.department_id,
          room_catalogue_id: item.room_catalogue_id,
        }));
      setRooms(fetchedRooms); // Cập nhật danh sách phòng
      setTotalRecords(totalRecords);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    setError('Error fetching rooms');
    console.error('Error fetching rooms:', err);
  } finally {
    setLoading(false);
  }
};
const fetchRoomCatalogues = async () => {
  setLoading(true) // Bắt đầu trạng thái loading
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
  try {
    const response = await axios.get(endpoint, {
      params: {
        limit: 1000, // Số bản ghi trên mỗi trang
      },
    })
    const { data } = response.data.data

    if (Array.isArray(data)) {
      const fetchedRoomCatalogues: RoomCatalogueType[] = data.map((item: any) => ({
        id: item.id,
        keyword:item.keyword,
        name: item.name,
        description: item.description,
        status: item.status,
      })) // Chỉ lấy các thuộc tính cần thiết
  
      setRoomCatalogue(fetchedRoomCatalogues) // Cập nhật danh sách phòng ban
      setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
    } else {
      throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
    }
  } catch (err) {
    setError('Error fetching RoomCatalogues') // Xử lý lỗi
    console.error('Error fetching RoomCatalogues:', err)
  } finally {
    setLoading(false) // Kết thúc trạng thái loading
  }
}
useEffect(() => {
  const fetchAllData = async () => {
    try {
      await fetchUserData(); // Sau đó mới fetch user
       fetchPositions(); // Đợi positions tải xong
       fetchDepartments(); // Đợi departments tải xong
       fetchRoomCatalogues();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchAllData();
}, []);

const onSubmit = (values: z.infer<typeof UpdateUserSchema>) => {
  setError("");
  const selectedRoomsAsNumbers = selectedRooms.map(roomId => Number(roomId));
startTransition(()=>{
  console.log(selectedRoomsAsNumbers)
  update_user(user?.id,values,selectedRoomsAsNumbers)
  .then((data) => {
    if (data.error) {
      setError(data.error);
      toast({
        variant:"destructive",
        title: "Lỗi khi thêm",
        description: data.error,
        action: <ToastAction altText="Try again">Ok</ToastAction>,
      });
     
    } else if (data.success) {
      setError('');
      // Hiển thị toast cho thành công
      toast({
        variant:"success",
        title: "Thêm thành công",
        description: data.success,
        action: <ToastAction altText="Try again">Ok</ToastAction>,
      });
      // Điều hướng sau khi thành công
      router.push('/main/cartegory/user')
    }
  })
});
};
  const handleReset = () => {
    form.reset();
    form.clearErrors();
  };
  const handleSelectPosition = (value: bigint | null) => {
    if(value!==null)
      form.setValue('position_id', BigInt(value)); // Update the form value directly
  };
  const handleSelectDepartmemt = (value: bigint | null) => {
    if (value !== null) {
      setSelectedRooms([]); // Reset danh sách phòng đã chọn
      setSelectedValue(null); // Reset giá trị Combobox
      setSelectedDepartment(value)
      form.setValue('department_id', BigInt(value)); // Cập nhật giá trị trong form
    }
  };

// room_ids
  const [selectedRooms, setSelectedRooms] = React.useState<bigint[]>([]);
  const [selectedValue, setSelectedValue] = React.useState<bigint | null>(null);

  const handleSelectRoom = (value: bigint | null) => {
    // Chỉ thêm nếu giá trị chưa có trong danh sách đã chọn
    if (value !== null && !selectedRooms.includes(value)) {
      setSelectedRooms((prev) => [...prev, value]);
      setSelectedValue(null); // Reset giá trị Combobox về mặc định
    }
  };

  const handleRemoveCategory = (value: bigint) => {
    setSelectedRooms((prev) => prev.filter((category) => category !== value));
  };
 
//
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý ngươi dùng</h1>
    </div>
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4 mt-10">
      <Form {...form}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={()=>{router.push('/main/cartegory/user')}}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Thêm người dùng
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                  Đặt lại
                </Button>

            <Button size="sm" type="submit" onClick={form.handleSubmit(onSubmit)}>Lưu thông tin</Button>
          </div>
        </div>
        <form>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card x-chunk="dashboard-07-chunk-0">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Thông tin cá nhân của nhân viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[2fr_2fr_1fr] gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên nhân viên</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Example: Nguyễn Văn A"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cccd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Căn cước công dân</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="123456789012"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới tính</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value={1}
                                    checked={Number(field.value) === 1} // Convert field.value to a number
                                    onChange={() => field.onChange(1)}
                                    disabled={isPending}
                                  />
                                  <span>Nam</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value={0}
                                    checked={Number(field.value) === 0} // Convert field.value to a number
                                    onChange={() => field.onChange(0)}
                                    disabled={isPending}
                                  />
                                  <span>Nữ</span>
                                </label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isPending}
                              placeholder="abc@Example.com"
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                  </div>
                </div>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-07-chunk-0">
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>
                  Thông tin địa chỉ, số điện thoại liên hệ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại liên hệ</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isPending}
                                  placeholder="0901234567"
                                  type="text"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Địa chỉ liên hệ</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isPending}
                                  placeholder="Số nhà, đường, phường, quận"
                                  type="text"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader>
                <CardTitle>Thông tin công tác</CardTitle>
                <CardDescription>
                  Khoa, phòng ban, chức danh
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col gap-4">

              <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mr-2">Khoa</FormLabel>
                        <FormControl className="flex-grow">
                          <Combobox<bigint>
                            options={departments.map((dep) => ({ value: dep.id, label: dep.name }))}
                            placeholder="Chọn khoa"
                            onSelect={handleSelectDepartmemt}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="position_id"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mr-2">Chức danh</FormLabel>
                        <FormControl className="flex-grow">
                          <Combobox<bigint>
                            options={positions.map((pos) => ({ value: pos.id, label: pos.name }))}
                            placeholder="Chọn chức danh"
                            onSelect={handleSelectPosition}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
<FormItem className="flex flex-col">
      <FormLabel className="mr-2">Nhóm phòng</FormLabel>
      <FormControl className="flex-grow">
      <Combobox<bigint|null>
            options={roomCatalogues.map(roomCatalogue => ({
              value: roomCatalogue.id,
              label: roomCatalogue.name,
            }))}
              placeholder="Chọn nhóm phòng"
              onSelect={handleSelectRoomCatalogue}
              />
              </FormControl>
              <FormMessage />
                            </FormItem>
                
                <div className="grid gap-1">
                <p className="font-semibold text-l"> Chọn phòng</p>
                <Combobox<bigint>
                  options={rooms.map(room => ({
                    value: room.id,
                    label: room.code,
                  }))}
                  onSelect={handleSelectRoom}
                  placeholder="Chọn phòng"
                  defaultValue={selectedValue} // Liên kết với selectedValue
                />


                {selectedRooms.length !== 0 && (
                      <div className="flex flex-wrap mt-4 space-x-1 border border-black-300 rounded-md p-2 pb-0">
                      {selectedRooms.map((roomId) => {

                        console.log(selectedRooms)
                        const room = rooms.find((room) => room.id === roomId);
                        console.log(room?.code)
                        return (
                          <div
                            key={roomId}
                            className="flex items-center justify-between p-2 bg-black-100 text-black-800 border border-black-300 rounded-md shadow-sm transition-all duration-300 hover:shadow-md w-fit mb-2" // Thêm width cố định
                          >
                            <span className="text-sm">{room?.code}</span>
                            <button
                              onClick={() => handleRemoveCategory(roomId)}
                              className="text-black-500 hover:text-black-700 font-bold text-xs pl-1"
                            >
                              x
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                  )}
              </div>
              </div>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader>
                <CardTitle>Thông tin học vấn</CardTitle>
                <CardDescription>
                  Chứng chỉ ngành nghề, học hàm học vị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-1">
                  <FormField
                        control={form.control}
                        name="certificate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên chứng chỉ</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Ví dụ: chứng chỉ hành nghề chẩn đoán mọi bệnh"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                 
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      
      </form>
    </Form>
      </div>
      {error && <p className="text-red-600">{error}</p>}
  </main>
  );
};


export default EditUser;
