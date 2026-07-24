import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProjectCard } from "@/components/sections/project-card";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/lib/queries";
import { getGithubRepos } from "@/lib/github";
import { buildFeaturedProjects } from "@/lib/featured-projects";

export async function Projects() {
  const [manualProjects, repos] = await Promise.all([getProjects(), getGithubRepos()]);
  const featured = buildFeaturedProjects(manualProjects, repos);

  return (
    <section id="projects" className="section-y bg-muted/30">
      <div className="container-page">
        <SectionHeading
          eyebrow="Projects"
          title="Featured Projects"
          description="A curated selection of coursework, security tooling, and personal projects."
        />

        {featured.length > 0 && (
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.key} project={project} />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button render={<Link href="/projects" />} variant="outline" size="lg" className="rounded-full">
            View More Projects
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
