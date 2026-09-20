import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionTitle from "../../src/components/ui/SectionTitle";

describe("SectionTitle UI Component", () => {
  it("renders subtitle and main title elements properly", () => {
    render(
      <SectionTitle className="custom-wrapper">
        <span>// Research and notes</span>
        <span>Engineering Excellence</span>
      </SectionTitle>,
    );

    expect(screen.getByText("// Research and notes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Engineering Excellence" }),
    ).toBeInTheDocument();
  });
});
