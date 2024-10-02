"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/schema";
import { getUserByEmail } from "@/lib/Data/user/user";
import { createSession, deleteSession } from "@/lib/session";


export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validateFields = LoginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { email, password } = validateFields.data;
  const user = await getUserByEmail(email)

  if (user && await bcrypt.compare(password, user.password)) {
    // TODO:
    // 4. Create user session
    //await createSession(user.email,user.role)
    
    // 5. Redirect user
  return { success: "Login successful!" };
    
  } else {
    return { error: "Invalid email or password!" };
  }
};

// export async function logout() {
//   deleteSession()
//   redirect('/login')
// }
