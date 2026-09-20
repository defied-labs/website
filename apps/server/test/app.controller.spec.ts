import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";

describe("AppController", () => {
  it("GET / - returns OK status from AppService", () => {
    const service = new AppService();
    const controller = new AppController(service);

    expect(controller.getHello()).toBe("OK");
  });
});
