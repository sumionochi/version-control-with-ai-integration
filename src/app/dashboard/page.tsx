'use client'
import GetProject from '@/hooks/getProjects';
import { useUser } from '@clerk/nextjs'
import React from 'react'
import { useDarkMode } from '@/hooks/useDarkMode';
import "../globals.css";

export default function Dashboard() {
    const { user } = useUser();
    const isDarkMode = useDarkMode();
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black/50 text-white' : 'bg-white text-black'} transition-colors duration-200`}>
        <div>
          {user?.firstName}
        </div>
      </div>
    )
}