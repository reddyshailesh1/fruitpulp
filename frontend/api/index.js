var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";
var envSchema, parsed, env;
var init_env = __esm({
  "server/config/env.ts"() {
    dotenv.config();
    envSchema = z.object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.string().transform((val) => parseInt(val, 10)).default("5000"),
      MONGODB_URI: z.string().optional(),
      JWT_SECRET: z.string().default("orange_pulp_secret_salt_2025_juicy_discount_key"),
      CLIENT_URL: z.string().default("http://localhost:5173"),
      CAMPAIGN_ID: z.string().default("CAMP-ORANGE-2025")
    });
    parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.format());
      process.exit(1);
    }
    env = parsed.data;
  }
});

// server/db/models/Participation.ts
import mongoose, { Schema } from "mongoose";
var RewardSchema, ParticipationSchema, Participation;
var init_Participation = __esm({
  "server/db/models/Participation.ts"() {
    RewardSchema = new Schema(
      {
        boxNumber: { type: Number, required: true },
        discount: { type: Number, required: true },
        rewardCode: { type: String, required: true },
        selectedAt: { type: Date, required: true, default: () => /* @__PURE__ */ new Date() },
        revealedAt: { type: Date, required: true, default: () => /* @__PURE__ */ new Date() }
      },
      { _id: false }
    );
    ParticipationSchema = new Schema(
      {
        campaignId: {
          type: String,
          required: true,
          trim: true,
          index: true
        },
        rollNumber: {
          type: String,
          required: true,
          trim: true,
          uppercase: true,
          index: true
        },
        chancesUsed: {
          type: Number,
          default: 0,
          min: 0,
          max: 3
        },
        selectedBoxes: {
          type: [Number],
          default: []
        },
        rewards: {
          type: [RewardSchema],
          default: []
        },
        finalDiscount: {
          type: Number,
          default: null
        },
        finalRewardCode: {
          type: String,
          default: null
        },
        status: {
          type: String,
          enum: ["IN_PROGRESS", "COMPLETED"],
          default: "IN_PROGRESS",
          index: true
        },
        createdAt: {
          type: Date,
          default: () => /* @__PURE__ */ new Date(),
          immutable: true
        },
        completedAt: {
          type: Date,
          default: null
        }
      },
      {
        versionKey: false
      }
    );
    ParticipationSchema.index({ campaignId: 1, rollNumber: 1 }, { unique: true });
    Participation = mongoose.model(
      "Participation",
      ParticipationSchema
    );
  }
});

// server/db/models/Campaign.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var BoxArrangementSchema, DiscountConfigSchema, CampaignSchema, Campaign;
var init_Campaign = __esm({
  "server/db/models/Campaign.ts"() {
    BoxArrangementSchema = new Schema2(
      {
        boxNumber: { type: Number, required: true },
        discount: { type: Number, required: true }
      },
      { _id: false }
    );
    DiscountConfigSchema = new Schema2(
      {
        discount: { type: Number, required: true },
        count: { type: Number, required: true }
      },
      { _id: false }
    );
    CampaignSchema = new Schema2(
      {
        campaignId: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          index: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        status: {
          type: String,
          enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
          default: "ACTIVE",
          index: true
        },
        startDate: {
          type: Date,
          required: true,
          default: () => /* @__PURE__ */ new Date()
        },
        endDate: {
          type: Date,
          required: true,
          default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
          // 1 year default
        },
        totalBoxes: {
          type: Number,
          default: 9,
          immutable: true
        },
        totalChances: {
          type: Number,
          default: 3,
          immutable: true
        },
        discountConfiguration: {
          type: [DiscountConfigSchema],
          required: true
        },
        boxArrangement: {
          type: [BoxArrangementSchema],
          required: true
        },
        createdAt: {
          type: Date,
          default: () => /* @__PURE__ */ new Date(),
          immutable: true
        }
      },
      {
        versionKey: false
      }
    );
    Campaign = mongoose2.model("Campaign", CampaignSchema);
  }
});

