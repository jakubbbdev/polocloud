import {AppSidebar} from '@/components/app-sidebar';
import AppBreadcrumb from '@/components/system/breadcrumb/AppBreadcrumb';
import LoadingSpinner from '@/components/system/LoadingSpinner';

import {Separator} from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {Toaster} from '@/components/ui/sonner';
import {lazy, Suspense, useState, useEffect} from 'react';
import {Route, Switch} from 'wouter';
import {Badge} from '@/components/ui/badge';
import {Wifi, WifiOff, Clock, Activity} from 'lucide-react';
import {systemInformationApi} from '@/lib/api';

import {useSpring, animated} from '@react-spring/web';
import {useBackendWebSocket} from '@/lib/websocket/badge/useBackendWebSocket.ts';

const Dashboard = lazy(() => import('@/layout/dashboard/DashboardRoute'));
const Onboarding = lazy(() => import('@/layout/onboarding/OnboardingLayout'));
const Login = lazy(() => import('@/layout/auth/LoginPage'));
const RolePage = lazy(() => import('@/layout/team/RolePage'));
const UsersPage = lazy(() => import('@/layout/users/UsersPage'));
const GroupsPage = lazy(() => import('@/layout/groups/GroupsPage'));
const GroupOverviewPage = lazy(() => import('@/layout/groups/GroupOverviewPage'));
const CreateGroupLayout = lazy(() => import('@/layout/groups/create/CreateGroupLayout'));
const EditGroupPage = lazy(() => import('@/layout/groups/edit/EditGroupPage'));
const PlayersPage = lazy(() => import('@/layout/players/PlayersPage'));
const PlayerDetailPage = lazy(() => import('@/layout/players/PlayerDetailPage'));
const ServicesPage = lazy(() => import('@/layout/services/ServicesPage'));
const ServiceScreenPage = lazy(() => import('@/layout/services/ServiceScreenPage'));
const LogsPage = lazy(() => import('./layout/logs/LogsPage'));
const TemplatesPage = lazy(() => import('@/layout/templates/TemplatesPage'));

