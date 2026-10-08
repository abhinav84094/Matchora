import { scrapeNaukriJobs } from "./scrapers/naukriScraper.js";

export const searchJobs = async (query) => scrapeNaukriJobs(query);
