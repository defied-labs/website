/* eslint-disable */
import { renderLexicalBlogContent } from "./src/lib/lexical-blog";

async function main() {
  const res = await fetch("http://localhost:3005/api/blog/this-is-just-a-test");
  const post = await res.json();
  const html = renderLexicalBlogContent(post.content as string) ?? "NULL";
  require("fs").writeFileSync("debug-out.html", html);
  console.log(
    "len:",
    html.length,
    "| token spans:",
    (html.match(/class="token/g) || []).length,
    "| img:",
    (html.match(/<img /g) || []).length,
    "| tables:",
    (html.match(/<table/g) || []).length,
    "| language-x:",
    (html.match(/language-/g) || []).length,
  );
}
main();
