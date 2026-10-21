import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
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
          description="Coursework, security tooling and personal builds, each with an honest status and a case study of what was actually built."
        />

        {featured.length > 0 && (
          <Reveal className="mb-10">
            <ProjectsGrid projects={featured} />
          </Reveal>
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
