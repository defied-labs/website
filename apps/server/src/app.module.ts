import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlogController, PublicBlogController } from "./blog.controller";
import { AuthGuard } from "./auth/auth.guard";
import { BlogService } from "./blog.service";

@Module({
  controllers: [AppController, BlogController, PublicBlogController],
  providers: [AppService, BlogService, AuthGuard],
})
export class AppModule {}
