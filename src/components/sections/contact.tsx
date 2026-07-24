"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { submitContactForm } from "@/app/actions/contact";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";
import { siteConfig } from "@/lib/constants";

const CONTACT_ITEMS = [
  { icon: Mail, label: "Email", value: siteConfig.email, href: siteConfig.links.email },
  { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s/g, "")}` },
  { icon: MapPin, label: "Location", value: siteConfig.location, href: undefined },
];

export function Contact() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = (values: ContactFormValues) => {
    startTransition(async () => {
      const result = await submitContactForm(values);
      if (result.success) {
        setSubmitted(true);
        reset();
        toast.success("Message sent — thanks for reaching out!");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <section id="contact" className="section-y bg-muted/30">
      <div className="container-page">
        <SectionHeading
          eyebrow="Contact"
          title="Let's work together"
          description="Have an opportunity or just want to say hi? Send a message and I'll get back to you."
        />

        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-4">
            {CONTACT_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/50 p-5"
              >
                <div className="rounded-xl bg-brand/10 p-2.5 text-brand">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="font-medium hover:text-brand">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input id="subject" placeholder="What's this about?" {...register("subject")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                placeholder="Tell me a bit about the opportunity or your question..."
                {...register("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            {/* Honeypot — hidden from real users, bots tend to fill every field */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              {...register("company")}
            />

            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send Message
            </Button>

            {submitted && (
              <p className="text-center text-xs text-muted-foreground">
                Message sent successfully.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
