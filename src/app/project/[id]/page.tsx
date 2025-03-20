'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import GetProject from '@/hooks/getProjects';
import { Card } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { folderIcon, linkIcon } from '@progress/kendo-svg-icons';
import { SvgIcon } from "@progress/kendo-react-common";

const ProjectPage = () => {
  const params = useParams();
  const { projects } = GetProject();
  const currentProject = projects?.find(project => project.id === params.id);

  if (!currentProject) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Project not found</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="p-2 bg-gray-100 rounded-lg">
            <SvgIcon icon={folderIcon} size="large" />
          </span>
          <h1 className="text-2xl font-bold">{currentProject.name}</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Repository Details</h2>
            <div className="flex items-center gap-2">
              <SvgIcon icon={linkIcon} />
              <a 
                href={currentProject.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {currentProject.githubUrl}
              </a>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button themeColor="primary">View Files</Button>
            <Button themeColor="info">Project Settings</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectPage;