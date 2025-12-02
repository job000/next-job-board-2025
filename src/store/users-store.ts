import { IUser } from '@/interfaces'
import { create } from 'zustand'

const useUsersStore = create((set) => ({
  user: null,
  setUser: (payload: IUser) => set(() => ({ user: payload })),
}))

export default useUsersStore;

export interface IUsersStore {
  user: IUser | null;
  setUser: (payload: IUser) => void;
}