// server/services/campaign.service.ts
import crypto from "crypto";
function sampleWeightedDiscount(config = WEIGHTED_DISCOUNT_CONFIG) {
  const rand = crypto.randomInt(0, 100);
  let cumulative = 0;
  for (const item of config) {
    cumulative += item.weight;
    if (rand < cumulative) {
      return item.discount;
    }
  }
  return config[0].discount;
}
function generateBoxArrangement() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxNumber) => ({
    boxNumber,
    discount: sampleWeightedDiscount()
  }));
}
async function getOrCreateCampaign(campaignId = env.CAMPAIGN_ID) {
  const mongoose5 = (await import("mongoose")).default;
  if (mongoose5.connection.readyState === 1) {
    try {
      let campaign = await Campaign.findOne({ campaignId });
      if (!campaign) {
        const boxArrangement = generateBoxArrangement();
        campaign = await Campaign.create({
          campaignId,
          name: "Orange Pulp Juice Point \u2013 Fresh Student Discount Carnival",
          status: "ACTIVE",
          startDate: /* @__PURE__ */ new Date(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3),
          // 180 days
          totalBoxes: 9,
          totalChances: 3,
          discountConfiguration: DEFAULT_DISCOUNT_CONFIG,
          boxArrangement
        });
        console.log(`\u{1F34A} Campaign ${campaignId} initialized in MongoDB Atlas.`);
      }
      return campaign;
    } catch (e) {
      console.warn("MongoDB query notice, falling back to memory campaign:", e);
    }
  }
  if (!inMemoryCampaigns.has(campaignId)) {
    inMemoryCampaigns.set(campaignId, {
      campaignId,
      name: "Orange Pulp Juice Point \u2013 Fresh Student Discount Carnival",
      status: "ACTIVE",
      startDate: /* @__PURE__ */ new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3),
      totalBoxes: 9,
      totalChances: 3,
      discountConfiguration: DEFAULT_DISCOUNT_CONFIG,
      boxArrangement: generateBoxArrangement()
    });
  }
  return inMemoryCampaigns.get(campaignId);
}
function isCampaignActive(campaign) {
  if (campaign.status === "INACTIVE") {
    return { active: false, reason: "Campaign is currently paused or inactive." };
  }
  const now = /* @__PURE__ */ new Date();
  if (now > campaign.endDate || campaign.status === "EXPIRED") {
    return { active: false, reason: "Campaign has expired." };
  }
  if (now < campaign.startDate) {
    return { active: false, reason: "Campaign has not started yet." };
  }
  return { active: true };
}
var WEIGHTED_DISCOUNT_CONFIG, DEFAULT_DISCOUNT_CONFIG, inMemoryCampaigns;
var init_campaign_service = __esm({
  "server/services/campaign.service.ts"() {
    init_Campaign();
    init_env();
    WEIGHTED_DISCOUNT_CONFIG = [
      { discount: 5, weight: 50 },
      { discount: 6, weight: 25 },
      { discount: 7, weight: 15 },
      { discount: 9, weight: 5 },
      { discount: 10, weight: 5 }
    ];
    DEFAULT_DISCOUNT_CONFIG = [
      { discount: 5, count: 4 },
      { discount: 6, count: 2 },
      { discount: 7, count: 1 },
      { discount: 8, count: 1 },
      { discount: 9, count: 1 },
      { discount: 10, count: 0 }
    ];
    inMemoryCampaigns = /* @__PURE__ */ new Map();
  }
});

// server/services/token.service.ts
import jwt from "jsonwebtoken";
function signParticipationToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256"
  });
}
function verifyParticipationToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded.participationId || !decoded.rollNumber || !decoded.campaignId) {
      throw new Error("Invalid token payload");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired participation token");
  }
}
var init_token_service = __esm({
  "server/services/token.service.ts"() {
    init_env();
  }
});

// server/utils/crypto.ts
import crypto2 from "crypto";
function generateRewardCode(campaignId, rollNumber, chanceNumber, discount) {
  const hash = crypto2.createHmac("sha256", process.env.JWT_SECRET || "orange_pulp_secret").update(`${campaignId}:${rollNumber}:${chanceNumber}:${discount}:${Date.now()}:${crypto2.randomBytes(8).toString("hex")}`).digest("hex").substring(0, 6).toUpperCase();
  return `OP-${discount}-${hash}`;
}
var init_crypto = __esm({
  "server/utils/crypto.ts"() {
  }
});

// server/utils/rollNumber.ts
function normalizeRollNumber(input) {
  if (!input) return "";
  return input.trim().replace(/\s+/g, "").toUpperCase();
}
function isValidRollNumber(rollNumber) {
  const normalized = normalizeRollNumber(rollNumber);
  if (normalized.length < 3 || normalized.length > 25) {
    return false;
  }
  const pattern = /^[A-Z0-9\-_./]+$/;
  return pattern.test(normalized);
}
var init_rollNumber = __esm({
  "server/utils/rollNumber.ts"() {
  }
});

