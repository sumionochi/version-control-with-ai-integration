import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            setIsDarkMode(savedTheme === 'dark');
        };

        checkTheme();
        const interval = setInterval(checkTheme, 100);

        return () => clearInterval(interval);
    }, []);

    return isDarkMode;
};