import { marked } from "marked";
import katex from "katex";
import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "div",
  "code",
  "pre",
  "span",
  "hr",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "details",
  "summary",
  "math",
  "semantics",
  "mrow",
  "mi",
  "mo",
  "mn",
  "msup",
  "msub",
  "mfrac",
  "msqrt",
  "mroot",
  "mtext",
  "mspace",
  "annotation",
  // KaTeX tags
  "mn",
  "mo",
  "mi",
  "mspace",
];

const globalAttributes = [
  "class",
  "id",
  "aria-hidden",
  "style",
  "data-language",
  "data-highlight-language",
  "data-theme",
  // KaTeX specific attributes
  "xmlns",
  "display",
  "xmlns:xlink",
  "xlink:href",
  "xml:space",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "vertical-align",
  "text-align",
  "margin",
  "padding",
  "border",
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "overflow",
  "vertical-align",
  "baseline",
  "text-anchor",
  "dominant-baseline",
  "text-rendering",
  "shape-rendering",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-opacity",
  "stroke-opacity",
  "opacity",
  "transform",
  "transform-origin",
];

const allowedAttributes = {
  ...Object.fromEntries(allowedTags.map((tag) => [tag, globalAttributes])),
  a: ["href", "target", "rel", ...globalAttributes],
  img: [
    "src",
    "alt",
    "title",
    "width",
    "height",
    "loading",
    ...globalAttributes,
  ],
  td: ["colspan", "rowspan", ...globalAttributes],
  th: ["colspan", "rowspan", "scope", ...globalAttributes],
  math: ["xmlns", "display", ...globalAttributes],
  annotation: ["encoding", ...globalAttributes],
};

export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer nofollow" },
      }),
      // Strip inline styles from Lexical tables — our CSS handles them via variables
      table: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
      th: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
      td: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
      tr: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
      tbody: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
      thead: (tagName, attribs) => ({
        tagName,
        attribs: omitKeys(attribs, ["style"]),
      }),
    },
  });
}

function omitKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): T {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

export function isLexicalBlogContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    return parsed?.root?.type === "root" && Array.isArray(parsed.root.children);
  } catch {
    return false;
  }
}

export function renderBlogContent(content: string) {
  const markdown = String(content ?? "");
  const renderedMath = markdown
    .replace(
      /\$\$([\s\S]+?)\$\$/g,
      (_, expression: string) =>
        `<div class="math-display">${katex.renderToString(expression.trim(), {
          throwOnError: false,
          displayMode: true,
        })}</div>`,
    )
    .replace(/\$([^$\n]+)\$/g, (_, expression: string) =>
      katex.renderToString(expression, {
        throwOnError: false,
        displayMode: false,
      }),
    );

  return sanitizeBlogHtml(String(marked.parse(renderedMath)));
}

export function renderMathInHtml(html: string) {
  if (typeof document === "undefined") return html;

  
  const container = document.createElement("div");
  container.innerHTML = html;

  function renderExpression(expression: string, displayMode: boolean) {
    const normalized = expression
      .replaceAll("²", "^2")
      .replaceAll("³", "^3")
      .trim();
    return katex.renderToString(normalized, {
      throwOnError: false,
      displayMode,
    });
  }

  function isBareEquation(text: string) {
    return (
      /^[A-Za-z0-9\s()+\-*/=.^_²³]+$/.test(text.trim()) && /[=^]/.test(text)
    );
  }

  function visit(parent: Node) {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 3) {
        const text = node.textContent ?? "";
        const explicitMath = /\$\$[\s\S]+?\$\$|\$[^$\n]+\$/.test(text);
        const bareMath =
          node.parentElement?.closest("p") !== null && isBareEquation(text);
        if (!explicitMath && !bareMath) continue;

        if (bareMath) {
          const wrapper = document.createElement("span");
          wrapper.className = "math-inline";
          wrapper.innerHTML = renderExpression(text, false);
          node.parentNode?.replaceChild(wrapper, node);
          continue;
        }

        const fragment = document.createDocumentFragment();
        let cursor = 0;
        const expressionPattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$/g;
        for (const match of text.matchAll(expressionPattern)) {
          if (match.index > cursor) {
            fragment.append(
              document.createTextNode(text.slice(cursor, match.index)),
            );
          }
          const display = match[1] !== undefined;
          const wrapper = document.createElement(display ? "div" : "span");
          wrapper.className = display ? "math-display" : "math-inline";
          wrapper.innerHTML = renderExpression(
            display ? match[1].trim() : match[2],
            display,
          );
          fragment.append(wrapper);
          cursor = match.index + match[0].length;
        }
        if (cursor < text.length) {
          fragment.append(document.createTextNode(text.slice(cursor)));
        }
        node.parentNode?.replaceChild(fragment, node);
        continue;
      }

      if (node.nodeType === 1) {
        const element = node as Element;
        if (
          element.tagName === "CODE" &&
          isBareEquation(element.textContent ?? "")
        ) {
          const wrapper = document.createElement("span");
          wrapper.className = "math-inline";
          wrapper.innerHTML = renderExpression(
            element.textContent ?? "",
            false,
          );
          element.parentNode?.replaceChild(wrapper, element);
        } else if (element.tagName !== "PRE" && element.tagName !== "CODE") {
          visit(node);
        }
      }
    }
  }

  visit(container);
  return container.innerHTML;
}
