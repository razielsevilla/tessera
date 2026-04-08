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
export declare const RetrospectiveDataSchema: z.ZodObject<{
    milestone: z.ZodString;
    notes: z.ZodString;
    isSprintEnd: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    milestone: string;
    notes: string;
    isSprintEnd: boolean;
}, {
    milestone: string;
    notes: string;
    isSprintEnd: boolean;
}>;
export type RetrospectiveData = z.infer<typeof RetrospectiveDataSchema>;
export declare const MediaLogDataSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodString;
    progress: z.ZodNumber;
    genres: z.ZodArray<z.ZodString, "many">;
    pacing: z.ZodEnum<["slow", "medium", "fast"]>;
    tropes: z.ZodArray<z.ZodString, "many">;
    sessionDurationMinutes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    title: string;
    progress: number;
    genres: string[];
    pacing: "slow" | "medium" | "fast";
    tropes: string[];
    sessionDurationMinutes: number;
}, {
    type: string;
    title: string;
    progress: number;
    genres: string[];
    pacing: "slow" | "medium" | "fast";
    tropes: string[];
    sessionDurationMinutes: number;
}>;
export type MediaLogData = z.infer<typeof MediaLogDataSchema>;
export declare const InteractiveFictionDataSchema: z.ZodObject<{
    storyTitle: z.ZodString;
    currentNodeId: z.ZodString;
    choicesMade: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    storyTitle: string;
    currentNodeId: string;
    choicesMade: string[];
}, {
    storyTitle: string;
    currentNodeId: string;
    choicesMade: string[];
}>;
export type InteractiveFictionData = z.infer<typeof InteractiveFictionDataSchema>;
export declare const SocialBatteryDataSchema: z.ZodObject<{
    moodScore: z.ZodNumber;
    moodDelta: z.ZodNumber;
    meetings: z.ZodNumber;
    calls: z.ZodNumber;
    managedTeams: z.ZodNumber;
    events: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    moodScore: number;
    moodDelta: number;
    meetings: number;
    calls: number;
    managedTeams: number;
    events: any[];
}, {
    moodScore: number;
    moodDelta: number;
    meetings: number;
    calls: number;
    managedTeams: number;
    events: any[];
}>;
export type SocialBatteryData = z.infer<typeof SocialBatteryDataSchema>;
export declare const SkillLogSchema: z.ZodObject<{
    skillName: z.ZodString;
    hoursSpent: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    skillName: string;
    hoursSpent: number;
}, {
    skillName: string;
    hoursSpent: number;
}>;
export type SkillLog = z.infer<typeof SkillLogSchema>;
export declare const BundledMetadataPayloadSchema: z.ZodObject<{
    moodScore: z.ZodNumber;
    socialBattery: z.ZodNumber;
    socialEngagements: z.ZodObject<{
        moodDelta: z.ZodNumber;
        meetings: z.ZodNumber;
        calls: z.ZodNumber;
        managedTeams: z.ZodNumber;
        events: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        moodDelta: number;
        meetings: number;
        calls: number;
        managedTeams: number;
        events: any[];
    }, {
        moodDelta: number;
        meetings: number;
        calls: number;
        managedTeams: number;
        events: any[];
    }>;
    productivityScore: z.ZodNumber;
    economyPoints: z.ZodNumber;
    frameTier: z.ZodNumber;
    retrospective: z.ZodObject<{
        milestone: z.ZodString;
        notes: z.ZodString;
        isSprintEnd: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        milestone: string;
        notes: string;
        isSprintEnd: boolean;
    }, {
        milestone: string;
        notes: string;
        isSprintEnd: boolean;
    }>;
    media: z.ZodObject<{
        title: z.ZodString;
        type: z.ZodString;
        progress: z.ZodNumber;
        genres: z.ZodArray<z.ZodString, "many">;
        pacing: z.ZodEnum<["slow", "medium", "fast"]>;
        tropes: z.ZodArray<z.ZodString, "many">;
        sessionDurationMinutes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        title: string;
        progress: number;
        genres: string[];
        pacing: "slow" | "medium" | "fast";
        tropes: string[];
        sessionDurationMinutes: number;
    }, {
        type: string;
        title: string;
        progress: number;
        genres: string[];
        pacing: "slow" | "medium" | "fast";
        tropes: string[];
        sessionDurationMinutes: number;
    }>;
    interactiveFiction: z.ZodObject<{
        storyTitle: z.ZodString;
        currentNodeId: z.ZodString;
        choicesMade: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        storyTitle: string;
        currentNodeId: string;
        choicesMade: string[];
    }, {
        storyTitle: string;
        currentNodeId: string;
        choicesMade: string[];
    }>;
    skillsPracticed: z.ZodArray<z.ZodObject<{
        skillName: z.ZodString;
        hoursSpent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        skillName: string;
        hoursSpent: number;
    }, {
        skillName: string;
        hoursSpent: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    moodScore: number;
    socialBattery: number;
    socialEngagements: {
        moodDelta: number;
        meetings: number;
        calls: number;
        managedTeams: number;
        events: any[];
    };
    productivityScore: number;
    economyPoints: number;
    frameTier: number;
    retrospective: {
        milestone: string;
        notes: string;
        isSprintEnd: boolean;
    };
    media: {
        type: string;
        title: string;
        progress: number;
        genres: string[];
        pacing: "slow" | "medium" | "fast";
        tropes: string[];
        sessionDurationMinutes: number;
    };
    interactiveFiction: {
        storyTitle: string;
        currentNodeId: string;
        choicesMade: string[];
    };
    skillsPracticed: {
        skillName: string;
        hoursSpent: number;
    }[];
}, {
    moodScore: number;
    socialBattery: number;
    socialEngagements: {
        moodDelta: number;
        meetings: number;
        calls: number;
        managedTeams: number;
        events: any[];
    };
    productivityScore: number;
    economyPoints: number;
    frameTier: number;
    retrospective: {
        milestone: string;
        notes: string;
        isSprintEnd: boolean;
    };
    media: {
        type: string;
        title: string;
        progress: number;
        genres: string[];
        pacing: "slow" | "medium" | "fast";
        tropes: string[];
        sessionDurationMinutes: number;
    };
    interactiveFiction: {
        storyTitle: string;
        currentNodeId: string;
        choicesMade: string[];
    };
    skillsPracticed: {
        skillName: string;
        hoursSpent: number;
    }[];
}>;
export type BundledMetadataPayload = z.infer<typeof BundledMetadataPayloadSchema>;
