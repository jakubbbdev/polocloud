import {useBreadcrumbPage} from '@/components/system/breadcrumb/hook/useBreadcrumbPage';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import {useState, useEffect} from 'react';
import {useLocation} from 'wouter';
import {playerApi} from '@/lib/api/clients/player/PlayerApiClient.ts';
import {Player} from '@/lib/api/types';
import {ArrowLeft, User, Server} from 'lucide-react';

export default function PlayerDetailPage() {
    const [, setLocation] = useLocation();
    const [player, setPlayer] = useState<Player | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentLocation = useLocation()[0];
    const playerName = currentLocation.split('/players/')[1];

    
    

    useEffect(() => {
        const fetchPlayer = async () => {
            if (!playerName) {
                setError('Player name not found');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                const result = await playerApi.getPlayer(playerName);
                

                if (result.success && result.data) {
                    setPlayer(result.data);
                } else {
                    setError(result.message || 'Failed to fetch player');
                }
            } catch (error) {
                
                setError('Failed to fetch player');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayer();
    }, [playerName]);

    useBreadcrumbPage({
        items: [
            {label: 'Players', href: '/players', activeHref: '/players'},
            {label: playerName || 'Player', href: `/players/${playerName}`, activeHref: `/players/${playerName}`}
        ]
    });

    const handleBackClick = () => {
        setLocation('/players');
    };

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {opacity: 1, y: 0}
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col p-6 gap-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading player...</div>
                </div>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className="flex flex-1 flex-col p-6 gap-6">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <User className="w-16 h-16 text-muted-foreground mb-4"/>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Player not found</h3>
                    <p className="text-muted-foreground mb-4">
                        {error || 'The requested player could not be found'}
                    </p>
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back to Players
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="flex flex-1 flex-col p-6 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <Button onClick={handleBackClick} variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{player.name}</h1>
                    <p className="text-muted-foreground">Player Details</p>
                </div>
                <Badge className="text-sm bg-green-500/10 text-green-500 border-green-500/20">
                    Online
                </Badge>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5"/>
                            Player Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <img
                                    src={`https://mineskin.eu/helm/${player.name}/80.png`}
                                    alt={`${player.name}'s Minecraft skin`}
                                    className="h-20 w-20 rounded-lg border-2 border-border/50"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://mineskin.eu/helm/HttpMarco/80.png';
                                    }}
                                />
                                <div
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Username:</span>
                                <span className="text-sm text-foreground font-mono">{player.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">UUID:</span>
                                <span className="text-sm text-foreground font-mono">{player.uuid}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5"/>
                            Current Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {player.currentServiceName ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Service:</span>
                                    <Badge variant="outline" className="text-sm">
                                        {player.currentServiceName}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                    <Badge variant="secondary" className="text-sm">
                                        Connected
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-3"/>
                                <p className="text-muted-foreground">Not connected to any service</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>


        </motion.div>
    );
}
