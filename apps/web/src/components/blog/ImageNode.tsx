"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { ReactElement } from "react";

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: number | "inherit";
    height?: number | "inherit";
    type: "blog-image";
    version: 1;
  },
  SerializedLexicalNode
>;

function $convertImageElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const img = domNode as unknown as HTMLImageElement;
  const src = img.getAttribute("src");
  if (!src) return null;
  return {
    node: $createImageNode({
      altText: img.getAttribute("alt") ?? "",
      src,
    }),
  };
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;

  constructor(
    src: string,
    altText: string,
    width?: "inherit" | number,
    height?: "inherit" | number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? "inherit";
    this.__height = height ?? "inherit";
  }

  static getType(): string {
    return "blog-image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      altText: serializedNode.altText,
      src: serializedNode.src,
      width:
        serializedNode.width === "inherit" ? undefined : serializedNode.width,
      height:
        serializedNode.height === "inherit" ? undefined : serializedNode.height,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.__altText,
      src: this.__src,
      width: this.__width,
      height: this.__height,
      type: "blog-image",
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  isInline(): false {
    return false;
  }

  // Server (headless) + preview export: plain <img> HTML.
  exportDOM(): { element: HTMLElement } {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width !== "inherit")
      element.setAttribute("width", String(this.__width));
    if (this.__height !== "inherit")
      element.setAttribute("height", String(this.__height));
    return { element };
  }

  createDOM(): HTMLElement {
    // Actual rendering happens in decorate(); the placeholder stays empty.
    const span = document.createElement("span");
    span.className = "blog-image-node";
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): ReactElement {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={this.__src}
        alt={this.__altText}
        className="mx-auto my-6 max-w-full rounded-lg"
      />
    );
  }
}

export function $createImageNode({
  altText,
  src,
  width,
  height,
}: {
  altText: string;
  src: string;
  width?: number;
  height?: number;
}): ImageNode {
  const node = new ImageNode(src, altText, width, height);
  return $applyNodeReplacement(node);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
