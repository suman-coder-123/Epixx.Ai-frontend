import { z } from "zod";

// ---------- Shared API envelope ----------
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
}

// ---------- Enums (single source of truth) ----------
export const COURSE_CATEGORIES = [
  "Web Development",
  "Digital Marketing",
  "Data Science",
  "Cyber Security",
  "Design",
  "AI & ML",
] as const;

export const COURSE_MODES = ["Online", "Offline", "Hybrid"] as const;
export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const COURSE_STATUS = ["draft", "published"] as const;

export const LEAD_TYPES = ["enquiry", "demo", "corporate", "contact"] as const;
export const LEAD_STATUS = [
  "New",
  "Contacted",
  "Demo Scheduled",
  "Enrolled",
  "Not Interested",
] as const;

export const ADMIN_ROLES = ["SuperAdmin", "ContentManager", "Counselor"] as const;

// ---------- Zod schemas (imported by Express middleware + React forms) ----------
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  courseInterested: z.string().trim().max(100).optional().or(z.literal("")),
  courseLabel: z.string().trim().max(140).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  sourcePage: z.string().trim().max(300).default("/"),
  type: z.enum(LEAD_TYPES).default("enquiry"),
});
export type LeadInput = z.infer<typeof leadSchema>;

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(2).max(60),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(20000),
  syllabus: z
    .array(z.object({ module: z.string().min(2).max(140), topics: z.array(z.string().min(1).max(200)) }))
    .default([]),
  duration: z.string().trim().min(1).max(60),
  fees: z.number().nonnegative().default(0),
  discountedFees: z.number().nonnegative().optional(),
  mode: z.enum(COURSE_MODES),
  level: z.enum(COURSE_LEVELS),
  thumbnail: z.string().url().optional().or(z.literal("")),
  highlights: z.array(z.string().max(200)).default([]),
  faqs: z.array(z.object({ q: z.string().min(2), a: z.string().min(2) })).default([]),
  status: z.enum(COURSE_STATUS).default("draft"),
  order: z.number().int().default(0),
  metaTitle: z.string().max(160).optional().or(z.literal("")),
  metaDescription: z.string().max(320).optional().or(z.literal("")),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const batchSchema = z.object({
  course: z.string().min(1),
  startDate: z.string().datetime().or(z.string().min(1)),
  endDate: z.string().datetime().or(z.string().min(1)).optional(),
  mode: z.enum(COURSE_MODES),
  timing: z.string().min(2).max(120),
  trainer: z.string().optional().or(z.literal("")),
  totalSeats: z.number().int().positive().default(30),
  seatsFilled: z.number().int().nonnegative().default(0),
  status: z.enum(["upcoming", "filling-fast", "full", "completed"]).default("upcoming"),
});
export type BatchInput = z.infer<typeof batchSchema>;

export const testimonialSchema = z.object({
  studentName: z.string().min(2).max(80),
  photo: z.string().url().optional().or(z.literal("")),
  course: z.string().optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  quote: z.string().min(10).max(2000),
  videoUrl: z.string().url().optional().or(z.literal("")),
  placedAt: z.string().max(120).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  approved: z.boolean().default(false),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const blogPostSchema = z.object({
  title: z.string().min(3).max(180),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/),
  author: z.string().min(2).max(80),
  coverImage: z.string().url().optional().or(z.literal("")),
  excerpt: z.string().min(10).max(400),
  body: z.string().min(20).max(100000),
  category: z.string().min(2).max(60),
  tags: z.array(z.string().max(40)).default([]),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  publishDate: z.string().datetime().optional().or(z.literal("")),
  readTime: z.number().int().positive().default(5),
  metaTitle: z.string().max(160).optional().or(z.literal("")),
  metaDescription: z.string().max(320).optional().or(z.literal("")),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const certificateSchema = z.object({
  certificateId: z.string().trim().min(3).max(60),
  studentName: z.string().min(2).max(80),
  course: z.string().min(1),
  issueDate: z.string().datetime().or(z.string().min(1)),
  grade: z.string().max(20).optional().or(z.literal("")),
});
export type CertificateInput = z.infer<typeof certificateSchema>;

// ---------- Frontend entity types (API responses) ----------
export interface Course extends CourseInput {
  _id: string;
  trainer?: { _id: string; name: string; photo?: string } | string;
  createdAt: string;
  updatedAt: string;
}
export interface Trainer {
  _id: string;
  name: string;
  slug: string;
  photo?: string;
  bio: string;
  expertise: string[];
  experienceYears: number;
  linkedIn?: string;
  status: "active" | "inactive";
}
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
