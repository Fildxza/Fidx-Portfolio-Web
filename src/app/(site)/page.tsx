import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Certifications } from "@/components/sections/certifications";
import { Achievements } from "@/components/sections/achievements";
import { GithubActivity } from "@/components/sections/github-activity";
import { Contact } from "@/components/sections/contact";
import { siteConfig } from "@/lib/constants";

export default function HomePage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    jobTitle: "IT Support & Computer Forensics Student",
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location,
    },
    sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <About />
      <Experience />
      <Education />
      <Projects />
      <Skills />
      <Certifications />
      <Achievements />
      <GithubActivity />
      <Contact />
    </>
  );
}
