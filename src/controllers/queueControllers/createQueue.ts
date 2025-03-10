import { Request, Response, RequestHandler } from "express";
import logger from "../../utils/logger";
import { EmailQueue } from "../../queues/emailQueue";
import { v4 as uuidv4 } from "uuid";
import { queuesQueries } from "../../queries/queuesQueries";
import { tagQueries } from "../../queries/tagQueries";
import { JobItem } from "../../queries/queuesQueries/createQuery";

export const createQueue: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId, tags } = req.body;

    // Only check for tags, since orderId is optional
    if (!tags || tags.length === 0) {
      res.status(400).json({
        success: false,
        message: "Missing required tags",
      });
      return;
    }

    const timestamp = new Date().toISOString();
    const createdJobs = [];

    for (const tag of tags) {
      const jobId = uuidv4();

      console.log(tag.scheduledFor);
      const scheduledFor = BigInt(tag.scheduledFor);
      console.log(scheduledFor);

      const job = await EmailQueue.add(
        "email-job",
        {
          jobId: jobId,
          tagName: tag.tagName,
          tagId: tag.tagId,
        },
        {
          jobId: jobId,
          delay: Number(scheduledFor), // Convert to number for BullMQ
          attempts: 3,
        }
      );

      const queueItem: JobItem = {
        id: jobId,
        orderId,
        tagId: tag.tagId,
        tagName: tag.tagName,
        status: "QUEUED",
        updatedAt: timestamp,
        scheduledFor, // Store as BigInt in database
        processedAt: undefined,
        error: null,
      };

      const result = await queuesQueries.createQueue(queueItem);
      await tagQueries.updateTagCount(tag.tagId, "increment");

      if (result.error) {
        await job.remove();
        throw new Error(
          `Failed to create queue for tag ${tag.tagName}: ${result.error}`
        );
      }

      createdJobs.push({
        queueId: jobId,
        jobId: job.id,
        tag: tag.tagName,
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdJobs.length} queue jobs`,
      data: createdJobs,
    });
  } catch (error) {
    logger.error("Failed to create queues", error);

    res.status(500).json({
      success: false,
      message: "Failed to create queues",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
