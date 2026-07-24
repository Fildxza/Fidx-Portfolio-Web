import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message is too short").max(2000),
  // Honeypot field — real users never fill this in.
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
