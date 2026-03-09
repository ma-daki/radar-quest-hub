// Core types for the Opportunity Radar platform

export type OpportunityCategory =
  | "Scholarship"
  | "Hackathon"
  | "Internship"
  | "Fellowship"
  | "Bootcamp"
  | "Competition"
  | "University Scholarship";

export type ScholarshipLevel = "Diploma" | "Bachelor" | "Master" | "PhD";
export type FundingType = "Fully funded" | "Partial";

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  deadline: string; // ISO date string
  location: string;
  description: string;
  applyLink: string;
  organization: string;
  eligibility: string;
  amount?: string;
  level?: ScholarshipLevel;
  funding?: FundingType;
  country?: string;  // primary country/region
  source?: string;   // data source attribution
}
