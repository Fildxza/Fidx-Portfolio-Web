import Link from "next/link";
import { ArrowDown, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/shared/brand-icons";
import { ProfilePhoto } from "@/components/shared/profile-photo";
import { HeroTyping } from "@/components/sections/hero-typing";
import { HeroEntrance, HeroPhotoFrame } from "@/components/sections/hero-motion";
import { siteConfig } from "@/lib/constants";
import { getLocalProfilePhoto, getLocalResumeUrl } from "@/lib/local-assets";
import { getProfilePhotoUrl, getResumeUrl } from "@/lib/queries";

export async function Hero() {
  const [remotePhoto, remoteResumeUrl] = await Promise.all([
    getProfilePhotoUrl(),
    getResumeUrl(),
  ]);
  const photo = remotePhoto ?? getLocalProfilePhoto();
  const resumeUrl = remoteResumeUrl ?? getLocalResumeUrl();

  return (
    <section className="relative overflow-hidden pt-36 sm:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-24 -z-10 size-[420px] rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-96 -z-10 size-[320px] rounded-full bg-brand/10 blur-3xl"
      />

      <div className="container-page grid items-center gap-14 pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <HeroEntrance>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Open to IT Internship opportunities
          </span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Hi, I&apos;m{" "}
            <span className="gradient-text">
              {siteConfig.name.split(" ")[0]} {siteConfig.name.split(" ")[1]}
            </span>
            <span className="text-brand">.</span>
          </h1>

          <p className="text-xl font-medium text-muted-foreground sm:text-2xl">
            <HeroTyping />
          </p>

          <p className="max-w-xl text-balance text-muted-foreground">
            {siteConfig.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              render={<a href={resumeUrl ?? "/resume"} download={Boolean(resumeUrl)} />}
              size="lg"
              className="rounded-full shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5"
            >
              <Download className="size-4" />
              Download Resume
            </Button>
            <Button
              render={<Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" />}
              size="lg"
              variant="outline"
              className="rounded-full transition-transform hover:-translate-y-0.5"
            >
              <GithubIcon className="size-4" />
              GitHub
            </Button>
            <Button
              render={<Link href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" />}
              size="lg"
              variant="outline"
              className="rounded-full transition-transform hover:-translate-y-0.5"
            >
              <LinkedinIcon className="size-4" />
              LinkedIn
            </Button>
            <Button render={<Link href="#contact" />} size="lg" variant="ghost" className="rounded-full">
              <Mail className="size-4" />
              Contact
            </Button>
          </div>
        </HeroEntrance>

        <HeroPhotoFrame>
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand/40 via-brand/10 to-transparent blur-2xl"
          />
          <div className="relative rounded-[2rem] bg-gradient-to-br from-brand/50 via-brand/20 to-transparent p-[3px] shadow-2xl shadow-brand/20">
            <ProfilePhoto
              src={photo}
              className="aspect-square w-full rounded-[calc(2rem-3px)] bg-background"
              priority
            />
          </div>
        </HeroPhotoFrame>
      </div>

      <div className="flex justify-center pb-10">
        <Link
          href="#about"
          className="flex flex-col items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Scroll to explore
          <ArrowDown className="size-4 animate-bounce" />
        </Link>
      </div>
    </section>
  );
}
