export interface Post {
  title: string;
  description: string;
  date: string;
  authors: Author[];
  categories: string[];
  mainCategory: string;
  likes: number;
  comments: number;
  image: string;
  id: string;
}

export interface Author {
  name: string;
  avatar: string;
  url: string;
}
