import fs from "fs";
import { createRequire } from "module";
import Resume from "../models/Resume.js";
import { analyzeResume } from "../services/geminiService.js";
import { promises as fsPromises } from "fs";
import { getCanonicalSkill } from "../services/recommendationService.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse");





export const uploadResume = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume."
            });
        }

        const existingResume = await Resume.findOne({
            user: req.user._id,
        });

        if (
            existingResume &&
            existingResume.nextUploadAt &&
            existingResume.nextUploadAt > new Date()
        ) {
            return res.status(429).json({
                success: false,
                message: "You can upload another resume after 1 day.",
                nextUploadAt: existingResume.nextUploadAt,
            });
        }
        

        if (!fs.existsSync(req.file.path)) {
            throw new Error(`File not found: ${req.file.path}`);
        }

        const buffer = fs.readFileSync(req.file.path);

        const data = await pdf(buffer);

        const analysis = await analyzeResume(data.text);

        // Save or update resume
        console.log("Saving to MongoDB...");
        const resume = await Resume.findOneAndUpdate(
            {
                user: req.user._id,
            },
            {
                user: req.user._id,
                fileName: req.file.originalname,
                rawText: data.text,

                skills:  [...new Set((analysis.skills || []).map(getCanonicalSkill))],
                education: analysis.education || [],
                experience: analysis.experience || [],
                projects: analysis.projects || [],
                strengths: analysis.strengths || [],
                missingSkills: analysis.missingSkills || [],
                preferredRoles: analysis.preferredRoles || [],
                atsScore: analysis.atsScore || 0,
                suggestions: analysis.suggestions || [],

                uploadedAt: new Date(),

                nextUploadAt : new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                )
            },
            {
                upsert: true,
                returnDocument: "after",
            }
        );

        // Link resume to user
        req.user.resume = resume._id;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Resume analyzed successfully.",
            resume,
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Resume upload failed.",
        });

    } finally {

        // Always delete uploaded file

    if (req.file) {
        try {
            await fsPromises.unlink(req.file.path);
            console.log("Deleted successfully");
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }
}

};


export const getResume = async (req, res) => {
    try {

        const resume = await Resume.findOne({
            user: req.user._id,
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Resume fetched successfully.",
            resume,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
