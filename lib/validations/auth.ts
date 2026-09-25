import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),

  email: z
    .string()
    .trim()
    .min(1, "O email é obrigatório.")
    .pipe(z.email("Informe um email válido.")),

  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres.")
    .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula.")
    .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
    .regex(/[0-9]/, "A senha deve conter ao menos um número."),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
