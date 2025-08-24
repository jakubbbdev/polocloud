import * as React from 'react';
import logo from '@/assets/img.png';
import {GroupsSidebarNav} from '@/components/system/sidebar/GroupsSidebarNav';
import {PlayersSidebarNav} from '@/components/system/sidebar/PlayersSidebarNav';
import {ServicesSidebarNav} from '@/components/system/sidebar/ServicesSidebarNav';
import {TerminalSidebarNav} from '@/components/system/sidebar/TerminalSidebarNav';
import {SettingsSidebarNav} from '@/components/system/sidebar/SettingsSidebarNav';
import {UserInfo} from '@/components/system/sidebar/UserInfo.tsx';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import {Link} from 'wouter';
import {useEffect, useState} from "react";
import {systemInformationApi} from "@/lib/api";
import {TemplatesSidebarNav} from "@/components/system/sidebar/TemplatesSidebarNav.tsx";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const [version, setVersion] = useState<string>('3.0.0-pre-1');

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const result = await systemInformationApi.getSystemVersion();
                if (result.success && result.data) {
                    setVersion(result.data.version);
                }
            } catch (error) {
            }
        };

        fetchVersion();
    }, []);

    return (
        <Sidebar collapsible="icon" {...props} variant="inset">
            <SidebarHeader>
                <Link href="/">
                    <SidebarMenuItem className="border-b pb-2 list-none">
                        <SidebarMenuButton
                            tooltip={'PoloCloud'}
                            className="flex flex-row items-center space-x-0 gap-0 h-12 group-data-[collapsible=icon]:!p-0 p-0"
                            style={{padding: '0 !!important'}}
                        >
                            <img
                                src={logo}
                                alt="PoloCloud"
                                className="h-8 w-8 min-w-8 object-contain"
                            />
                            <div className="flex flex-col -space-y-2">
                                <p className="text-lg font-semibold">PoloCloud</p>
                                <p className="text-[0.6rem] text-muted-foreground text-nowrap">
                                    The simplest cloudsystem.
                                </p>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Cloud</SidebarGroupLabel>
                    <GroupsSidebarNav/>
                    <ServicesSidebarNav/>
                    <TemplatesSidebarNav/>
                    <PlayersSidebarNav/>
                    <TerminalSidebarNav/>
                </SidebarGroup>

                <div className="px-3 py-2">
                    <div
                        className="h-px bg-gradient-to-r from-transparent via-sidebar-foreground/20 to-transparent"></div>
                </div>

                <SettingsSidebarNav/>
            </SidebarContent>

            <SidebarFooter>
                <div className="px-3 py-2 text-center -mt-6">
                    <span className="text-[0.6rem] text-muted-foreground font-medium">
                        v{version}
                    </span>
                </div>

                <div className="flex flex-col list-none">
                    <UserInfo/>
                </div>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
