import { NestFactory } from "@nestjs/core";
import { auth } from "@defied/auth";
import { env } from "@defied/env/server";

import { AppModule } from "./app.module";
import { toNodeHandler } from "better-auth/node";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.all("/api/auth/{*path}", toNodeHandler(auth));

  await app.listen(3000);
  console.log("Server is running on http://localhost:3000");
}

bootstrap();
