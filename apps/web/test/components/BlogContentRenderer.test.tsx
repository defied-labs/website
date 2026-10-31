import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";

// Rendering happens inside a React effect, where BlockNote's React-based
// block renderers cannot flush; math must still come out.
describe("BlogContentRenderer", () => {
  it("renders block and inline math inside React", async () => {
    const content = JSON.stringify([
      {
        type: "mathBlock",
        props: {},
        content: [{ type: "text", text: "E=mc^2", styles: {} }],
        children: [],
      },
      {
        type: "paragraph",
        props: {},
        content: [
          { type: "text", text: "Area is ", styles: {} },
          { type: "math", content: [{ type: "text", text: "\\pi r^2", styles: {} }] },
        ],
        children: [],
      },
    ]);

    const { container } = render(<BlogContentRenderer content={content} />);

    await waitFor(() =>
      expect(container.querySelector(".katex-display")).not.toBeNull(),
    );
    expect(container.innerHTML).toContain(
      '<annotation encoding="application/x-tex">E=mc^2',
    );
    expect(container.innerHTML).toContain(
      '<annotation encoding="application/x-tex">\\pi r^2',
    );
    expect(container.textContent).toContain("Area is");
  });
});
