import { error } from 'console';
import { queuesQueries } from ".";
import prisma from "../../services/prisma";
import { QueueService } from "../../services/queueService";
import logger from "../../utils/logger";

type Status = "SENT" | "FAILED" | "SENDING" | "QUEUED" | "PAUSED" | "INACTIVE";

interface UpdateStatus {
  status: Status;
  processed?: boolean;
  completed?: boolean;
  error?: string;
  incrementAttempts?: boolean;
}

export const updateStatusQuery = async (
  jobId: string,
  update: UpdateStatus
) => {
  try {
    const timestamp = new Date().toISOString();

    const data = {
      status: update.status,
      ...(update.incrementAttempts && { attempts: { increment: 1 } }),
      ...(update.processed && { processedAt: timestamp }),
      ...(update.completed && { completedAt: timestamp }),
      ...(update.error && { error: update.error }),
    };

    const job = await QueueService.getJobFromQueues(jobId);

    if (!job?.data?.id) {
      logger.warn("Job not yet exist or lost, tagId:", job.data?.tagId);
      return {
        success: false,
        message: 'Job lost..'
      }
    }
    const updateStatusResponse = await prisma.job.update({
      where: { id: jobId },
      data,
    });

    return {
      success: true,
      response: updateStatusResponse,
      message: 'Updated'
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to update job status ${error}`
    }
  }

};
