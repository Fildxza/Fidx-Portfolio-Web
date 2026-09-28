import Image from "next/image";
import Link from "next/link";
import { Award, BadgeCheck, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCertificates } from "@/lib/queries";
import { formatMonthYear } from "@/lib/format";

export async function Certifications() {
  const certificates = await getCertificates();
  if (certificates.length === 0) return null;

  return (
    <section id="certifications" className="section-y bg-muted/30">
      <div className="container-page">
        <SectionHeading eyebrow="Certifications" title="Credentials" />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand/10 text-brand">
                {cert.image_url ? (
                  <Image
                    src={cert.image_url}
                    alt={cert.title}
                    width={56}
                    height={56}
                    className="size-full object-cover"
                  />
                ) : (
                  <Award className="size-6" />
                )}
                {cert.credential_url && (
                  <BadgeCheck className="absolute -bottom-1 -right-1 size-4.5 rounded-full bg-background text-brand" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium">{cert.title}</h3>
                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                {cert.issue_date && (
                  <p className="text-xs text-muted-foreground">
                    {formatMonthYear(cert.issue_date)}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                {cert.credential_url && (
                  <Link
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Verify credential"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                )}
                {cert.file_url && (
                  <Link
                    href={cert.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    aria-label="View certificate file"
                  >
                    <FileText className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
