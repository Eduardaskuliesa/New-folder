import { createOrder } from "./createQuery";
import { deleteOrder } from "./deleteQuery";
import { getFilteredOrders } from "./getFilteredQuery";
import { getAllOrders } from "./getManyQuery";
import { getOrder } from "./getQuery.ts";

export const orderQueries = {
  createOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  getFilteredOrders,
};
