'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Drawer, DrawerContent, DrawerSelectEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { inboxIcon, documentManagerIcon, wrenchIcon,folderIcon, linkIcon, bellIcon, menuIcon, plusCircleIcon } from '@progress/kendo-svg-icons';
import LoadingState from './LoadingState';
import { useEffect } from 'react';
import GetProject from '@/hooks/getProjects';
import { Switch } from '@progress/kendo-react-inputs';

interface DrawerItem {
    text?: string;
    svgIcon?: any; 
    selected?: boolean;
    route?: string;
    separator?: boolean;
}

const defaultItems: DrawerItem[] = [
    { text: 'Dashboard', svgIcon: inboxIcon, selected: true, route: '/dashboard' },
    { text: 'Workspace', svgIcon: documentManagerIcon, selected: true, route: '/workspace' },
    { text: 'Buildspace', svgIcon: wrenchIcon, selected: true, route: '/buildspace' },
    { separator: true },
    { separator: true },
    { text: 'Sync Project', svgIcon: plusCircleIcon, route: '/create' },
];

interface DrawerContainerProps {
    children: React.ReactNode;
}

const DrawerContainer = ({ children }: DrawerContainerProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [expanded, setExpanded] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [drawerItems, setDrawerItems] = React.useState<DrawerItem[]>(defaultItems);
    const [selected, setSelected] = React.useState(defaultItems.findIndex((x) => !x.separator && x.route === pathname) || 0);
    const [isDarkMode, setIsDarkMode] = React.useState(false); 
    
    // Added this useEffect to handle initial theme check
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDarkMode(savedTheme === 'dark');
    }, []);
    
    const {projects, projectId} = GetProject();

    useEffect(() => {
        setIsLoading(true);
        const timeout = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timeout);
    }, [pathname]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            try {
                // Created project items with proper type
                console.log("here is projects" ,projects)
                const projectItems: DrawerItem[] = projects
                    .filter(project => project && project.name) 
                    .map(project => ({
                        text: project.name,
                        svgIcon: folderIcon,
                        route: `/project/${project.id}`,
                        selected: false
                    }));

                // Constructed new drawer items array
                const newItems: DrawerItem[] = [
                    ...defaultItems.slice(0, defaultItems.findIndex(item => item.text === 'Sync Project')), // Items before 'Sync Project'
                    ...projectItems,
                    { separator: true } as DrawerItem,
                    { text: 'Sync Project', svgIcon: plusCircleIcon, route: '/create', selected: false } as DrawerItem // Add 'Sync Project' explicitly
                ];

                setDrawerItems(newItems);
            } catch (error) {
                console.error("Error processing projects:", error);
                setDrawerItems(defaultItems);
            }
        }
    }, [projects, projectId]);

    const handleClick = () => {
        setExpanded(!expanded);
    };

    const onSelect = (e: DrawerSelectEvent) => {
        const route = e.itemTarget.props.route;
        if (route) {
            router.push(route);
            setSelected(e.itemIndex);
            setExpanded(false);
        }
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('k-dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('k-dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleThemeChange = (event: any) => {
        const newTheme = event.target.value;
        setIsDarkMode(newTheme);
        
        if (newTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('k-dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('k-dark');
        }
    };

    return (
        <div className="drawer-container">
            {isLoading && <LoadingState />}
            <div className="custom-toolbar flex flex-row justify-between items-center">
                <div>
                    <Button svgIcon={menuIcon} fillMode="flat" onClick={handleClick} />
                    <span className="mail-box">Version Control AI</span>
                </div>
                <div>
                    <Switch 
                        onChange={handleThemeChange}
                        checked={isDarkMode}
                        className="theme-switch"
                    />
                </div>
            </div>
            <Drawer
                expanded={expanded}
                position={'start'}
                mode={'push'}
                mini={true}
                items={drawerItems.map((item, index) => ({
                    ...item,
                    selected: index === selected
                }))}
                onSelect={onSelect}
            >
                <DrawerContent>{children}</DrawerContent>
            </Drawer>
        </div>
    );
};

export default DrawerContainer;