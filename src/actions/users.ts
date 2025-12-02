'use server';

import supabaseConfig from '@/config/supabase-config';
import { IUser } from '@/interfaces';
import bcrypt from 'bcryptjs';
import { success } from 'zod';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';


export const registerUser = async (payload: Partial<IUser>) => {
    try {
        //step 1: Check if user already exists
        const userExists = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email);

        if (userExists.error) {
            throw new Error(userExists.error.message);
        }

        if (userExists.data && userExists.data.length > 0) {
            throw new Error('User already exists with this email.');
        }

        //step 2: hash the password
        const hashedPassword = await bcrypt.hash(payload.password || '', 10);

        //step 3: Insert new user into database
        const { data: newUser, error: newUserError } = await supabaseConfig
            .from('user_profiles')
            .insert({
                ...payload,
                password: hashedPassword
            });

        if (newUserError) {
            throw new Error(newUserError.message);
        }
        return {
            success: true,
            message: 'User registered successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

export const loginUser = async (payload: Partial<IUser>) => {
    try {
        // Step 1: Fetch user from database
        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', payload.email?.toLowerCase());

        if(userResponse.error || userResponse.data.length === 0){
            throw new Error('User not found with this email.');
        }

        // Step 2: Compare passwords
        const user=userResponse.data[0] as IUser;
        const isPasswordValid = await bcrypt.compare(payload.password || '', user.password);
        if(!isPasswordValid){
            throw new Error('Invalid password.');
        }

        if(user.role !== payload.role){
            throw new Error('Unauthorized role access.');
        }
        
        // Step 3: Generate JWT token and return response
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        return { success: true, message: 'Login successful', data: token };
    } catch (error: any) {
        return {
            success: false,
            message: error.message,
        };
    }
};

export const getLoggedInUser = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            throw new Error('No authentication token found.');
        }

        // Verify JWT token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded || !decoded.id) {
            throw new Error('Invalid token.');
        }


        // Fetch user details from database
        const userResponse = await supabaseConfig
            .from('user_profiles')
            .select('*')
            .eq('email', decoded.email);

        if (userResponse.error || !userResponse.data) {
            throw new Error('User not found.');
        }
        const user = userResponse.data[0];
        //delete password before returning
        delete user.password;

        return {success: true, message: 'User fetched successfully', data: user };
    } catch (error: any) {
        return {success: false, message: error.message};
    }
};