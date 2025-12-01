export interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role:  'recruiter' | 'job-seeker';
    profile_pic: string;
    resume_url: string;
    bio: string;
    created_at: string | null;
    updated_at: string;
}