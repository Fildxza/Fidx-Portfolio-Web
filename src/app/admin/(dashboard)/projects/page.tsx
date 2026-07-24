import { getProjects } from "@/lib/queries";
import { createProject, deleteProject, updateProject } from "./actions";
import { ProjectsManager } from "./projects-manager";
import type { Project } from "@/lib/types";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsManager
      rows={projects as (Project & Record<string, unknown>)[]}
      onCreate={createProject}
      onUpdate={updateProject}
      onDelete={deleteProject}
    />
  );
}
