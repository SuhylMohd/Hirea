import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const appRoleEnum = pgEnum("app_role", ["candidate", "employer", "investor", "admin"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull().default("Muhammed Suhail T.M"),
  headline: text("headline").notNull().default("Full-Stack Python & React Engineer"),
  companyName: text("company_name").notNull().default(""),
  location: text("location").notNull().default("Pattambi / Kochi, Kerala"),
  bio: text("bio").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  userScore: integer("user_score").notNull().default(820),
  atsScore: integer("ats_score").notNull().default(78),
  tierBadge: text("tier_badge").notNull().default("Gold Badge"),
  referralCount: integer("referral_count").notNull().default(3),
  interviewPassed: boolean("interview_passed").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  resumeTemplate: text("resume_template").notNull().default("royal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  employerId: uuid("employer_id"),
  title: text("title").notNull(),
  company: text("company").notNull(),
  category: text("category").notNull().default("Engineering"),
  workplace: text("workplace").notNull().default("Remote"),
  employmentType: text("employment_type").notNull().default("Full-time"),
  location: text("location").notNull().default(""),
  salary: text("salary").notNull().default(""),
  description: text("description").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  sponsored: boolean("sponsored").notNull().default(false),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").notNull(),
  applicantId: uuid("applicant_id").notNull(),
  coverLetter: text("cover_letter").notNull().default(""),
  status: text("status").notNull().default("submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
