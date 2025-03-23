'use client'

import { useParams } from 'next/navigation'
import { api } from '@/trpc/react'
import React, { useRef } from 'react'
import { Loader } from "@progress/kendo-react-indicators";
import { Stepper, TileLayout } from '@progress/kendo-react-layout';
import { checkIcon, arrowLeftIcon, arrowRightIcon, paperclipIcon, hyperlinkOpenIcon, xIcon} from '@progress/kendo-svg-icons';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from "@progress/kendo-react-buttons";
import Image from 'next/image';
import { Fade } from "@progress/kendo-react-animation";
import GetProject from '@/hooks/getProjects';
import Link from 'next/link';
import { Popup } from '@progress/kendo-react-popup';

const Commits = () => {
  const params = useParams();
  const isDarkMode = useDarkMode();
  const { projects } = GetProject();
  const currentProject = projects?.find(project => project.id === params.id);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: commits } = api.project.getCommits.useQuery({ 
    projectId: params.id as string 
  });
  const [value, setValue] = React.useState(0);
  const tileRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [focusedTile, setFocusedTile] = React.useState<string | null>(null);
  
  // Popup state
  const [popupState, setPopupState] = React.useState<{
    showPopup: boolean;
    selectedMessage: string;
    anchorEl: HTMLElement | null;
  }>({
    showPopup: false,
    selectedMessage: '',
    anchorEl: null
  });

  const handleStepperClick = (hash: string) => {
    const tileElement = tileRefs.current[hash];
    if (tileElement) {
      setFocusedTile(hash);
      tileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setFocusedTile(null), 2000);
    }
  };

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

  const handleMessageClick = (message: string, element: HTMLElement) => {
    setPopupState({
      showPopup: true,
      selectedMessage: message,
      anchorEl: element
    });
  };

  const closePopup = () => {
    setPopupState(prev => ({
      ...prev,
      showPopup: false
    }));
  };

  if (!commits) {
    return (
      <div className="flex justify-start items-center w-full">
        <Loader size="medium" type="pulsing" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="">
      </div>
    );
  }

  const stepperItems = commits.map(commit => ({
    label: new Date(commit.commitDate).toDateString(),
    svgIcon: checkIcon,
    identifier: commit.commitHash,
    onClick: () => handleStepperClick(commit.commitHash)
  }));

  const tiles = commits.map((commit, index) => ({
    defaultPosition: { col: 1, colSpan: 3, rowSpan: 1 },
    header: (
      <Fade>
      <div 
        ref={(el: HTMLDivElement | null) => {
          if (el) {
            tileRefs.current[commit.commitHash] = el;
          }
        }}
        className={`flex items-center gap-3 p-2 transition-all duration-500 ease-in-out
          ${focusedTile === commit.commitHash ? 'bg-orange-500/20 rounded-lg' : ''}`}
      >
        <Image
          src={commit.commitAuthorAvatar}
          alt={commit.commitAuthorName}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium">{commit.commitAuthorName}</span>
        <span className="text-gray-500">committed on {new Date(commit.commitDate).toLocaleDateString()}</span>
      </div>
      </Fade>
    ),
    body: (
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Link href={currentProject.githubUrl + '/commit/' + commit.commitHash} target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline">
            <Button svgIcon={hyperlinkOpenIcon} className="mt-1" />
          </Link>
          <div>
            <div 
              onClick={(e) => handleMessageClick(commit.commitMessage, e.currentTarget)}
              className="cursor-pointer hover:text-blue-500 transition-colors"
            >
              <h3 className="font-semibold">{commit.commitMessage.split('\n')[0]}</h3>
            </div>
            <code className="text-sm text-gray-500 font-mono mt-1">
              {commit.commitHash}
            </code>
          </div>
        </div>
        <div className="text-sm whitespace-pre-wrap pl-6">
          {commit.summary}
        </div>
      </div>
    ),
    reorderable: true,
    resizable: true
  }));

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="stepper-container">
        <div className='flex flex-rows w-full items-center gap-2 mb-8 justify-center'>
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
              className="commit-stepper [&_.k-step]:mx-[5px] cursor-pointer"
            />
          </div>
        </div>    
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
        <TileLayout
          columns={3}
          rowHeight={300}
          gap={{ rows: 16, columns: 10 }}
          items={tiles}
          className={`commit-tiles ${isDarkMode ? 'dark' : 'light'}`}
        />
        </div>      
      </div>
      
      {/* Popup for commit message */}
      <Popup
        anchor={popupState.anchorEl}
        show={popupState.showPopup}
        popupClass="commit-message-popup"
        animate={true}
        onClose={closePopup}
        offset={{ top: 0, left: 0 }}
        className={"rounded-xl"}
      >
        <div className="p-4 max-w-xl bg-white rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Complete Commit Message</h3>
            <Button 
              svgIcon={xIcon}
              fillMode="flat" 
              size="small" 
              onClick={closePopup}
              aria-label="Close"
            />
          </div>
          <div className="whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
            {popupState.selectedMessage}
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default Commits;