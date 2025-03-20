'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Drawer, DrawerContent, DrawerSelectEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { inboxIcon, calendarIcon, heartIcon,folderIcon, linkIcon, bellIcon, menuIcon, plusCircleIcon } from '@progress/kendo-svg-icons';
import LoadingState from './LoadingState';
import { useEffect } from 'react';
import GetProject from '@/hooks/getProjects';

interface DrawerItem {
    text?: string;
    svgIcon?: any; 
    selected?: boolean;
    route?: string;
    separator?: boolean;
}

const defaultItems: DrawerItem[] = [
    { text: 'Dashboard', svgIcon: inboxIcon, selected: true, route: '/dashboard' },
    { separator: true },
    { text: 'Notifications', svgIcon: bellIcon, route: '/notifications' },
    { text: 'Calendar', svgIcon: calendarIcon, route: '/calendar' },
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
                const projectItems: DrawerItem[] = projects
                    .filter(project => project && project.name) 
                    .map(project => ({
                        text: project.name,
                        svgIcon: folderIcon,
                        route: `/project/${projectId}`,
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
                // Fallback to default items if there's an error
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

    return (
        <div className="drawer-container">
            {isLoading && <LoadingState />}
            <div className="custom-toolbar">
                <Button svgIcon={menuIcon} fillMode="flat" onClick={handleClick} />
                <span className="mail-box">Version Control AI</span>
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