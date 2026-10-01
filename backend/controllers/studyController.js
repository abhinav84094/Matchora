import Resume from "../models/Resume.js";
import SkillResource from "../models/SkillResource.js";
// import { getGeminiResources } from "../services/geminiService.js";

export const getStudyResources = async (req, res) => {

  try {

    // Step 1 — Resume se missing skills lo
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found. Please upload your resume first.",
      });
    }

    if (!resume.missingSkills || resume.missingSkills.length === 0) {
      return res.status(200).json({
        success:  true,
        message:  "No missing skills found! Your resume looks great.",
        resources: [],
      });
    }

    // Step 2 — Har missing skill ke liye resources fetch karo
    const resources = [];

    for (const skill of resume.missingSkills) {

      // Static DB mein check karo pehle
      const staticResource = await SkillResource.findOne({
        skill,
        isActive: true,
      });

      if (staticResource) {
        // Static DB mein mila 
        resources.push({
          skill,
          description: staticResource.description,
          resources:   staticResource.resources,
          source:      "static",
        });

      } 
      else{
        console.log(`We will update soon for ${skill}`);
      }
    //   else {
    //     // Static DB mein nahi mila → Gemini se fetch karo
    //     try {
    //       const geminiResources = await getGeminiResources(skill);
    //       resources.push({
    //         skill,
    //         description: geminiResources.description,
    //         resources:   geminiResources.resources,
    //         source:      "ai",
    //       });
    //     } catch {
    //       // Gemini bhi fail hua → skip karo
    //       console.log(`No resources found for: ${skill}`);
    //     }
    //   }
    }



    return res.status(200).json({
      success:       true,
      missingSkills: resume.missingSkills,
      resources,
    });

  } catch (err) {

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch study resources.",
    });

  }

};