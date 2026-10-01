import SkillResource from "../models/SkillResource.js";
import { SKILL_RESOURCES } from "../data/skillResources.js";

export const seedSkillResources = async () => {
  try {
    console.log("Seeding skill resources...");

    const operations = Object.entries(SKILL_RESOURCES).map(
      ([skill, data]) => ({
        updateOne: {
          filter: { skill },
          update: {
            $set: {
              skill,
              ...data,
              isActive: true,
            },
          },
          upsert: true,
        },
      })
    );

    const result = await SkillResource.bulkWrite(operations);

    console.log("Skill resources seeded!");
    console.log(`   Inserted : ${result.upsertedCount}`);
    console.log(`   Updated  : ${result.modifiedCount}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  }
};