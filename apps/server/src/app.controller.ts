import { Controller, Get, Inject } from "@nestjs/common";

import { AppService } from "./app.service";
import { HealthService } from "./health.service";

@Controller()
export class AppController {
  constructor(
    @Inject(AppService) private readonly appService: AppService,
    @Inject(HealthService) private readonly healthService: HealthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  health() {
    return this.healthService.app();
  }

  @Get("health/db")
  databaseHealth() {
    return this.healthService.database();
  }

  @Get("health/auth")
  authHealth() {
    return this.healthService.auth();
  }

  @Get("health/mail")
  mailHealth() {
    return this.healthService.mail();
  }
}
