// Core types for the Opportunity Radar platform

export type OpportunityCategory =
  | "Scholarship"
  | "Hackathon"
  | "Internship"
  | "Fellowship"
  | "Bootcamp"
  | "Competition";

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
  amount?: string; // for scholarships/fellowships
}
