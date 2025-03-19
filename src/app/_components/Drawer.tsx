'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Drawer, DrawerContent, DrawerSelectEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { inboxIcon, calendarIcon, heartIcon, linkIcon, bellIcon, menuIcon } from '@progress/kendo-svg-icons';

const items = [
    { text: 'Inbox', svgIcon: inboxIcon, selected: true, route: '/dashboard' },
    { separator: true },
    { text: 'Notifications', svgIcon: bellIcon, route: '/notifications' },
    { text: 'Calendar', svgIcon: calendarIcon, route: '/calendar' },
    { separator: true },
    { text: 'Attachments', svgIcon: linkIcon, route: '/attachments' },
    { text: 'Favourites', svgIcon: heartIcon, route: '/favourites' }
];

interface DrawerContainerProps {
    children: React.ReactNode;
}

const DrawerContainer = ({ children }: DrawerContainerProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [expanded, setExpanded] = React.useState(true);
    const [selected, setSelected] = React.useState(
        items.findIndex((x) => !x.separator && x.route === pathname) || 0
    );

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