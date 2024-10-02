"use client";

import React, { useState } from 'react'
import { useTransition } from 'react';
import * as z from "zod"


import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import {  RegisterSchema } from '@/schema';
import { CardWarpper } from './card-wrapprt'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '../form-success';

import { register } from '@/actions/register';

const RegisterForm = () => {
  const [error,setError]=useState<string|undefined>("");
  const [success,setSuccess]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const form=useForm<z.infer<typeof RegisterSchema>>({
    resolver:zodResolver(RegisterSchema),
    defaultValues:{
      email:"",
      password:"",
      name:"",
    },
  });

  const onSubmit=(values:z.infer<typeof RegisterSchema>)=>{
    setError("");
    setSuccess("");
    startTransition(()=>{
      register(values)
      .then((data)=>{
        setError(data.error);
        setSuccess(data.success);
      })
    });
  }

  return (
    <CardWarpper
      headerLabel='Create an account'
      backButtonLabel='Already have Acount?'
      backButtonHref='/auth/login'
      showSocial
    >
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        >
          <div className="space-y-4">
          <FormField
              control={form.control}
              name="name"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field}
                      disabled={isPending}
                      placeholder='your name'
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input {...field}
                      disabled={isPending}
                      placeholder='yourname0123@example.com'
                      type="email"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input {...field}
                      disabled={isPending}
                      placeholder='******'
                      type="password"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
             
          </div>
          <FormError message={error}/>
          <FormSuccess message={success}/>
          <Button 
            disabled={isPending}
            type='submit'
            className='w-full'
          >
            Register
          </Button>
      </form>
     </Form>
    </CardWarpper>
  )
}

export default RegisterForm
