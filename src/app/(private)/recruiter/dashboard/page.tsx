'use client';
import React from 'react'
import {getLoggedInUser} from '@/actions/users';
import { IUser } from '@/interfaces';
import LogoutButton from '@/components/functional/logout-btn';

 function RecruiterDashboardPage() {
 const [user, setUser] = React.useState<IUser | null>(null);
 
 React.useEffect(() => {
    const fetchUser = async () => {
      const userResponse = await getLoggedInUser();

      if (userResponse.success) {
        setUser(userResponse.data);
      }
    };

    fetchUser();
 }, []);
 
 if (!user) {
   return <div>Loading...</div>;
 }

 return (
   <div className='flex flex-col gap-5 p-5'>
    <div className='flex flex-col border p-5 w-max border-gray-300'>
      <h1 className='text-2xl font-bold'>Recruiter Dashboard</h1>
     <p>Welcome, {user.name}!</p>
     <p>Your email: {user.email}</p>
     <p>Your role: {user.role}</p>
     {/* Add more dashboard components and features here */}
     <LogoutButton />
    </div>
   </div>
 )
}

export default RecruiterDashboardPage
