import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { BlogPostArticleClient } from "./BlogPostArticleClient";
import type { PostFormValues } from "@/lib/blog-types";
import { IconEye } from "@tabler/icons-react";

function BlogPostPreviewModal({
  post,
  preview,
}: {
  post: {
    title: string;
    excerpt: string | null;
    content: string;
  };
  preview?: PostFormValues;
}) {
  const postToDisplay = preview ?? {
    title: post.title,
    excerpt: null,
    content: post.content,
    status: "draft" as const,
    seo: { noIndex: true },
    taxonomy: { categories: [], tags: [] },
  };
  const title = String(postToDisplay.title);
  const excerpt =
    postToDisplay.excerpt == null ? null : String(postToDisplay.excerpt);
  const content = String(postToDisplay.content);

  return (
    <Modal>
      <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center group/modal-btn">
        <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
          Preview Post
        </span>
        <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-black z-20">
          <IconEye />
        </div>
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <BlogPostArticleClient
            title={title}
            excerpt={excerpt}
            content={content}
          />
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}

export default BlogPostPreviewModal;
