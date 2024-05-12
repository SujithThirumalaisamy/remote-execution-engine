"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const src_1 = __importDefault(require("../../../db/src"));
const redis_1 = require("redis");
const client_1 = require("../../../db/node_modules/@prisma/client");
require("dotenv").config();
const redisClient = (0, redis_1.createClient)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// GET /submission/:id
app.get("/submission/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const submission = yield src_1.default.submission.findFirst({
            where: { id },
        });
        //Return if stdin does not exist
        if ((submission === null || submission === void 0 ? void 0 : submission.stdin[0]) == "") {
            const { stdin } = submission, rest = __rest(submission, ["stdin"]);
            return res.json(rest);
        }
        //Return including the stdin if present
        res.json(submission);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// POST /submission
app.post("/submission", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { submission } = req.body;
        const createdSubmission = yield src_1.default.submission.create({
            data: Object.assign({}, submission),
        });
        redisClient.LPUSH("submission_ids", createdSubmission.id.toString());
        res.json(createdSubmission);
    }
    catch (error) {
        console.error("Error creating submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// PATCH /submission/:id
app.patch("/submission/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { testCasesPassed, stdOut, status } = req.body;
        if (status === client_1.SubmissionStatus.Successful) {
            redisClient.LPUSH("deployments_to_be_deleted", id);
            const updatedSubmission = yield src_1.default.submission.update({
                where: { id },
                data: {
                    status,
                    testCasesPassed,
                },
            });
            return res.json(updatedSubmission);
        }
        const updatedSubmission = yield src_1.default.submission.update({
            where: { id },
            data: {
                stdout: stdOut,
                status,
            },
        });
        res.json(updatedSubmission);
    }
    catch (error) {
        console.error("Error updating submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.connect();
    redisClient.set("API_URL", process.env.API_URL || "");
}));
