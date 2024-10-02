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