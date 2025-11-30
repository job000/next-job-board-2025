import React from 'react'
import {Button} from "@/components/ui/button";
import Link from 'next/link';

function HomePage() {
  return (
    <div>
      <div className='px-5 flex justify-between py-5 bg-primary'>
        <h1 className='font-bold text-2xl text-white'>Next-Hire</h1>
        <Button variant={'outline'}>
          <Link href={'/login'}>Login</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 min-h-[80vh] items-center px-20 mt-5">
        <div className="col-span-1 flex flex-col items-center">
          <div className="flex flex-col gap-2">
              <h1 className="text-primary text-4xl font-bold">Find your dream job today</h1>
              <p className='text-sm font-semibold text-gray-600'>
                Welcome to Next-Hire Job Board - your platform for discovering job opportunities. Browse jobs, 
                apply easily, or post job openings for qualified candidates.
              </p>
              <Button><Link href={'/register'}>Get Started</Link></Button>
            </div>
          </div>
        <div className="col-span-1 flex justify-center">
          <img src={'https://next-job-board-2025.vercel.app/hero.png'} className='object-contain h-96'></img>
        </div>
      </div>
    </div>
  )
}

export default HomePage
