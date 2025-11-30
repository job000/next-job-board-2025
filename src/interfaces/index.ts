export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employer' | 'job-seeker';
    profile_pic: string;
    resume_url: string;
    bio: string;
    created_at: string;
    updated_at: string;
}