import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/audio/client"; // Re-using openai client from audio integration (it has the API keys setup)

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.projects.list.path, async (req, res) => {
    try {
      const allProjects = await storage.getProjects();
      res.json(allProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    try {
      const project = await storage.getProject(Number(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject({
        ...input,
      });

      // Kick off generation asynchronously
      generateWebsite(project.id, input.prompt).catch(console.error);

      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.projects.generate.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { prompt } = req.body;
      
      // Update status to generating
      const updatedProject = await storage.updateProject(id, { status: "generating" });

      // Kick off generation asynchronously
      generateWebsite(id, prompt, project).catch(console.error);

      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

const SYSTEM_PROMPT = `You are an expert web developer creating an AI website builder.
You will be asked to generate or modify a complete, professional, and modern website based on user prompts.
The website should be feature-rich, visually stunning, and highly functional.
Include:
1. A clear, modern layout with multiple sections (Hero, Features, About, Contact, etc.).
2. High-quality placeholder content that fits the prompt.
3. Advanced Tailwind CSS for styling (gradients, animations, responsive design).
4. Interactive elements using JavaScript (scroll animations, form handling, toggles).

You must return the result EXACTLY as a JSON object with the following structure:
{
  "html": "...",
  "css": "...",
  "js": "..."
}
The HTML should NOT include <html>, <head>, or <body> tags, just the content that goes inside the body.
Use Tailwind CSS classes in the HTML for styling. The CSS field is for any custom styles needed beyond Tailwind.
The JS field is for any client-side interactivity.
Do not wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`). Just return raw JSON.`;

async function generateWebsite(projectId: number, newPrompt: string, existingProject?: any) {
  try {
    let messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (existingProject && existingProject.html) {
      messages.push({
        role: "user", 
        content: `Here is the current state of the website:
HTML: ${existingProject.html}
CSS: ${existingProject.css}
JS: ${existingProject.js}

Please modify the website based on this new prompt: ${newPrompt}`
      });
    } else {
      messages.push({
        role: "user",
        content: `Create a new website based on this prompt: ${newPrompt}`
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    const generated = JSON.parse(content);
    
    await storage.updateProject(projectId, {
      html: generated.html || "",
      css: generated.css || "",
      js: generated.js || "",
      status: "completed"
    });

  } catch (error) {
    console.error("Error generating website:", error);
    await storage.updateProject(projectId, { status: "failed" });
  }
}
