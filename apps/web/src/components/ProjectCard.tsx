import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";

interface Project {
  id: number;
  title: string;
  description: string;
  link: string;
  stars: number;
  forks: number;
  status: string;
}

function ProjectCard({ project }: { project: Project }) {
  const { id, title, description, link, stars, forks, status } = project;

  return (
    <Card className="bg-card/50 border border-border/50 hover:bg-card/70 transition-all duration-300 rounded-lg">
      <CardHeader className="text-lg font-semibold text-primary">
        {title}
      </CardHeader>
      <CardContent className="text-muted-foreground">{description}</CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <Button variant="outline">
          <a href={link} target="_blank" rel="noopener noreferrer">
            View Project
          </a>
        </Button>
        {/* Stats */}
        {forks > 0 && stars > 0 && (
          <div className="ml-auto flex gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {stars} Stars
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {forks} Forks
              </span>
            </div>
          </div>
        )}
        {status === "active" && (
          <Badge className="ml-4 animate-pulse border-primary border px-2 py-1 rounded-full text-primary">
            Actively Maintained
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
