export interface HiveInfo {
  name: string;
  url?: string;
  port?: number;
  meta?: Record<string, any>;
}

export type JobHandler = (payload: any, hive: HiveInfo) => Promise<any> | any;

export interface Job {
  id: string;
  hive: string;
  handler: JobHandler;
}

export class KLH {
  private hives = new Map<string, HiveInfo>();
  private jobs = new Map<string, Job>();

  registerHive(info: HiveInfo) {
    this.hives.set(info.name, info);
  }

  listHives(): HiveInfo[] {
    return Array.from(this.hives.values());
  }

  registerJob(job: Job) {
    if (!this.hives.has(job.hive)) {
      throw new Error(`Hive not found for job: ${job.hive}`);
    }
    this.jobs.set(job.id, job);
  }

  listJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  async route(jobId: string, payload: any): Promise<any> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    const hive = this.hives.get(job.hive);
    if (!hive) {
      throw new Error(`Hive not found for job: ${job.hive}`);
    }
    return await job.handler(payload, hive);
  }
}
