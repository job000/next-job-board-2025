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
import { registerUser } from '@/actions/users';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';



const formSchema = z.object({
  name: z.string().min(2,{message:"Username must be at least 2 characters."}),
  email: z.email({message:"Invalid email address."}),
  password: z.string().min(6,{message:"Password must be at least 6 characters."}),
  role: z.enum(['recruiter', 'job-seeker']).optional(),
})


function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  
  // 1. Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "job-seeker",
    },
  })
 
  // 2. Define a submit handler.
   async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const response = await registerUser(values);
    if(response.success){
      toast.success(response.message);
      form.reset();
      router.push('/login');
    }else{
      toast.error(response.message);
    }
    setLoading(false);
  }

  return (
    <div className='bg-gray-200 flex items-center justify-center min-h-screen'>
      
      <div className='bg-white flex flex-col shadow rounded p-5 w-[450px]'>
        <div className="flex justify-between items-center mb-5">
          <h1 className='text-primary font-bold text-lg'>
            Register account
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                   
                  

                  <Button type="submit" className='w-full' disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                  
                  <div className='flex justify-center gap-1'>
                    <h1 className='text-sm'>
                      Already have an account?{' '}
                      <Link href={'/login'} className='text-sm underline'>
                        Login
                      </Link>
                    </h1>
                  </div>
                </form>
              </Form>
      </div>

    </div>
  )
}

export default RegisterPage
