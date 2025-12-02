import React from 'react'
import { IUser } from '@/interfaces';
import useUsersStore, { IUsersStore } from '@/store/users-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import SidebarMenuItems from './sidebar-menuitems';


function Header() {
    const { user }: IUsersStore = useUsersStore() as IUsersStore;
    const [openMenuItems, setOpenMenuItems] = React.useState<boolean>(false);

  return (
    <div className='bg-primary p-5 flex justify-between items-center'>
      <h1 className='text-white font-bold text-2xl'>Next-Hire</h1>
      <div className='flex gap-5 items-center'>
        <h1 className='text-sm text-white'>{user?.name} ({user?.role})</h1>
        <Button variant="secondary" onClick={() => setOpenMenuItems(true)}>
            {"  "}
            <Menu color='gray' size={15}/></Button>
      </div>
      <SidebarMenuItems 
      openMenuItems={openMenuItems} 
      setOpenMenuItems={setOpenMenuItems} role={user?.role || ''} />
    </div>
  )
}

export default Header