// server/services/game.service.ts
var game_service_exports = {};
__export(game_service_exports, {
  GameError: () => GameError,
  claimCurrentReward: () => claimCurrentReward,
  getAvailableBoxes: () => getAvailableBoxes,
  getGameStatus: () => getGameStatus,
  selectMysteryBox: () => selectMysteryBox,
  verifyOrStartStudent: () => verifyOrStartStudent
});
import mongoose3 from "mongoose";
function getMemoryKey(campaignId, rollNumber) {
  return `${campaignId}:${rollNumber}`;
}
async function verifyOrStartStudent(rawRollNumber, campaignId) {
  const rollNumber = normalizeRollNumber(rawRollNumber);
  if (!isValidRollNumber(rollNumber)) {
    throw new GameError(
      "Invalid college roll number. Please enter 3 to 25 alphanumeric characters.",
      400,
      "INVALID_ROLL_NUMBER"
    );
  }
  const campaign = await getOrCreateCampaign(campaignId);
  const statusCheck = isCampaignActive(campaign);
  if (!statusCheck.active) {
    throw new GameError(statusCheck.reason || "Campaign is not active.", 400, "CAMPAIGN_INACTIVE");
  }
  let participation = null;
  if (mongoose3.connection.readyState === 1) {
    try {
      participation = await Participation.findOne({ campaignId, rollNumber });
      if (!participation) {
        participation = await Participation.create({
          campaignId,
          rollNumber,
          chancesUsed: 0,
          selectedBoxes: [],
          rewards: [],
          finalDiscount: null,
          finalRewardCode: null,
          status: "IN_PROGRESS",
          createdAt: /* @__PURE__ */ new Date(),
          completedAt: null
        });
      }
    } catch (err) {
      if (err.code === 11e3) {
        participation = await Participation.findOne({ campaignId, rollNumber });
      } else {
        console.warn("Mongoose query failed, using memory store:", err);
      }
    }
  }
  if (!participation) {
    const key = getMemoryKey(campaignId, rollNumber);
    if (!memoryParticipations.has(key)) {
      const newPart = {
        _id: "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        campaignId,
        rollNumber,
        chancesUsed: 0,
        selectedBoxes: [],
        rewards: [],
        finalDiscount: null,
        finalRewardCode: null,
        status: "IN_PROGRESS",
        createdAt: /* @__PURE__ */ new Date(),
        completedAt: null
      };
      memoryParticipations.set(key, newPart);
      memoryParticipations.set(newPart._id, newPart);
    }
    participation = memoryParticipations.get(key);
  }
  const partId = participation._id ? participation._id.toString() : participation.id;
  const token = signParticipationToken({
    participationId: partId,
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId
  });
  return {
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId,
    status: participation.status,
    chancesUsed: participation.chancesUsed,
    totalChances: 3,
    selectedBoxes: participation.selectedBoxes,
    rewards: participation.rewards,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    token
  };
}
async function findParticipationById(participationId) {
  if (mongoose3.connection.readyState === 1) {
    try {
      const doc = await Participation.findById(participationId);
      if (doc) return doc;
    } catch (e) {
    }
  }
  return memoryParticipations.get(participationId) || null;
}
async function getAvailableBoxes(participationId) {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError("Participation record not found.", 404, "NOT_FOUND");
  }
  const allBoxes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const selectedSet = new Set(participation.selectedBoxes || []);
  const availableBoxes = allBoxes.filter((box) => !selectedSet.has(box));
  return {
    availableBoxes,
    selectedBoxes: participation.selectedBoxes || [],
    chancesUsed: participation.chancesUsed || 0,
    totalChances: 3,
    remainingChances: Math.max(0, 3 - (participation.chancesUsed || 0)),
    status: participation.status
  };
}
async function selectMysteryBox(participationId, boxNumber) {
  if (!Number.isInteger(boxNumber) || boxNumber < 1 || boxNumber > 9) {
    throw new GameError("Invalid box number. Must be an integer between 1 and 9.", 400);
  }
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError("Participation record not found.", 404, "NOT_FOUND");
  }
  if (participation.status === "COMPLETED" || participation.chancesUsed >= 3) {
    throw new GameError(
      "Game already completed. You have used all 3 chances.",
      400,
      "GAME_ALREADY_COMPLETED"
    );
  }
  const existingReward = (participation.rewards || []).find((r) => r.boxNumber === boxNumber);
  if (existingReward) {
    const isFinal = participation.chancesUsed === 3;
    return {
      reward: existingReward,
      chancesUsed: participation.chancesUsed,
      remainingChances: Math.max(0, 3 - participation.chancesUsed),
      status: participation.status,
      isFinalChance: isFinal,
      finalDiscount: participation.finalDiscount,
      finalRewardCode: participation.finalRewardCode
    };
  }
  if ((participation.selectedBoxes || []).includes(boxNumber)) {
    throw new GameError(
      `Box ${boxNumber} has already been selected by you. Please pick a different mystery box.`,
      400,
      "BOX_ALREADY_SELECTED"
    );
  }
  const campaign = await getOrCreateCampaign(participation.campaignId);
  const statusCheck = isCampaignActive(campaign);
  if (!statusCheck.active) {
    throw new GameError(statusCheck.reason || "Campaign is not active.", 400, "CAMPAIGN_INACTIVE");
  }
  const boxConfig = campaign.boxArrangement?.find((b) => b.boxNumber === boxNumber);
  const assignedDiscount = process.env.NODE_ENV === "test" && boxConfig && boxConfig.discount ? boxConfig.discount : sampleWeightedDiscount();
  const nextChance = participation.chancesUsed + 1;
  const isFinalChance = nextChance === 3;
  const rewardCode = generateRewardCode(
    participation.campaignId,
    participation.rollNumber,
    nextChance,
    assignedDiscount
  );
  const newReward = {
    boxNumber,
    discount: assignedDiscount,
    rewardCode,
    selectedAt: /* @__PURE__ */ new Date(),
    revealedAt: /* @__PURE__ */ new Date()
  };
  if (mongoose3.connection.readyState === 1 && typeof participation.save === "function") {
    const updateQuery = {
      $push: { selectedBoxes: boxNumber, rewards: newReward },
      $inc: { chancesUsed: 1 }
    };
    if (isFinalChance) {
      updateQuery.$set = {
        finalDiscount: assignedDiscount,
        finalRewardCode: rewardCode,
        status: "COMPLETED",
        completedAt: /* @__PURE__ */ new Date()
      };
    }
    const updated = await Participation.findOneAndUpdate(
      {
        _id: participationId,
        chancesUsed: participation.chancesUsed,
        selectedBoxes: { $ne: boxNumber },
        status: "IN_PROGRESS"
      },
      updateQuery,
      { new: true }
    );
    if (updated) {
      return {
        reward: newReward,
        chancesUsed: updated.chancesUsed,
        remainingChances: Math.max(0, 3 - updated.chancesUsed),
        status: updated.status,
        isFinalChance,
        finalDiscount: updated.finalDiscount,
        finalRewardCode: updated.finalRewardCode
      };
    }
  }
  participation.selectedBoxes.push(boxNumber);
  participation.rewards.push(newReward);
  participation.chancesUsed += 1;
  if (isFinalChance) {
    participation.finalDiscount = assignedDiscount;
    participation.finalRewardCode = rewardCode;
    participation.status = "COMPLETED";
    participation.completedAt = /* @__PURE__ */ new Date();
  }
  return {
    reward: newReward,
    chancesUsed: participation.chancesUsed,
    remainingChances: Math.max(0, 3 - participation.chancesUsed),
    status: participation.status,
    isFinalChance,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode
  };
}
async function getGameStatus(participationId) {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError("Participation record not found.", 404, "NOT_FOUND");
  }
  return {
    rollNumber: participation.rollNumber,
    campaignId: participation.campaignId,
    status: participation.status,
    chancesUsed: participation.chancesUsed,
    totalChances: 3,
    remainingChances: Math.max(0, 3 - participation.chancesUsed),
    selectedBoxes: participation.selectedBoxes,
    rewards: participation.rewards,
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    currentRewardToScratch: participation.rewards && participation.rewards.length > 0 ? participation.rewards[participation.rewards.length - 1] : null
  };
}
async function claimCurrentReward(participationId) {
  const participation = await findParticipationById(participationId);
  if (!participation) {
    throw new GameError("Participation record not found.", 404, "NOT_FOUND");
  }
  if (participation.status === "COMPLETED" && participation.finalDiscount !== null) {
    return {
      finalDiscount: participation.finalDiscount,
      finalRewardCode: participation.finalRewardCode || "",
      status: "COMPLETED",
      rewards: participation.rewards
    };
  }
  if (!participation.rewards || participation.rewards.length === 0) {
    throw new GameError("No discount coupon available to utilize. Please open a mystery box first.", 400);
  }
  const latestReward = participation.rewards[participation.rewards.length - 1];
  participation.finalDiscount = latestReward.discount;
  participation.finalRewardCode = latestReward.rewardCode;
  participation.status = "COMPLETED";
  participation.completedAt = /* @__PURE__ */ new Date();
  if (typeof participation.save === "function") {
    await participation.save();
  }
  return {
    finalDiscount: participation.finalDiscount,
    finalRewardCode: participation.finalRewardCode,
    status: "COMPLETED",
    rewards: participation.rewards
  };
}
var GameError, memoryParticipations;
var init_game_service = __esm({
  "server/services/game.service.ts"() {
    init_Participation();
    init_campaign_service();
    init_token_service();
    init_crypto();
    init_rollNumber();
    GameError = class extends Error {
      statusCode;
      code;
      constructor(message, statusCode = 400, code) {
        super(message);
        this.name = "GameError";
        this.statusCode = statusCode;
        this.code = code;
      }
    };
    memoryParticipations = /* @__PURE__ */ new Map();
  }
});

