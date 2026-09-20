import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { env } from "@defied/env/server";
import { authHandler } from "@defied/auth/auth.handler";

import { AppModule } from "./app.module";

import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(express.urlencoded({ extended: false, limit: "5mb" }));
  expressApp.use(express.json({ limit: "5mb" }));

  expressApp.use("/api/auth", authHandler);

  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  await app.listen(3005);
  console.log("Server is running on http://localhost:3005");
}

bootstrap();
