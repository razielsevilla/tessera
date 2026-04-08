import { z } from 'zod';

export const BasePayloadSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
});
export type BasePayload = z.infer<typeof BasePayloadSchema>;

export const RetrospectiveDataSchema = z.object({
  milestone: z.string(),
  notes: z.string(),
  isSprintEnd: z.boolean()
});
export type RetrospectiveData = z.infer<typeof RetrospectiveDataSchema>;

export const MediaLogDataSchema = z.object({
  title: z.string(),
  type: z.string(),
  progress: z.number().min(0).max(100),
  genres: z.array(z.string()),
  pacing: z.enum(['slow', 'medium', 'fast']),
  tropes: z.array(z.string()),
  sessionDurationMinutes: z.number().min(0)
});
export type MediaLogData = z.infer<typeof MediaLogDataSchema>;

export const InteractiveFictionDataSchema = z.object({
  storyTitle: z.string(),
  currentNodeId: z.string(),
  choicesMade: z.array(z.string())
});
export type InteractiveFictionData = z.infer<typeof InteractiveFictionDataSchema>;

export const SocialBatteryDataSchema = z.object({
  moodScore: z.number().min(1).max(10),
  moodDelta: z.number().min(-10).max(10),
  meetings: z.number().min(0),
  calls: z.number().min(0),
  managedTeams: z.number().min(0),
  events: z.array(z.any())
});
export type SocialBatteryData = z.infer<typeof SocialBatteryDataSchema>;

export const SkillLogSchema = z.object({
  skillName: z.string(),
  hoursSpent: z.number().min(0)
});
export type SkillLog = z.infer<typeof SkillLogSchema>;

export const BundledMetadataPayloadSchema = z.object({
  moodScore: z.number(),
  socialBattery: z.number(),
  socialEngagements: z.object({
    moodDelta: z.number(),
    meetings: z.number(),
    calls: z.number(),
    managedTeams: z.number(),
    events: z.array(z.any())
  }),
  productivityScore: z.number(),
  economyPoints: z.number(),
  frameTier: z.number(),
  retrospective: RetrospectiveDataSchema,
  media: MediaLogDataSchema,
  interactiveFiction: InteractiveFictionDataSchema,
  skillsPracticed: z.array(SkillLogSchema),
  zkProofRef: z.string().optional()
});
export type BundledMetadataPayload = z.infer<typeof BundledMetadataPayloadSchema>;