// server/app.ts
init_env();
import express from "express";
import cors from "cors";
import helmet from "helmet";

// server/middleware/rateLimiter.ts
init_env();
import rateLimit from "express-rate-limit";
var isTest = env.NODE_ENV === "test";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: isTest ? 1e4 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again in a few minutes.",
    code: "RATE_LIMIT_EXCEEDED"
  }
});
var rollNumberLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: isTest ? 1e4 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many roll number verification attempts. Please wait a few moments.",
    code: "RATE_LIMIT_EXCEEDED"
  }
});

// server/middleware/errorHandler.ts
init_game_service();
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof GameError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code || "GAME_ERROR"
    });
    return;
  }
  if (err.code === 11e3) {
    res.status(409).json({
      success: false,
      error: "Duplicate participation record detected. Please reload.",
      code: "DUPLICATE_RECORD"
    });
    return;
  }
  console.error("Unhandled server error:", err);
  res.status(500).json({
    success: false,
    error: "An unexpected server error occurred. Please try again.",
    code: "INTERNAL_SERVER_ERROR"
  });
}

// server/routes/student.routes.ts
import { Router } from "express";

// server/controllers/student.controller.ts
init_game_service();
init_env();
async function verifyStudentHandler(req, res, next) {
  try {
    const { rollNumber, campaignId } = req.body;
    const targetCampaignId = campaignId || env.CAMPAIGN_ID;
    const result = await verifyOrStartStudent(rollNumber, targetCampaignId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// server/middleware/validation.ts
import { z as z2 } from "zod";
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      res.status(400).json({
        success: false,
        error: errorMessages,
        code: "VALIDATION_ERROR",
        details: result.error.errors
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
var verifyRollNumberSchema = z2.object({
  rollNumber: z2.string({ required_error: "Roll number is required" }).min(3, "Roll number must have at least 3 characters").max(25, "Roll number cannot exceed 25 characters"),
  campaignId: z2.string().optional()
});
var selectBoxSchema = z2.object({
  boxNumber: z2.number({ required_error: "Box number is required" }).int("Box number must be an integer").min(1, "Box number must be between 1 and 9").max(9, "Box number must be between 1 and 9")
});

// server/routes/student.routes.ts
var router = Router();
router.post(
  "/verify",
  rollNumberLimiter,
  validateBody(verifyRollNumberSchema),
  verifyStudentHandler
);
var student_routes_default = router;

// server/routes/game.routes.ts
import { Router as Router2 } from "express";

// server/controllers/game.controller.ts
init_game_service();
init_env();
async function startGameHandler(req, res, next) {
  try {
    const { rollNumber, campaignId } = req.body;
    const targetCampaignId = campaignId || env.CAMPAIGN_ID;
    const result = await verifyOrStartStudent(rollNumber, targetCampaignId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function getBoxesHandler(req, res, next) {
  try {
    if (!req.participation) {
      throw new GameError("Unauthorized participation.", 401);
    }
    const boxesData = await getAvailableBoxes(req.participation.participationId);
    res.status(200).json({
      success: true,
      data: boxesData
    });
  } catch (error) {
    next(error);
  }
}
async function selectBoxHandler(req, res, next) {
  try {
    if (!req.participation) {
      throw new GameError("Unauthorized participation.", 401);
    }
    const { boxNumber } = req.body;
    const result = await selectMysteryBox(req.participation.participationId, boxNumber);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
async function getStatusHandler(req, res, next) {
  try {
    if (!req.participation) {
      throw new GameError("Unauthorized participation.", 401);
    }
    const statusData = await getGameStatus(req.participation.participationId);
    res.status(200).json({
      success: true,
      data: statusData
    });
  } catch (error) {
    next(error);
  }
}
async function getRewardsHandler(req, res, next) {
  try {
    if (!req.participation) {
      throw new GameError("Unauthorized participation.", 401);
    }
    const statusData = await getGameStatus(req.participation.participationId);
    res.status(200).json({
      success: true,
      data: {
        rewards: statusData.rewards,
        finalDiscount: statusData.finalDiscount,
        finalRewardCode: statusData.finalRewardCode,
        status: statusData.status
      }
    });
  } catch (error) {
    next(error);
  }
}
async function claimCurrentHandler(req, res, next) {
  try {
    if (!req.participation) {
      throw new GameError("Unauthorized participation.", 401);
    }
    const { claimCurrentReward: claimCurrentReward2 } = await Promise.resolve().then(() => (init_game_service(), game_service_exports));
    const result = await claimCurrentReward2(req.participation.participationId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// server/middleware/auth.ts
init_token_service();
function requireParticipationAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers["x-participation-token"];
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Missing participation authentication token. Please enter your roll number first.",
      code: "UNAUTHORIZED"
    });
    return;
  }
  try {
    const decoded = verifyParticipationToken(token);
    req.participation = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired participation session. Please verify your roll number again.",
      code: "TOKEN_INVALID"
    });
  }
}

// server/routes/game.routes.ts
var router2 = Router2();
router2.post(
  "/start",
  rollNumberLimiter,
  validateBody(verifyRollNumberSchema),
  startGameHandler
);
router2.get("/boxes", requireParticipationAuth, getBoxesHandler);
router2.post("/select", requireParticipationAuth, validateBody(selectBoxSchema), selectBoxHandler);
router2.post("/claim-current", requireParticipationAuth, claimCurrentHandler);
router2.get("/status", requireParticipationAuth, getStatusHandler);
router2.get("/rewards", requireParticipationAuth, getRewardsHandler);
var game_routes_default = router2;

// server/app.ts
var app = express();
app.use(
  helmet({
    contentSecurityPolicy: false
    // Allow canvas and inline styles for game
  })
);
var allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-participation-token"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);
app.get(["/api/health", "/health"], (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    brand: "Orange Pulp Juice Point",
    service: "Student Discount Game API (Vercel Serverless)"
  });
});
app.use("/api/student", student_routes_default);
app.use("/student", student_routes_default);
app.use("/api/game", game_routes_default);
app.use("/game", game_routes_default);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: "NOT_FOUND"
  });
});
app.use(errorHandler);
var app_default = app;

// server/db/connection.ts
init_env();
import mongoose4 from "mongoose";
async function connectDB() {
  if (mongoose4.connection.readyState >= 1) {
    return mongoose4;
  }
  const uri = process.env.MONGODB_URI || env.MONGODB_URI;
  if (!uri) {
    console.warn("\u26A0\uFE0F No MONGODB_URI set. Operating with in-memory resilient fallback.");
    return null;
  }
  try {
    const conn = await mongoose4.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5e3
    });
    console.log(`\u{1F96D} MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn("\u26A0\uFE0F MongoDB connection warning. Operating with fallback storage:", error);
    return null;
  }
}

// api/index.ts
init_campaign_service();
init_env();
var isDbInitialized = false;
async function handler(req, res) {
  if (!isDbInitialized) {
    try {
      await connectDB();
      await getOrCreateCampaign(env.CAMPAIGN_ID);
      isDbInitialized = true;
    } catch (e) {
      console.warn("DB initialization notice in serverless handler:", e);
    }
  }
  return app_default(req, res);
}
export {
  handler as default
};
