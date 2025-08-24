import {SidebarMenu, SidebarMenuItem, SidebarMenuButton} from '@/components/ui/sidebar';
import {Link} from 'wouter';
import {Terminal} from 'lucide-react';

export function TerminalSidebarNav() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/terminal">
                    <SidebarMenuButton tooltip={'Terminal'}>
                        <Terminal className="h-4 w-4"/>
                        <span>Terminal</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
