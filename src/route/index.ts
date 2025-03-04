import { Express } from "express";
import { queueRoutes } from "./queueRoutes";
import { tagRoutes } from "./tagRoutes";
import { ruleRoutes } from "./ruleRoutes";
import { orderRoutes } from "./orderRoutes";
import { salesAgentRoutes } from "./salesAgentRoutes";
import { productRoutes } from "./productRoutes";
import { countryRoutes } from "./countryRoutes";

const routes = (server: Express) => {
  countryRoutes(server)
  queueRoutes(server);
  productRoutes(server)
  tagRoutes(server);
  ruleRoutes(server);
  orderRoutes(server);
  salesAgentRoutes(server);
};

export default routes;
