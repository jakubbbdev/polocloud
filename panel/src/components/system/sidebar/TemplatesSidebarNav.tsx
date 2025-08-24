'use client';

import {FileText} from 'lucide-react';
import { Link } from 'wouter';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '@/components/ui/sidebar';


export function TemplatesSidebarNav() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href='/templates'>
                    <SidebarMenuButton tooltip={'Templates'}>
                        <FileText/>
                        <span>Templates</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
