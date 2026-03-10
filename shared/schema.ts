import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  html: text("html"),
  css: text("css"),
  js: text("js"),
  status: text("status").notNull().default("pending"), // pending, generating, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  prompt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type CreateProjectRequest = InsertProject;
export type UpdateProjectRequest = Partial<InsertProject>;
export type ProjectResponse = Project;
