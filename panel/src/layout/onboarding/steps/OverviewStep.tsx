import {Button} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {SetupStepProps} from '@/lib/steps/SetupStepProps';
import {OnboardingData} from '../OnboardingLayout';
import {CheckCircle, Server, Shield, ArrowRight} from 'lucide-react';
import {motion} from 'framer-motion';

export const OverviewStep: React.FC<SetupStepProps<OnboardingData>> = ({
                                                                           object,
                                                                           onNext,
                                                                           disabled,
                                                                       }) => {
    const handleFinish = () => {
        onNext();
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="text-center mb-8"
            >
                <motion.div
                    className="mx-auto mb-4 size-16 rounded-full bg-[oklch(75.54% .1534 231.639,0.2)] flex items-center justify-center shadow-[0_0_20px_rgba(75,54%,15.34%,0.6)] border-2 border-[oklch(75.54% .1534 231.639)]"
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{duration: 0.5, delay: 0.2}}
                >
                    <CheckCircle className="size-8 text-[oklch(75.54% .1534 231.639)]"/>
                </motion.div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Setup Complete!</h1>
                <p className="text-lg text-muted-foreground">
                    Your PoloCloud instance is ready to launch
                </p>
            </motion.div>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.3}}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Configuration Summary
                        </CardTitle>
                        <CardDescription>
                            Here's what we've configured for your PoloCloud instance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <motion.div
                            className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-300 hover:shadow-md"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5, delay: 0.4}}
                        >
                            <div
                                className="size-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                <Server className="size-6 text-blue-500"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-2 text-lg">Backend Connection</h4>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    Successfully connected to your PoloCloud backend
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span
                                        className="text-sm font-mono text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                        {object.backendUrl || 'Not configured'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20 hover:border-green-500/30 transition-all duration-300 hover:shadow-md"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5, delay: 0.5}}
                        >
                            <div
                                className="size-12 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                                <Shield className="size-6 text-green-500"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-2 text-lg">Admin Account</h4>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    Administrator account created successfully
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span
                                        className="text-sm font-mono text-green-600 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                        Username: {object.username || 'Not configured'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 hover:shadow-md"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5, delay: 0.6}}
                        >
                            <div
                                className="size-12 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                                <CheckCircle className="size-6 text-purple-500"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-2 text-lg">System Status</h4>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    All systems are ready and operational
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span
                                        className="text-sm font-mono text-purple-600 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                                        Ready to launch
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.8}}
                className="flex justify-center"
            >
                <Button
                    onClick={handleFinish}
                    disabled={disabled}
                    size="lg"
                    className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <span>Launch PoloCloud Dashboard</span>
                    <ArrowRight className="size-5 ml-2"/>
                </Button>
            </motion.div>
        </div>
    );
};
