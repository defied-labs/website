import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlogController, PublicBlogController } from "./blog.controller";
import { AuthGuard } from "./auth/auth.guard";
import { BlogService } from "./blog.service";
import { HealthService } from "./health.service";
import { ProfileController } from "./profile.controller";
import { AdminGuard } from "./auth/admin.guard";

@Module({
  controllers: [
    AppController,
    BlogController,
    PublicBlogController,
    ProfileController,
  ],
  providers: [AppService, BlogService, AuthGuard, AdminGuard, HealthService],
})
export class AppModule {}
