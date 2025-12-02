'use client';
import React from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';



function LogoutButton() {
    const router = useRouter();
    const onLogout = async () => {
        try {
            Cookie.remove('token');
            Cookie.remove('role');
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            
        }
    }
  return (
    <div>
      <Button className='flex items-center gap-1'
      onClick={onLogout}>
        <LogOut size={16} />
        Logout
        </Button>
    </div>
  )
}

export default LogoutButton
