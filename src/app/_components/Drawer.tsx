'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Drawer, DrawerContent, DrawerSelectEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { inboxIcon, calendarIcon, heartIcon, linkIcon, bellIcon, menuIcon, plusCircleIcon } from '@progress/kendo-svg-icons';
import LoadingState from './LoadingState';
import { useEffect } from 'react';


const items = [
    { text: 'Dashboard', svgIcon: inboxIcon, selected: true, route: '/dashboard' },
    { separator: true },
    { text: 'Notifications', svgIcon: bellIcon, route: '/notifications' },
    { text: 'Calendar', svgIcon: calendarIcon, route: '/calendar' },
    { separator: true },
    { text: 'Create Project', svgIcon: plusCircleIcon, route: '/create' },
];

interface DrawerContainerProps {
    children: React.ReactNode;
}

const DrawerContainer = ({ children }: DrawerContainerProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [expanded, setExpanded] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selected, setSelected] = React.useState(
        items.findIndex((x) => !x.separator && x.route === pathname) || 0
    );

    useEffect(() => {
        setIsLoading(true);
        const timeout = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timeout);
    }, [pathname]);


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
                items={items.map((item, index) => ({
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