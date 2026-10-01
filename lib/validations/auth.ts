import { z } from "zod";

//Fields schemas
const emailSchema = z
  .string()
  .trim()
  .min(1, "O email é obrigatório.")
  .pipe(z.email("Informe um email válido."));

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula.")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.");

const loginPasswordSchema = z
  .string()
  .min(1, "A senha é obrigatória.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

//Forms schemas
export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),

  email: emailSchema,
  password: passwordSchema,
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token inválido."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
