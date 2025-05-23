import { RequestHandler, Request, Response } from "express";
import { QueueService } from "../../../services/queueService";
import { orderQueries } from "../../../queries/orderQueries";
import { validateAndGetExistingOrders } from "../../../helpers/validateAndGetOrders";
import logger from "../../../utils/logger";

export const deleteSelectedOrders: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Mising required fields",
      });
      return;
    }
    const { existingOrderIds, missingOrderIds } =
      await validateAndGetExistingOrders(orderIds);

    if (existingOrderIds.length === 0) {
      logger.warn("No existing orders");
      res.status(400).json({
        success: false,
        message: "No existing order/s with provided orderIDs",
      });
      return;
    }

    const jobsResult = await QueueService.removeTagsFromOrders(
      existingOrderIds
    );

    const deletedOrders = await orderQueries.deleteOrdersById(existingOrderIds);

    if (!deletedOrders.success) {
      res.status(400).json({
        success: false,
        message: deletedOrders.message,
      });
    }

    const message =
      missingOrderIds.length > 0
        ? `Successfully removed: ${jobsResult.totalJobsRemoved} jobs and ${
            deletedOrders.deletedOrderCount
          } orders. Missing orders: ${missingOrderIds.join(", ")}`
        : `Successfully removed: ${jobsResult.totalJobsRemoved} jobs and ${deletedOrders.deletedOrderCount} orders`;

    res.status(200).json({
      success: true,
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed deleted selected orders ${error}`,
    });
  }
};
