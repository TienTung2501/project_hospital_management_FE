"use client"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"


import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import {  CreateUserSchema} from '@/schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"



import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/form-error';
import { ToastAction } from '@radix-ui/react-toast';

import  {Combobox}  from '@/components/combobox'

import { DataTable } from '@/components/data-table'
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import * as z from "zod"
import { createUser } from "@/actions/cartegory/user/createuser"


const departments = [
  { value: 1, label: "Khoa ngoại" },
  { value: 2, label: "Khoa nội" },
  { value: 3, label: "Khoa thần kinh" },
]
const rooms = [
  { value: 1, label: "Phòng khám 101" },
  { value: 2, label: "Phòng xét nghiệm 101" },
  { value: 3, label: "Phòng điều trị 101" },
]
const positions = [
  { value: 1, label: "Bác sĩ" },
  { value: 2, label: "Bác sĩ xét nghiệm" },
  { value: 3, label: "Bác sĩ điều trị" },
]

const CreateUser = () => {
  const [isPending,startTransition]=useTransition();
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const router=useRouter();
  const form=useForm<z.infer<typeof CreateUserSchema>>({
    resolver:zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cccd: "", // Khởi tạo giá trị mặc định cho Căn cước công dân
      gender: "male", // Khởi tạo giá trị mặc định cho giới tính
      phone: "", // Khởi tạo giá trị mặc định cho số điện thoại
      address: "", // Khởi tạo giá trị mặc định cho địa chỉ
      province: "", // Khởi tạo giá trị mặc định cho tỉnh/thành phố
      district: "", // Khởi tạo giá trị mặc định cho quận/huyện
      ward: "", // Khởi tạo giá trị mặc định cho phường/xã
      certificate: "", // Khởi tạo giá trị mặc định cho chứng chỉ
    },
  });
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  
  const onSubmit = (values: z.infer<typeof CreateUserSchema>) => {
    startTransition(() => {
      createUser(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
           
          } else if (data.success) {
            setError('');
            
            // Hiển thị toast cho thành công
            toast({
              variant:"success",
              title: "Thêm thành công",
              description: data.success,
              action: <ToastAction altText="Thử lại">Ok</ToastAction>
            });
            router.push('/main/cartegory/user')
            // Tắt sau khi thành công
          }
        })
    });
  };
  const handleReset = () => {
    form.reset(); // Reset form fields
    form.clearErrors(); // Clear validation errors
  };
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0  md:gap-8 bg-muted/40">
     <Form {...form}>
      
        <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4 mt-10">
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
                                        value="male"
                                        checked={field.value === "male"}
                                        onChange={() => field.onChange("male")}
                                        disabled={isPending}
                                      />
                                      <span>Nam</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        value="female"
                                        checked={field.value === "female"}
                                        onChange={() => field.onChange("female")}
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
                                disabled={isPending}
                                placeholder="abc123"
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

                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tỉnh/Thành phố</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Tỉnh/Thành phố"
                                    type="text"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quận/Huyện</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Quận/Huyện"
                                    type="text"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ward"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phường/Xã</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Phường/Xã"
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
                      name="department"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Khoa</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={departments}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn khoa"
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
                      name="room"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                              options={departments}
                              onSelect={handleSelectRecords}
                              placeholder="Chọn Phòng"
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
                    />
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
        </div>
     </Form>
  </main>
  )
}

export default CreateUser
