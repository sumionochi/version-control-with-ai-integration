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
import { useClerk, useUser } from '@clerk/nextjs';
import { Avatar } from '@progress/kendo-react-layout';
import { Popup } from '@progress/kendo-react-popup';

interface DrawerItem {
    text?: string;
    svgIcon?: any; 
    selected?: boolean;
    route?: string;
    separator?: boolean;
}

const defaultItems: DrawerItem[] = [
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
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    
    React.useEffect(() => {
        if (!user) {
            router.push('/sign-in');
            return;
        }
    }, [user, router]);

    const [expanded, setExpanded] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [drawerItems, setDrawerItems] = React.useState<DrawerItem[]>(defaultItems);
    const [selected, setSelected] = React.useState(defaultItems.findIndex((x) => !x.separator && x.route === pathname) || 0);
    const [isDarkMode, setIsDarkMode] = React.useState(false); 
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const avatarRef = React.useRef<HTMLDivElement>(null);
    
    // Only call GetProject when user is authenticated

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
                <div className='flex flex-row gap-2 items-center'>
                    <Switch 
                        onChange={handleThemeChange}
                        checked={isDarkMode}
                        className="theme-switch"
                    />
                    <div ref={avatarRef} onClick={() => {
                        if (user) {
                            setShowUserMenu(!showUserMenu)
                        } else {
                            router.push('/sign-in')
                        }
                    }}>
                        <Avatar type="image" className="cursor-pointer">
                            {user ? (
                                <img 
                                    src={user.imageUrl} 
                                    alt={user.fullName || 'User'} 
                                    style={{ width: '100%', height: '100%' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                                    A
                                </div>
                            )}
                        </Avatar>
                    </div>
                    {user && (
                        <Popup
                            anchor={avatarRef.current}
                            show={showUserMenu}
                            popupClass={`p-4 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                            animate={false}
                            onClose={() => setShowUserMenu(false)}
                        >
                            <div className="flex flex-col gap-3 min-w-[200px] p-4">
                                <div className={`font-medium ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
                                    {user?.fullName}
                                </div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                                    {user?.emailAddresses[0]?.emailAddress}
                                </div>
                                <Button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        signOut(() => router.push('/'));
                                    }}
                                    className="mt-2"
                                    themeColor={'error'}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </Popup>
                    )}
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