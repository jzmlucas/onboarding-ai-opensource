import { z } from "zod";

export const onboardingSchema = z.object({
  company_name: z.string().trim().min(2, "Informe o nome da empresa.").max(200),
  tax_id: z.string().trim().max(32).optional().or(z.literal("")),
  contact_name: z.string().trim().max(160).optional().or(z.literal("")),
  contact_email: z.string().trim().email("Informe um e-mail válido.").optional().or(z.literal("")),
  contact_whatsapp: z.string().trim().max(32).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
