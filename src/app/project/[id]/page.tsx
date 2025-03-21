'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import GetProject from '@/hooks/getProjects';
import { Card, CardHeader, CardBody, CardTitle, CardActions, CardImage } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { folderIcon, linkIcon } from '@progress/kendo-svg-icons';
import { SvgIcon } from "@progress/kendo-react-common";
import Commits from '../../../components/commits';
import { useDarkMode } from '@/hooks/useDarkMode';

const ProjectPage = () => {
  const params = useParams();
  const { projects } = GetProject();
  const currentProject = projects?.find(project => project.id === params.id);
  const isDarkMode = useDarkMode();

  if (!currentProject) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Project not found</h1>
      </div>
    );
  }

  // Extract owner and repo from GitHub URL
  const getOgImage = (githubUrl: string) => {
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    return `https://opengraph.githubassets.com/1/${urlParts[0]}/${urlParts[1]}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black/50 text-white' : 'bg-white text-black'} transition-colors duration-200 p-8 flex flex-col justify-start items-start`}>
      <Card style={{ margin: '0 0 2rem 0' }}>
        <div 
              className="relative h-[250px] overflow-hidden cursor-pointer" 
              onClick={() => window.open(currentProject.githubUrl, '_blank', 'noopener,noreferrer')}
            >
              <CardImage 
                src={getOgImage(currentProject.githubUrl)}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5',
                }}
              />
            </div>
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="p-2 bg-gray-100 rounded-lg">
              <SvgIcon icon={folderIcon} size="large" />
            </span>
            <CardTitle>
              <h1 className="text-2xl font-bold">{currentProject.name}</h1>
            </CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Repository Details</h2>
              <div className="flex items-center gap-2">
                <SvgIcon icon={linkIcon} />
                <a 
                  href={currentProject.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {currentProject.githubUrl}
                </a>
              </div>
            </div>
          </div>
        </CardBody>
        <CardActions>
          <Button themeColor="primary" fillMode="flat">View Files</Button>
          <Button themeColor="primary" fillMode="flat">Project Settings</Button>
        </CardActions>
      </Card>
      <div className='w-full'>
        
        <Commits/>  
      </div>          
    </div>
  );
};

export default ProjectPage;