"use client";

import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ResumeActions({ pdfUrl }: { pdfUrl: string | null }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {pdfUrl ? (
        <a
          href={pdfUrl}
          download="Mohamad-Fildza-Azman-Resume.pdf"
          onClick={() => toast.success("Resume download started")}
          className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
        >
          <Download className="size-4" aria-hidden="true" />
          Download PDF
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">
          No PDF is uploaded yet — use Print below to save this page as a PDF.
        </p>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full")}
      >
        <Printer className="size-4" aria-hidden="true" />
        Print / Save as PDF
      </button>
    </div>
  );
}
