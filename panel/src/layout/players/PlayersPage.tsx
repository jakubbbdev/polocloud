import { useBreadcrumbPage } from '@/components/system/breadcrumb/hook/useBreadcrumbPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { playerApi } from '@/lib/api/clients/player/PlayerApiClient';
import { Player } from '@/lib/api/types';
import { Search, User, Server, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function PlayersPage() {
    useBreadcrumbPage({
        items: [
            { label: 'Players', href: '/players', activeHref: '/players' }
        ]
    });
    const [, setLocation] = useLocation();

    const [players, setPlayers] = useState<Player[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPlayers();
    }, [currentPage, pageSize]);

    const fetchPlayers = async () => {
        try {
            setIsLoading(true);

            const result = await playerApi.getPlayers({ page: currentPage, size: pageSize });

            if (result.success && result.data) {
                const responseData = result.data;

                if (responseData.data && Array.isArray(responseData.data)) {
                    setPlayers(responseData.data);
                    setFilteredPlayers(responseData.data);
                    setTotalPlayers(responseData.total || 0);
                    setTotalPages(responseData.totalPages || 1);

                } else {
                    setPlayers([]);
                    setFilteredPlayers([]);
                    setTotalPlayers(0);
                    setTotalPages(1);
                }
            } else {

                setPlayers([]);
                setFilteredPlayers([]);
                setTotalPlayers(0);
                setTotalPages(1);
            }
        } catch (error) {
            setPlayers([]);
            setFilteredPlayers([]);
            setTotalPlayers(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPlayers(players);
        } else {
            const filtered = players.filter(player =>
                player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                player.currentServiceName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPlayers(filtered);
        }
    }, [searchTerm, players]);

    const handlePlayerClick = (playerName: string) => {
        setLocation(`/players/${playerName}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSearchTerm('');
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col p-6 gap-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading players...</div>
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
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">Players</h1>
                    <Badge variant="secondary" className="text-sm">
                        {totalPlayers} player{totalPlayers !== 1 ? 's' : ''}
                    </Badge>
                </div>
                <p className="text-muted-foreground">
                    Manage and view all players across your services
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search players or services..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </motion.div>

            {!filteredPlayers || filteredPlayers.length === 0 ? (
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center h-64 text-center">
                    <User className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No players found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search terms' : 'No players are currently online'}
                    </p>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filteredPlayers && filteredPlayers.map((player) => (
                            <motion.div
                                key={player.uuid}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border"
                                    onClick={() => handlePlayerClick(player.name)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img
                                                    src={`https://mineskin.eu/helm/${player.name}/40.png`}
                                                    alt={`${player.name}'s Minecraft skin`}
                                                    className="h-10 w-10 rounded-lg border border-border/50"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://mineskin.eu/helm/HttpMarco/40.png';
                                                    }}
                                                />
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-background animate-pulse"></div>
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-foreground">
                                                    {player.name}
                                                </CardTitle>
                                            </div>
                                            <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                                Online
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Server className="w-4 h-4" />
                                                <span className="truncate">
                                                    {player.currentServiceName || 'No service'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono">
                                                {player.uuid}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center justify-between px-2 py-4 border-t border-border/50">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Showing {filteredPlayers.length > 0 ? 1 : 0} to {filteredPlayers.length} of {totalPlayers} player(s).
                        </div>
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
