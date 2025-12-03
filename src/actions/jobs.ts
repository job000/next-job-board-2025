"use server";

import supabaseConfig from "@/config/supabase-config";
import { IJob } from "@/interfaces";

export const createJob = async (payload: Partial<IJob>) => {
  try {
    const insertJob = await supabaseConfig.from("jobs").insert([payload]);
    if (insertJob.error) {
      throw new Error(insertJob.error.message);
    }
    return {
      success: true,
      message: "Job created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getJobById = async (jobId: number) => {
  try {
    const jobResponse = await supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")
      .eq("id", jobId);

    if (jobResponse.error || jobResponse.data.length === 0) {
      throw new Error("Job not found");
    }
    const job = jobResponse.data[0];
    return {
      success: true,
      data: job,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const editJobById = async (jobId: number, payload: Partial<IJob>) => {
  try {
    const updateJob = await supabaseConfig
      .from("jobs")
      .update(payload)
      .eq("id", jobId);
    if (updateJob.error) {
      throw new Error(updateJob.error.message);
    }
    return {
      success: true,
      message: "Job updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteJobById = async (jobId: number) => {
  try {
    const deleteJob = await supabaseConfig
      .from("jobs")
      .delete()
      .eq("id", jobId);
    if (deleteJob.error) {
      throw new Error(deleteJob.error.message);
    }
    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getJobsOfRecruiter = async (recruiterId: number) => {
  try {
    const jobsResponse = await supabaseConfig
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiterId)
      .order("created_at", { ascending: false });
    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }
    return {
      success: true,
      data: jobsResponse.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllActiveJobs = async (filters: any) => {
  try {
    // filters yet to be implemented

    const qry = supabaseConfig
      .from("jobs")
      .select("* , recruiter:user_profiles(name , id)")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (filters.keywords) {
      qry.contains(
        "skills",
        filters.keywords.split(",").map((kw: string) => kw.trim())
      );
    }

    if (filters.location) {
      qry.ilike("location", `%${filters.location}%`);
    }

    if (filters.jobType) {
      qry.eq("job_type", filters.jobType);
    }

    if (filters.minSalary) {
      qry.gte("min_salary", Number(filters.minSalary));
    }

    if (filters.maxSalary) {
      qry.lte("max_salary", Number(filters.maxSalary));
    }

    if (filters.experienceLevel) {
      let from = filters.experienceLevel.split("-")[0];
      let to = filters.experienceLevel.split("-")[1];

      qry.gte("exp_required", Number(from));
      qry.lte("exp_required", Number(to));
    }

    const jobsResponse = await qry;

    if (jobsResponse.error) {
      throw new Error(jobsResponse.error.message);
    }

    return {
      success: true,
      data: jobsResponse.data,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};