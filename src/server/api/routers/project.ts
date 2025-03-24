import { pollCommits } from "@/lib/githubFunctions";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";  
import { stepTwoIndexGithubRepoFiles } from "@/lib/githubFileLangchain";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          githubUrl: z.string(),
          githubToken: z.string().optional()
        })
      )
      .mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
            userToProjects: {
              create: {
                userId: ctx.user.userId!,
              }
            }
          }
        })
        await stepTwoIndexGithubRepoFiles(project.id, input.githubUrl, input.githubToken)
        await pollCommits(project.id)
        return project
      }),  
    getProjects: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId!
            }
          },
          deletedAt: null
        }
      })
    }),
    getCommits: protectedProcedure
    .input(z.object({
      projectId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId).then().catch(console.error)
      return await ctx.db.commit.findMany({ 
        where: { projectId: input.projectId } 
      });
    }),
    saveAnswer: protectedProcedure
        .input(z.object({
            projectId: z.string(),
            question: z.string(),
            answer: z.string(),
            filesReferences: z.any()
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.question.create({
                data: {
                    answer: input.answer,
                    filesReferences: input.filesReferences,
                    projectId: input.projectId,
                    question: input.question,
                    userId: ctx.user.userId!
                }
            })
        }),
})