import { z } from 'zod';

// Example shared type / schema
export const BasePayloadSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
});

export type BasePayload = z.infer<typeof BasePayloadSchema>;
