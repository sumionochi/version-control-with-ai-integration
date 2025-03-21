'use client'

import { useParams } from 'next/navigation'
import { api } from '@/trpc/react'
import React from 'react'
import { Loader } from "@progress/kendo-react-indicators";

const Commits = () => {
  const params = useParams();
  const { data: commits } = api.project.getCommits.useQuery({ 
    projectId: params.id as string 
  });

  if (!commits) {
    return (
      <div className="flex justify-center items-center w-full">
        <Loader size="medium" type="pulsing" />
      </div>
    );
  }

  return (
    <pre>{JSON.stringify(commits, null, 2)}</pre>
  );
}

export default Commits;