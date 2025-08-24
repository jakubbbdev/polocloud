'use client';

import {Boxes, ChevronRight} from 'lucide-react';
import {useEffect, useState} from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '@/components/ui/sidebar';
import {Link} from 'wouter';
import {groupApi} from '@/lib/api';
import {getPlatformImage} from '@/lib/utils/platformUtils';

interface ApiGroup {
    name: string;
    minMemory: number;
    maxMemory: number;
    minOnlineService: number;
    maxOnlineService: number;
    platform: {
        name: string;
        version: string;
    };
    percentageToStartNewService: number;
    information: {
        createdAt: number;
    };
    templates: string[];
    properties: {
        fallback?: boolean;
        [key: string]: any;
    };
}

export function GroupsSidebarNav() {
    const [groups, setGroups] = useState<ApiGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const result = await groupApi.getGroups();

                if (result.success && result.data) {
                    if (Array.isArray(result.data)) {
                        setGroups(result.data);
                    } else if (result.data && typeof result.data === 'object' && 'data' in result.data) {
                        const nestedData = (result.data as any).data;
                        if (Array.isArray(nestedData)) {
                            setGroups(nestedData);
                        } else {
                            setGroups([]);
                        }
                    } else {
                        setGroups([]);
                    }
                } else {
                    setGroups([]);
                }
            } catch (error) {
                setGroups([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const safeGroups = Array.isArray(groups) ? groups : [];

    return (
        <SidebarMenu>
            <Collapsible defaultOpen asChild className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <Link href='/groups'>
                            <SidebarMenuButton tooltip={'Groups'}>
                                <Boxes/>
                                <span>Groups</span>
                                <ChevronRight
                                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                            </SidebarMenuButton>
                        </Link>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {isLoading ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    Loading groups...
                                </div>
                            ) : safeGroups.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No groups found
                                </div>
                            ) : (
                                safeGroups.map((group) => {
                                    if (!group || typeof group !== 'object' || !group.name || !group.platform) {
                                        return null;
                                    }

                                    const platformIcon = getPlatformImage(group.platform.name);

                                    return (
                                        <Link key={group.name} href={`/groups/${group.name}`}>
                                            <SidebarMenuButton tooltip={`${group.name} (${group.platform.name})`}>
                                                <img
                                                    src={platformIcon}
                                                    alt={group.platform.name}
                                                    className="w-4 h-4"
                                                />
                                                <span className="truncate">{group.name}</span>
                                            </SidebarMenuButton>
                                        </Link>
                                    );
                                }).filter(Boolean)
                            )}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    );
}
