'user client';
import React from 'react'
import { getLoggedInUser} from '@/actions/users';
import { IUser } from '@/interfaces';
import LogoutButton from '@/components/functional/logout-btn';

async function JobSeekerDashboardPage() {
  const userResponse = await getLoggedInUser();

  if (!userResponse.success) {
    // Handle unauthenticated state, e.g., redirect to login page
    return <div>Please log in to access your dashboard.</div>;
  }
  
  const user: IUser = userResponse.data;
  //Logg for testing:
  console.log('Logged in user:', user);
  return (
    <div className='flex flex-col gap-5 p-5'>
     <div className='flex flex-col border p-5 w-max border-gray-300'>
       <h1 className='text-2xl font-bold'>Job Seeker Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Your email: {user.email}</p>
      <p>Your role: {user.role}</p>
      <LogoutButton />
     {/* Add more dashboard components and features here */}
     </div>
    </div>
  )
}

export default JobSeekerDashboardPage
