'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeContextType = {
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setThemeMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}