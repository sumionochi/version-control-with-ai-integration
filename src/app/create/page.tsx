'use client';

import React, { useState } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { AutoComplete } from '@progress/kendo-react-dropdowns';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { Label } from '@progress/kendo-react-labels';
import { generate } from 'random-words';
import { linkIcon } from '@progress/kendo-svg-icons';

const generateRandomNames = () => {
  return Array.from({ length: 5 }, () => {
    const words = generate({ exactly: 2, join: '-' });
    return words;
  });
};

const Create = () => {
  const [projectName, setProjectName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [suggestions] = useState(generateRandomNames());
  
  const [errors, setErrors] = useState({
    projectName: '',
    repoUrl: ''
  });

  const validateForm = () => {
    const newErrors = {
      projectName: '',
      repoUrl: ''
    };

    if (!projectName || projectName.length < 3) {
      newErrors.projectName = 'Project name must be at least 3 characters long';
    }

    if (!repoUrl) {
      newErrors.repoUrl = 'GitHub repository URL is required';
    } else if (!repoUrl.startsWith('https://github.com/')) {
      newErrors.repoUrl = 'Please enter a valid GitHub repository URL';
    }

    setErrors(newErrors);
    return !newErrors.projectName && !newErrors.repoUrl;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowDialog(true);
    }
  };

  const handleConfirm = () => {
    // Handle the repository linking logic here
    setShowDialog(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Link your GitHub Repository</h1>
      
      <div className="space-y-6">
        <div>
          <Label>Project Name</Label>
          <AutoComplete
            data={suggestions}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Select or type a project name"
          />
          {errors.projectName && (
            <div className="text-red-500 text-sm mt-1">{errors.projectName}</div>
          )}
        </div>

        <div>
          <Label>GitHub Repository URL</Label>
          <Input
            value={repoUrl}
            onChange={(e: { value: string }) => setRepoUrl(e.value)}
            placeholder="https://github.com/username/repository"
          />
          {errors.repoUrl && (
            <div className="text-red-500 text-sm mt-1">{errors.repoUrl}</div>
          )}
        </div>

        <div>
          <Label>GitHub Token (optional, for private repositories)</Label>
          <Input
            type="password"
            value={githubToken}
            onChange={(e: { value: string }) => setGithubToken(e.value)}
            placeholder="Enter your GitHub token"
          />
        </div>

        <Button
          themeColor="primary"
          onClick={handleSubmit}
          className="mt-4"
          svgIcon={linkIcon}
        >
          Link Repository 
        </Button>
      </div>

      {showDialog && (
        <Dialog title="Confirm Repository Linking" onClose={() => setShowDialog(false)}>
          <p>Are you sure you want to link this repository?</p>
          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={() => setShowDialog(false)}>No</Button>
            <Button themeColor="primary" onClick={handleConfirm}>Yes</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Create;