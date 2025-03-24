import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { stepFiveGenerateEmbeddingsOfSummaryOfFile, stepFourSummarizeCodeOfFile } from './geminiFunctions'
import { db } from '@/server/db'

export const stepOneLoadGithubRepoAsDocs = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  })

  const docs = await loader.load()
  return docs
}

export const stepTwoIndexGithubRepoFiles = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const docs = await stepOneLoadGithubRepoAsDocs(githubUrl, githubToken)
  const allEmbeddings = await stepThreeGenerateEmbeddingsOfFiles(docs)
  
  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`Generating Embeddings : ${index + 1} of ${allEmbeddings.length}`)
    if (!embedding) return
    
    const stepSixPushSummaryEmbeddingsOfAllFilesToDb = await db.sourceCodeEmbedding.create({
      data: {
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        projectId,
      }
    })

    //sql query to update the embedding (prisma doesnt support by default)
    await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${stepSixPushSummaryEmbeddingsOfAllFilesToDb.id}
    `
  }))
}

const stepThreeGenerateEmbeddingsOfFiles = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
      const summary = await stepFourSummarizeCodeOfFile(doc)
      const embedding = await stepFiveGenerateEmbeddingsOfSummaryOfFile(summary)
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      }
    }))
}