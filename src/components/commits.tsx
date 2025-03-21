'use client'

import { useParams } from 'next/navigation'
import { api } from '@/trpc/react'
import React, { useRef } from 'react'
import { Loader } from "@progress/kendo-react-indicators";
import { Stepper } from '@progress/kendo-react-layout';
import { checkIcon, arrowLeftIcon, arrowRightIcon } from '@progress/kendo-svg-icons';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from "@progress/kendo-react-buttons";

const Commits = () => {
  const isDarkMode = useDarkMode();
  const params = useParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: commits } = api.project.getCommits.useQuery({ 
    projectId: params.id as string 
  });
  const [value, setValue] = React.useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!commits) {
    return (
      <div className="flex justify-start items-center w-full">
        <Loader size="medium" type="pulsing" />
      </div>
    );
  }

  const stepperItems = commits.map(commit => ({
    label: new Date(commit.commitDate).toDateString(),
    svgIcon: checkIcon
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="stepper-container">
        <div className='flex flex-rows w-full items-center gap-2 mb-6 justify-center'>
            <Button 
              svgIcon={arrowLeftIcon}
              fillMode="flat"
              themeColor="secondary"
              className="scroll-button" 
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
            />
            
          <h1 className="text-2xl font-bold mb-0">Git Commits History</h1>
          <Button 
              svgIcon={arrowRightIcon}
              fillMode="flat"
              themeColor="primary"
              className="scroll-button" 
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
            />
        </div>
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide p-0 w-full pb-4"
        >
          <div className="min-w-max" data-theme={isDarkMode ? 'dark' : 'light'}>
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
    </div>
  );
}

export default Commits;