import React from 'react'
import {usePathname} from 'next/navigation';
import Header from './header';

function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <div className="p-5">{children}</div>
            </div>
    );

}

export default PrivateLayout
