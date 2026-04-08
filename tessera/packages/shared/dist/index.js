"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundledMetadataPayloadSchema = exports.SkillLogSchema = exports.SocialBatteryDataSchema = exports.InteractiveFictionDataSchema = exports.MediaLogDataSchema = exports.RetrospectiveDataSchema = exports.BasePayloadSchema = void 0;
const zod_1 = require("zod");
exports.BasePayloadSchema = zod_1.z.object({
    version: zod_1.z.string(),
    timestamp: zod_1.z.number(),
});
exports.RetrospectiveDataSchema = zod_1.z.object({
    milestone: zod_1.z.string(),
    notes: zod_1.z.string(),
    isSprintEnd: zod_1.z.boolean()
});
exports.MediaLogDataSchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.string(),
    progress: zod_1.z.number().min(0).max(100),
    genres: zod_1.z.array(zod_1.z.string()),
    pacing: zod_1.z.enum(['slow', 'medium', 'fast']),
    tropes: zod_1.z.array(zod_1.z.string()),
    sessionDurationMinutes: zod_1.z.number().min(0)
});
exports.InteractiveFictionDataSchema = zod_1.z.object({
    storyTitle: zod_1.z.string(),
    currentNodeId: zod_1.z.string(),
    choicesMade: zod_1.z.array(zod_1.z.string())
});
exports.SocialBatteryDataSchema = zod_1.z.object({
    moodScore: zod_1.z.number().min(1).max(10),
    moodDelta: zod_1.z.number().min(-10).max(10),
    meetings: zod_1.z.number().min(0),
    calls: zod_1.z.number().min(0),
    managedTeams: zod_1.z.number().min(0),
    events: zod_1.z.array(zod_1.z.any())
});
exports.SkillLogSchema = zod_1.z.object({
    skillName: zod_1.z.string(),
    hoursSpent: zod_1.z.number().min(0)
});
exports.BundledMetadataPayloadSchema = zod_1.z.object({
    moodScore: zod_1.z.number(),
    socialBattery: zod_1.z.number(),
    socialEngagements: zod_1.z.object({
        moodDelta: zod_1.z.number(),
        meetings: zod_1.z.number(),
        calls: zod_1.z.number(),
        managedTeams: zod_1.z.number(),
        events: zod_1.z.array(zod_1.z.any())
    }),
    productivityScore: zod_1.z.number(),
    economyPoints: zod_1.z.number(),
    frameTier: zod_1.z.number(),
    retrospective: exports.RetrospectiveDataSchema,
    media: exports.MediaLogDataSchema,
    interactiveFiction: exports.InteractiveFictionDataSchema,
    skillsPracticed: zod_1.z.array(exports.SkillLogSchema),
    zkProofRef: zod_1.z.string().optional()
});
