'use client'

import { useParams } from 'next/navigation'
import { api } from '@/trpc/react'
import React from 'react'
import { Loader } from "@progress/kendo-react-indicators";
import { Stepper } from '@progress/kendo-react-layout';
import { checkIcon } from '@progress/kendo-svg-icons';

const Commits = () => {
  const params = useParams();
  const { data: commits } = api.project.getCommits.useQuery({ 
    projectId: params.id as string 
  });
  const [value, setValue] = React.useState(0);

  if (!commits) {
    return (
      <div className="flex justify-start items-center w-full">
        <Loader size="medium" type="pulsing" />
      </div>
    );
  }

  const stepperItems = commits.map(commit => ({
    label: new Date(commit.commitDate).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }),
    svgIcon: checkIcon
  }));

  // Created dummy items for testing
  const dummyItems = Array.from({ length: 100 }, (_, index) => ({
    label: `00/00/00`,
    svgIcon: checkIcon
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="p-0 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-max">
          <Stepper
            value={value}
            onChange={(e) => setValue(e.value)}
            orientation="horizontal"
            items={stepperItems}
            className="commit-stepper [&_.k-step]:mx-[5px]"
          />
        </div>
      </div>
    </div>
  );
}

export default Commits;