import { RequestHandler, Response, Request } from "express";
import { orderQueries } from "../../../queries/orderQueries";
import logger from "../../../utils/logger";
import { QueueService } from "../../../services/queueService";
import { BatchQueue } from "../../../queues/batchQueue";
import { Tag } from "@prisma/client";

export const addTagsToOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { filters, tagIds } = req.body;

    if (!filters) {
      res.status(400).json({
        success: false,
        message: "Missing filters in request body",
      });
      return;
    }

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Missing or invalid tags in request body",
      });
      return;
    }

    const totalCount = (await orderQueries.getFilteredOrders(filters)).totalCount

    const job = await BatchQueue.add(
      "add-tags",
      {
        type: "add-tags",
        filters,
        tagIds,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    res.status(202).json({
      success: true,
      message: "Tag addition process started",
      totalCount,
      jobId: job.id,
    });
  } catch (error) {
    logger.error("Failed to queue tag addition", error);
    res.status(500).json({
      success: false,
      message: "Failed to queue tag addition",
    });
  }
};
