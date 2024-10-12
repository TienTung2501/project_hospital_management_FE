"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { CreateDepartmentSchema } from "@/schema";



export const create_department = async (values: z.infer<typeof CreateDepartmentSchema>) => {
  const validateFields = CreateDepartmentSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { name} = validateFields.data;


  if (name) {
    // TODO:
    // 4. Create user session
   
    
    // 5. Redirect user
  return { success: "Thêm thành công!" };
    
  } else {
    return { error: "Lỗi khi thêm" };
  }
};
