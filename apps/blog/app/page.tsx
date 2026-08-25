import PostCard from "@/components/PostCard";
import SectionTitle from "@/components/ui/SectionTitle";

const posts = [
  {
    title: "Understanding the Magic of Defied",
    description:
      "Dive deep into the world of Defied and explore its unique features.",
    date: "2023-09-15",
    authors: ["John Doe", "Jane Smith"],
    categories: ["Technology", "Innovation"],
    mainCategory: "Technology",
    likes: 120,
    comments: 45,
    image:
      "https://images.unsplash.com/photo-1568952433726-3896e3881c65?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "1",
  },
  {
    title: "The Evolution of Defied Over the Years",
    description:
      "A comprehensive look at how Defied has transformed since its inception.",
    date: "2023-08-10",
    authors: ["Alice Johnson"],
    categories: ["History", "Development"],
    mainCategory: "History",
    likes: 85,
    comments: 30,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "2",
  },
  {
    title: "Top 10 Tips for Maximizing Your Defied Experience",
    description:
      "Learn the best practices to get the most out of your time with Defied.",
    date: "2023-07-05",
    authors: ["Bob Brown", "Charlie Davis"],
    categories: ["Tips", "Guides"],
    mainCategory: "Guides",
    likes: 200,
    comments: 60,
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "3",
  },
  {
    title: "The Future of Defied: What to Expect",
    description:
      "Predictions and insights into where Defied is headed in the coming years.",
    date: "2023-06-20",
    authors: ["Diana Evans"],
    categories: ["Future", "Predictions"],
    mainCategory: "Future",
    likes: 150,
    comments: 40,
    image:
      "https://images.unsplash.com/photo-1562575214-da9fcf59b907?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "4",
  },
  {
    title: "Defied in the Spotlight: Media Coverage and Reviews",
    description:
      "A roundup of the latest media coverage and reviews about Defied.",
    date: "2023-05-15",
    authors: ["Ethan Foster"],
    categories: ["Media", "Reviews"],
    mainCategory: "Media",
    likes: 95,
    comments: 25,
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    id: "5",
  },
];

export default function Home() {
  return (
    <main className="flex-col items-center justify-evenly">
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-lora text-center">
          Defied&apos;s <span className="text-primary">magic</span> <br />
          <span className="text-primary italic">Explained.</span>
        </h1>
      </div>

      <div className="bg-primary/20 w-2/3 min-h-auto mx-auto rounded-2xl p-12">
        <SectionTitle>
          <span>// Research, development and knowledge share</span>
          <span>Blog</span>
        </SectionTitle>

        <div className="grid grid-cols-3 gap-8 py-12">
          <PostCard className="col-span-2" post={posts[0]} />
          <PostCard post={posts[1]} />
          <PostCard post={posts[2]} />
          <PostCard post={posts[3]} />
          <PostCard post={posts[4]} />
        </div>
      </div>
    </main>
  );
}
