'use client'
import React from 'react'
import {usePathname} from 'next/navigation';
import PrivateLayout from './private';

function CustomLayout({ children }: { children: React.ReactNode }) {
    const path=usePathname();
    const isPrivate=path.startsWith('/job-seeker') || path.startsWith('/recruiter');
    if(!isPrivate){
        return children;
    }
    return <PrivateLayout>{children}</PrivateLayout>;
}

export default CustomLayout
