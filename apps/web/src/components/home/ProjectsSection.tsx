import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import SectionTitle from "./SectionTitle";
import { itemsConfig } from "@/config/itemsConfig";
import ProjectCard from "../ProjectCard";

function ProjectsSection() {
  // Filter projects if they are 1, 4, 7, put them in the first column, if they are 2, 5, 8, put them in the second column, if they are 3, 6, 9, put them in the third column
  const firstColumnProjects = itemsConfig.projectsSection.slice(0, 3);
  const secondColumnProjects = itemsConfig.projectsSection.slice(3, 6);
  const thirdColumnProjects = itemsConfig.projectsSection.slice(6, 9);

  return (
    <section className="container mx-auto my-20 flex w-full flex-col items-center gap-10 px-4 sm:mt-32 min-h-[60vh] relative">
      <div className="">
        <SectionTitle className="text-center">
          <span>// Our projects</span>
          <span>
            Give us a <span className="text-primary">repository</span>, and we
            will give you a <span className="text-primary italic">product</span>
            .
          </span>
        </SectionTitle>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full justify-center">
        <div className="flex flex-col gap-6">
          {firstColumnProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {secondColumnProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {thirdColumnProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="inset-x-0 -bottom-2 flex justify-center bg-linear-to-t pt-32 pb-20 pointer-events-none from-background via-background absolute w-full mx-auto">
          <Button variant="link" className="pointer-events-auto">
            <Link href="https://github.com/defied-labs" target="_blank">
              View All Projects
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
