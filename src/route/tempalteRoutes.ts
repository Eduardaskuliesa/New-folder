import { Router, Express } from "express";
import { templateControllers } from "../controllers/templateControllers";

const router = Router();

export const templateRoutes = async (server: Express) => {
  server.get("/api/template", templateControllers.getAllTemplates);
  server.post("/api/template/create", templateControllers.createTemplate);
};

export default router;
