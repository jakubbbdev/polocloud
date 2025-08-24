'use client';

import {useEffect, useState} from 'react';
import {Link} from 'wouter';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub} from '@/components/ui/sidebar';
import {Server, Loader2, Play, Square, ChevronRight} from 'lucide-react';
import {servicesApi} from '@/lib/api';

interface ApiService {
    name: string;
    state: string;
    type: string;
    groupName: string;
    hostname: string;
    port: number;
    templates: string[];
    information: {
        createdAt: number;
    };
    properties: {
        fallback?: string;
        [key: string]: any;
    };
    minMemory: number;
    maxMemory: number;
    playerCount: number;
    maxPlayerCount: number;
    memoryUsage: number;
    cpuUsage: number;
    motd: string;
}

export function ServicesSidebarNav() {
    const [services, setServices] = useState<ApiService[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchServices = async () => {
        try {
            const result = await servicesApi.getServices();

            if (result.success && result.data) {
                setServices(result.data as ApiService[]);

            } else {

            }
        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const getStatusIcon = (state: string) => {
        switch (state) {
            case 'ONLINE':
                return <Play className="h-4 w-4 text-green-500"/>;
            case 'OFFLINE':
                return <Square className="h-4 w-4 text-red-500"/>;
            case 'STARTING':
                return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin"/>;
            case 'STOPPING':
                return <Loader2 className="h-4 w-4 text-orange-500 animate-spin"/>;
            default:
                return <Square className="h-4 w-4 text-gray-500"/>;
        }
    };

    return (
        <SidebarMenu>
            <Collapsible defaultOpen asChild className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <Link href="/services">
                            <SidebarMenuButton tooltip={'Services'}>
                                <Server className="h-4 w-4"/>
                                <span>Services</span>
                                <ChevronRight
                                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                            </SidebarMenuButton>
                        </Link>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {isLoading ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    Loading services...
                                </div>
                            ) : services.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No services found
                                </div>
                            ) : (
                                services.map((service) => {
                                    const statusIcon = getStatusIcon(service.state);

                                    return (
                                        <SidebarMenuButton key={service.name} tooltip={service.name}>
                                            {statusIcon}
                                            <span className="truncate">{service.name}</span>
                                        </SidebarMenuButton>
                                    );
                                })
                            )}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    );
}
