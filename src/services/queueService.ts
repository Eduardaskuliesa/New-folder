import { queuesQueries } from "../queries/queuesQueries";
import { EmailQueue } from "../queues/emailQueue";
import { PausedQueue } from "../queues/pausedQueue";
import logger from "../utils/logger";

export class QueueService {
  static async getTimeLeft(jobId: string) {
    const job = await EmailQueue.getJob(jobId);
    if (!job) {
      logger.error(`Job services getTimeLeft ${jobId} not found`);
      return null;
    }
    const now = Date.now();
    const processAt = job.timestamp + (job.opts.delay ?? 0);
    const timeLeft = processAt - now;

    return timeLeft > 0 ? timeLeft : 0;
  }

  static async getJobFromQueues(jobId: string) {
    let job = await EmailQueue.getJob(jobId);

    if (!job) {
      job = await PausedQueue.getJob(jobId);
      if (!job) {
        logger.error(`Job services getJobFromQueues ${jobId} not found`);
        return null;
      }
      logger.success(`Job ${jobId} found in PausedQueue`);
    } else {
      logger.success(`Job ${jobId} found in EmailQueue`);
    }

    const item = await queuesQueries.getQuery(jobId);
    if (!item) {
      logger.error(
        `Job services getJobFromQueues ${jobId} not found in DyanmoDB`
      );
      return null;
    }
    logger.success(`Job ${item?.item?.jobId} found in DynamoDB`);

    return {
      job,
      data: item.item,
    };
  }
}
