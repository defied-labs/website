import { ExpressAuth } from "@auth/express";
import type { RequestHandler } from "express";
import { authConfig } from "./auth.config";

export const authHandler: RequestHandler = ExpressAuth(
  authConfig,
) as RequestHandler;
