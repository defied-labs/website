import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "./auth/auth.guard";
import { BlogService, type PostInput } from "./blog.service";

@Controller("api/admin/blog")
@UseGuards(AuthGuard)
export class BlogController {
  constructor(@Inject(BlogService) private readonly blogService: BlogService) {}

  @Get()
  listPosts() {
    return this.blogService.listPosts();
  }

  @Get("stats")
  stats() {
    return this.blogService.stats();
  }

  @Get("slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    const post = await this.blogService.getPostBySlug(slug);
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    const post = await this.blogService.getPostById(id);
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  @Post()
  create(@Body() input: PostInput) {
    return this.blogService.createPost(input);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() input: PostInput) {
    const existing = await this.blogService.getPostById(id);
    if (!existing) throw new NotFoundException("Post not found");
    return this.blogService.updatePost(id, input);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const existing = await this.blogService.getPostById(id);
    if (!existing) throw new NotFoundException("Post not found");
    return this.blogService.deletePost(id);
  }
}

@Controller("api/blog")
export class PublicBlogController {
  constructor(@Inject(BlogService) private readonly blogService: BlogService) {}

  @Get()
  listPosts() {
    return this.blogService.listPublishedPosts();
  }

  @Get(":slug")
  async getBySlug(@Param("slug") slug: string) {
    const post = await this.blogService.getPublishedPostBySlug(slug);
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }
}
