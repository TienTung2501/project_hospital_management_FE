"use client";
import React, { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { CreateUserSchema } from "@/schema"; // Đảm bảo rằng schema phù hợp
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DepartmentType, PositionType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import * as z from "zod";
const EditUser = () => {
    const [positions, setPositions] = useState<PositionType[]>([]);
    const [departments, setDepartments] = useState<DepartmentType[]>([]);
    const [defaultPosition, setDefaultPosition] = useState<bigint>();
    const [defaultDepartment, setDefaultDepartment] = useState<bigint>();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const { toast } = useToast();
    const router = useRouter();
    const { id } = useParams(); // Lấy ID từ tham số URL
  
    const form = useForm<z.infer<typeof CreateUserSchema>>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
          name: "",
          email: "",
          password: "",
          gender:undefined,
          cccd: "",
          phone: "",
          address: "",
          certificate: "",
          department_id: undefined,
          position_id: undefined,
        },
      });
  const { setValue } = form;

 // Fetch user data, departments and positions
 useEffect(() => {

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
      const userId = id; // Thay thế với ID thực tế
      const userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`; // Đường dẫn API để lấy thông tin người dùng
      
      try {
        
          // Fetch user data
          const userResponse = await axios.get(userEndpoint);
          const userData = userResponse.data.data; // Giả sử API trả về dữ liệu người dùng
          if (userData) {
              setValue("name", userData.name);
              setValue("email", userData.email);
              setValue("cccd", userData.cccd);
              setValue("phone", userData.phone);
              setValue("address", userData.address);
              setValue("certificate", userData.certificate);
              setValue("gender",userData.gender);
              setValue("department_id", userData.department_id); // Khởi tạo giá trị department_id
              setValue("position_id", userData.position_id); // Khởi tạo giá trị position_id
              console.log( userData.department_id, userData.position_id);
          }
      } catch (error) {
          console.error("Failed to fetch user data", error);
          toast({ variant: "destructive", title: "Error", description: "Could not fetch user data." });
      }
  };



  // Gọi các hàm fetch dữ liệu
  fetchPositions();
  fetchDepartments();
  fetchUserData();
}, [id, setValue, toast]);
  const onSubmit = async (values: z.infer<typeof CreateUserSchema>) => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`; // Đường dẫn API để cập nhật thông tin người dùng
      const response = await axios.put(endpoint, values);
      if (response.data.success) {
        toast({ variant: "success", title: "Success", description: "User updated successfully!" });
        router.push("/main/cartegory/user"); // Quay về trang danh sách người dùng
      }
    } catch (error) {
      console.error("Error updating user", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update user." });
    }
  };
  const handleReset = () => {
    form.reset();
    form.clearErrors();
  };
  const handleSelectPosition = (value: bigint | null) => {
    if(value!==null)
      form.setValue('position_id', BigInt(value)); // Update the form value directly
    console.log(value)
  };
  const handleSelectDepartmemt = (value: bigint | null) => {
    if(value!==null)
      form.setValue('department_id', BigInt(value)); // Update the form value directly
    console.log(value)
  };
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý chức danh</h1>
    </div>
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4 mt-10">
      <Form {...form}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={()=>{router.push('/main/cartegory/user')}}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Thêm người dùng
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>

            <Button size="sm" type="submit" onClick={form.handleSubmit(onSubmit)}>Thêm Người Dùng</Button>
          </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                    value={0}
                                    checked={Number(field.value) === 0} // Convert field.value to a number
                                    onChange={() => field.onChange(0)}
                                    disabled={isPending}
                                  />
                                  <span>Nam</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value={1}
                                    checked={Number(field.value) === 1} // Convert field.value to a number
                                    onChange={() => field.onChange(1)}
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

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={true}
                              placeholder="example:abc123"
                              type="password"
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
              <div className="grid gap-6">
                <div className="grid gap-1">
                <FormField 
                              control={form.control}
                              name="department_id"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Chọn khoa</FormLabel>
                                      <FormControl>
                                      <Combobox<bigint>
                                          options={departments.map(department => ({
                                          value: department.id,
                                          label: department.name,
                                        }))}
                                          placeholder="Chọn khoa"
                                          onSelect={handleSelectDepartmemt}
                                          defaultValue={field.value}
                                      />

                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                </div>
                <div className="grid gap-1">
                <FormField 
                              control={form.control}
                              name="position_id"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Chức danh</FormLabel>
                                      <FormControl>
                                      <Combobox<bigint>
                                          options={positions && positions.length > 0 ? 
                                              positions.map(position => ({
                                                  value: position.id,
                                                  label: position.name,
                                              })) 
                                              : []
                                          }
                                          placeholder="Chọn chức danh"
                                          onSelect={handleSelectPosition}
                                          defaultValue={field.value}
                                      />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                </div>
                <div className="grid gap-1">
                  {/* <FormField 
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mr-2">Chức danh</FormLabel>
                        <FormControl className="flex-grow">
                          <Combobox<number>
                            options={departments}
                            onSelect={handleSelectRecords}
                            placeholder="Chọn chức danh"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
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
