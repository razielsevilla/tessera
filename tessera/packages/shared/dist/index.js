"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePayloadSchema = void 0;
const zod_1 = require("zod");
// Example shared type / schema
exports.BasePayloadSchema = zod_1.z.object({
    version: zod_1.z.string(),
    timestamp: zod_1.z.number(),
});
