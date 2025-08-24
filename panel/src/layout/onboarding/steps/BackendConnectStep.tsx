import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {SetupStepProps} from '@/lib/steps/SetupStepProps';
import {OnboardingData} from '../OnboardingLayout';
import {useState} from 'react';
import {toast} from 'sonner';
import {Wifi, CheckCircle, AlertCircle, Zap, Globe} from 'lucide-react';
import {onboardingApi} from '@/lib/api';
import {motion} from 'framer-motion';

export const BackendConnectStep: React.FC<SetupStepProps<OnboardingData>> = ({
                                                                                 object,
                                                                                 setObject,
                                                                                 onNext,
                                                                                 disabled,
                                                                             }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!object.backendUrl.trim()) {
            toast.error('Please enter a backend URL');
            return;
        }

        setIsConnecting(true);
        setConnectionError(null);

        try {
            const isConnected = await onboardingApi.testConnection();

            if (isConnected) {

                setIsConnected(true);

                toast.success('Connection established successfully!');

                setTimeout(() => {
                    onNext();
                }, 1000);
            } else {
                throw new Error('Connection test failed');
            }

        } catch (error) {

            setConnectionError(error instanceof Error ? error.message : 'Connection failed');
            toast.error('Connection failed. Please check your backend URL and try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleReset = () => {
        setIsConnected(false);
        setConnectionError(null);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <Card
                    className="bg-gradient-to-br from-card/80 via-card/60 to-card/80 border border-border/40 shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl text-foreground">Backend Connection</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Connect to your PoloCloud backend to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="backendUrl" className="text-base font-medium">Backend URL</Label>
                            <div className="flex space-x-3">
                                <div className="relative flex-1">
                                    <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"/>
                                    <Input
                                        id="backendUrl"
                                        placeholder='127.0.0.1:8080'
                                        value={object.backendUrl}
                                        onChange={(e) => setObject({...object, backendUrl: e.target.value})}
                                        disabled={disabled || isConnected}
                                        className="pl-10 h-12 text-base border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.4}}
                        >
                            {isConnected ? (
                                <div
                                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl">
                                    <motion.div
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        transition={{duration: 0.3, delay: 0.2}}
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500"/>
                                    </motion.div>
                                    <div>
                                        <span className="text-green-400 font-semibold text-lg">
                                            Connection established successfully!
                                        </span>
                                        <p className="text-green-300 text-sm mt-1">
                                            Your backend is ready and accessible
                                        </p>
                                    </div>
                                </div>
                            ) : connectionError ? (
                                <div
                                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-red-500"/>
                                    <div className="flex-1">
                                        <span className="text-red-400 font-semibold text-lg">Connection failed</span>
                                        <p className="text-red-300 text-sm mt-1">{connectionError}</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[oklch(75.54% .1534 231.639,0.1)] to-[oklch(75.54% .1534 231.639,0.05)] border border-[oklch(75.54% .1534 231.639,0.3)] rounded-xl">
                                    <Wifi className="h-6 w-6 text-[oklch(75.54% .1534 231.639)]"/>
                                    <div>
                                        <span className="text-[oklch(75.54% .1534 231.639)] font-semibold text-lg">
                                            Ready to connect
                                        </span>
                                        <p className="text-[oklch(75.54% .1534 231.639,0.8)] text-sm mt-1">
                                            Enter your backend URL and click connect
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <div className="pt-4 flex space-x-3">
                            {isConnected ? (
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="flex-1 h-12 border-border/50 hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-500"
                                    disabled={disabled}
                                >
                                    Reset Connection
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleConnect}
                                    variant="default"
                                    disabled={disabled || isConnecting || !object.backendUrl.trim()}
                                    style={{
                                        backgroundColor: 'oklch(75.54% .1534 231.639)',
                                        color: 'white'
                                    }}
                                    className="flex-1 h-12 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {isConnecting ? (
                                        <>
                                            <motion.div
                                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"
                                                animate={{rotate: 360}}
                                                transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                            />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5 mr-2"/>
                                            Connect to Backend
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
