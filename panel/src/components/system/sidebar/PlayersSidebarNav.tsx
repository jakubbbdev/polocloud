'use client';

import {Users} from 'lucide-react';

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {Link} from 'wouter';

export function PlayersSidebarNav() {

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href='/players'>
                    <SidebarMenuButton tooltip={'Players'}>
                        <Users/>
                        <span>Players</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
