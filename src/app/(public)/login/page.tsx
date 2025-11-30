'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { userRoles } from '@/constants';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoveLeft } from 'lucide-react';



const formSchema = z.object({
  email: z.email({message:"Invalid email address."}),
  password: z.string().min(6,{message:"Password must be at least 6 characters."}),
  role: z.string().optional(),
})


function LoginPage() {


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "job-seeker",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>
        <div className="flex justify-between items-center mb-5">
          <h1 className='text-primary font-bold text-lg'>
            Login to your account
          </h1>
            <Button variant={'ghost'} className='flex items-center gap-1' >
              <MoveLeft className='text-gray-500'/>
              <Link href={'/'}>Home</Link>
            </Button>
        </div>
        <hr className='border border-gray-300 my-4'>
            </hr>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
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
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl className='select'>
                          <Select onValueChange={field.onChange} value={field.value} >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {userRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        </FormControl>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   
                  

                  <Button type="submit" className='w-full'>Login</Button>
                  <div className='flex justify-center gap-1'>
                    <p className='text-sm text-gray-600'>Don't have an account?</p>
                    <Link href={'/register'} className='text-sm text-primary font-medium'>Register</Link>
          
                  </div>
                </form>
              </Form>
      </div>

    </div>
  )
}

export default LoginPage
