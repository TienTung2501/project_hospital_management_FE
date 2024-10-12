"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { CreateUserSchema } from "@/schema";
import { getUserByEmail } from "@/lib/Data/user/user";
import { createSession } from "@/lib/session";


export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const validateFields = CreateUserSchema.safeParse(values);
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
