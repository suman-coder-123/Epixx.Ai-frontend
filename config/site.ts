export const SITE = {
  name: "Epixx AI Institute of Intelligence",
  shortName: "Epixx AI",
  city: "Jaipur",
  tagline: "Learn job-ready skills with mentors, live projects and placement support.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  phone: "+91-9829012345",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919829012345",
  email: "hello@epixx.ai",
  address: "Malviya Nagar, Jaipur",
} as const;

export const NAV_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "Placements", href: "/placements" },
  { label: "Trainers", href: "/trainers" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const COURSE_CATEGORIES = [
  "Web Development",
  "Digital Marketing",
  "Data Science",
  "Cyber Security",
  "Design",
  "AI & ML",
] as const;

export const LEAD_STATUS = [
  "New",
  "Contacted",
  "Demo Scheduled",
  "Enrolled",
  "Not Interested",
] as const;