function App() {
    const [_isOnline, setIsOnline] = useState(navigator.onLine);
    const [runtime, setRuntime] = useState<string>('--');
    const [uptime, setUptime] = useState<string>('--');
    const [isLoadingSystemInfo, setIsLoadingSystemInfo] = useState(false);

    const {connected: isBackendConnected, connecting: isWebSocketConnecting} = useBackendWebSocket({
        autoConnect: !window.location.pathname.includes('/login') && !window.location.pathname.includes('/onboarding'),
        onConnect: () => console.log('Backend WebSocket connected'),
        onDisconnect: () => console.log('Backend WebSocket disconnected'),
        onError: (error) => console.error('Backend WebSocket error:', error)
    });

    const connectionAnimation = useSpring({
        scale: isBackendConnected ? 1 : 0.95,
        opacity: isBackendConnected ? 1 : 0.8,
        config: {
            tension: 200,
            friction: 25,
            mass: 1.2,
            clamp: true
        }
    });

    const heartbeatAnimation = useSpring({
        from: {scale: 1},
        to: async (next) => {
            while (isBackendConnected) {
                await next({scale: 1.02});
                await next({scale: 1});
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        },
        config: {
            tension: 300,
            friction: 20,
            mass: 1.0,
            clamp: true
        }
    });


    useEffect(() => {
        const loadSystemInfo = async () => {
            if (isLoadingSystemInfo) return;

            try {
                setIsLoadingSystemInfo(true);
                const result = await systemInformationApi.getSystemInformation();

                if (result.success && result.data) {
                    setRuntime(result.data.runtime);

                    const uptimeMs = result.data.uptime;
                    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

                    if (days > 0) {
                        setUptime(`${days}d ${hours}h`);
                    } else if (hours > 0) {
                        setUptime(`${hours}h ${minutes}m`);
                    } else {
                        setUptime(`${minutes}m`);
                    }

                }
            } catch (error) {
            } finally {
                setIsLoadingSystemInfo(false);
            }
        };

        loadSystemInfo();

        const interval = setInterval(loadSystemInfo, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return (
        <div className="min-h-screen bg-background w-full flex flex-col relative">
            <Suspense
                fallback={
                    <div className="flex flex-1 items-center justify-center">
                        <LoadingSpinner/>
                    </div>
                }
            >
                <Switch>
                    <Route path="/onboarding" component={Onboarding}/>
                    <Route path="/login" component={Login}/>
                    <Route path="*">
                        <SidebarProvider>
                            <AppSidebar/>
                            <SidebarInset>
                                <header
                                    className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 top-0 sticky z-30 bg-sidebar border-sidebar-border border-b rounded-t-xl shadow-lg">
                                    <div className="flex items-center gap-2 px-4">
                                        <SidebarTrigger
                                            className="-ml-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"/>
                                        <Separator orientation="vertical" className="mr-2 h-4 bg-sidebar-border"/>
                                        <AppBreadcrumb/>
                                    </div>
                                    <div className="flex items-center px-4">
                                        <Badge
                                            variant="outline"
                                            className="border-blue-500/50 text-blue-500 bg-blue-500/10"
                                        >
                                            <Clock className="h-3 w-3 mr-1"/>
                                            <span className="text-xs font-medium">Runtime: {runtime}</span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="ml-2 border-purple-500/50 text-purple-500 bg-purple-500/10"
                                        >
                                            <Activity className="h-3 w-3 mr-1"/>
                                            <span className="text-xs font-medium">Uptime: {uptime}</span>
                                        </Badge>
                                        <animated.div style={connectionAnimation}>
                                            <Badge
                                                variant="outline"
                                                className={`ml-2 transition-all duration-500 ease-out ${
                                                    isBackendConnected
                                                        ? 'border-green-500/50 text-green-500 bg-green-500/10'
                                                        : 'border-red-500/50 text-red-500 bg-red-500/10'
                                                }`}
                                            >
                                                {isWebSocketConnecting ? (
                                                    <div
                                                        className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                                                ) : isBackendConnected ? (
                                                    <animated.div style={heartbeatAnimation}>
                                                        <Wifi className="h-3 w-3 text-green-500"/>
                                                    </animated.div>
                                                ) : (
                                                    <WifiOff className="h-3 w-3 text-red-500"/>
                                                )}
                                                <span className="ml-1 text-xs font-medium">
                                                    {isWebSocketConnecting ? 'Connecting...' : (isBackendConnected ? 'Connected' : 'Disconnected')}
                                                </span>
                                            </Badge>
                                        </animated.div>

                                    </div>
                                </header>
                                <div className="flex flex-1 flex-col gap-4 pt-0">
                                    <Switch>
                                        <Route path="/" component={Dashboard}/>
                                        <Route path="/home" component={Dashboard}/>
                                        <Route path="/roles" component={RolePage}/>
                                        <Route path="/users" component={UsersPage}/>
                                        <Route path="/groups" component={GroupsPage}/>
                                        <Route path="/groups/create" component={CreateGroupLayout}/>
                                        <Route path="/groups/:groupName" component={GroupOverviewPage}/>
                                        <Route path="/groups/:groupName/edit" component={EditGroupPage}/>
                                        <Route path="/players" component={PlayersPage}/>
                                        <Route path="/players/:playerName" component={PlayerDetailPage}/>
                                        <Route path="/services" component={ServicesPage}/>
                                        <Route path="/service/:serviceName/screen" component={ServiceScreenPage}/>
                                        <Route path="/terminal" component={LogsPage}/>
                                        <Route path="/templates" component={TemplatesPage}/>

                                    </Switch>
                                </div>
                            </SidebarInset>
                        </SidebarProvider>
                    </Route>
                </Switch>
            </Suspense>
            <Toaster/>
        </div>
    );
}

export default App;
