import { Octokit } from "octokit";
import { db } from "@/server/db";
import axios from 'axios';
import { summariseCommitFunction } from "./geminiFunctions";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = 'https://github.com/docker/genai-stack';

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split('/').slice(-2);
  
  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo
  });
  const sortedCommits = data.sort((a: any, b: any) => 
    new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  ) as any[];

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? ""
  }));
}

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  
  if (!githubUrl) {
    return []; // Return empty array instead of throwing error
  }

  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
  
  const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
    return summariseCommit(githubUrl, commit.commitHash);
  }));

  const summaries = summaryResponses.map((response) => {
    if (response.status === 'fulfilled') {
      return response.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`Analyzing commit: ${index}`)
      const commit = unprocessedCommits[index];
      if (!commit) {
        throw new Error(`No commit data found for summary at index ${index}`);
      }
      
      return {
        projectId: projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        summary
      };
    })
  });

  return commits;
}

export const summariseCommit = async (githubUrl: string, commitHash: string) => {
  // getting the diff, then passing the diff into ai
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: 'application/vnd.github.v3.diff' //githubs custom diff format, not the default diff format that github gives yo
    }
  });

  return await summariseCommitFunction(data) || " ";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true
    }
  });

  if (!project) {
    return { project: null, githubUrl: null };
  }

  if (!project.githubUrl) {
    return { project, githubUrl: null };
  }

  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: { projectId }
  });

  const unprocessedCommits = commitHashes.filter(commit => !processedCommits.some(processedCommit => processedCommit.commitHash === commit.commitHash));
  return unprocessedCommits;
}

await pollCommits("cm8gunbq500062bkclj07y18e").then(console.log);