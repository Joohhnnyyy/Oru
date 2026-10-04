import { z } from 'zod';

export const ApiErrorDetailSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  error: ApiErrorDetailSchema,
});

export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

export function createErrorResponse(code: string, message: string, details?: unknown): ApiErrorEnvelope {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
