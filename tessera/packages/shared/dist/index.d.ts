import { z } from 'zod';
export declare const BasePayloadSchema: z.ZodObject<{
    version: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    version: string;
    timestamp: number;
}, {
    version: string;
    timestamp: number;
}>;
export type BasePayload = z.infer<typeof BasePayloadSchema>;
