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
import {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {User, Lock, Eye, EyeOff, Sparkles, AlertCircle} from 'lucide-react';
import {onboardingApi} from '@/lib/api';
import {motion} from 'framer-motion';

export const AdminAccountStep: React.FC<SetupStepProps<OnboardingData>> = ({
                                                                               object,
                                                                               setObject,
                                                                               onNext,
                                                                               disabled,
                                                                           }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const validateForm = () => {
        const isValidForm =
            object.username.trim().length >= 3 &&
            object.password.length >= 8 &&
            object.password === object.confirmPassword &&
            object.password.trim() !== '';

        setIsValid(isValidForm);
        return isValidForm;
    };

    useEffect(() => {
        validateForm();
    }, [object.username, object.password, object.confirmPassword]);

    const handleInputChange = (field: keyof OnboardingData, value: string) => {
        setObject({...object, [field]: value});
    };

    const handleNext = async () => {
        if (!validateForm()) {
            toast.error('Please check your inputs');
            return;
        }

        setIsCreating(true);

        try {

            const result = await onboardingApi.createAdminUser(object.username, object.password);

            if (result.success) {

                localStorage.setItem('adminUsername', object.username);
                localStorage.setItem('adminPassword', object.password);

                toast.success(result.message);

                onNext();
            } else {

                toast.error(result.message);
            }

        } catch (error) {

            toast.error('Failed to create admin user. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return {strength: 0, color: 'bg-muted', text: ''};
        if (password.length < 8) return {strength: 1, color: 'bg-red-500', text: 'Weak'};
        if (password.length < 12) return {strength: 2, color: 'bg-yellow-500', text: 'Medium'};
        return {strength: 3, color: 'bg-green-500', text: 'Strong'};
    };

    const passwordStrength = getPasswordStrength(object.password);

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
                        <CardTitle className="text-2xl text-foreground">Create Admin Account</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Set up your first administrator account for PoloCloud
                        </CardDescription>

                        <div className="mt-4 pt-4 border-t border-border/30">
                            <p className="text-sm text-muted-foreground mb-2">Requirements:</p>
                            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <div className="size-1.5 bg-green-500 rounded-full"></div>
                                    Username: min. 3 characters
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="size-1.5 bg-green-500 rounded-full"></div>
                                    Password: min. 8 characters
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="size-1.5 bg-green-500 rounded-full"></div>
                                    Passwords must match
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <motion.div
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.4, delay: 0.1}}
                            className="space-y-3"
                        >
                            <Label htmlFor="username" className="text-base font-medium">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"/>
                                <Input
                                    id="username"
                                    placeholder="admin"
                                    value={object.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    disabled={disabled}
                                    className="pl-10 h-12 text-base border-border/50 focus:border-green-500/50 focus:ring-green-500/20"
                                />
                            </div>
                            {object.username.trim().length > 0 && object.username.trim().length < 3 && (
                                <motion.p
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="text-sm text-red-400 flex items-center gap-2"
                                >
                                    <AlertCircle className="size-4"/>
                                    Username must be at least 3 characters long
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.4, delay: 0.2}}
                            className="space-y-3"
                        >
                            <Label htmlFor="password" className="text-base font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"/>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={object.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    disabled={disabled}
                                    className="pl-10 pr-10 h-12 text-base border-border/50 focus:border-green-500/50 focus:ring-green-500/20"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={disabled}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </Button>
                            </div>

                            {object.password.length > 0 && (
                                <motion.div
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="space-y-2"
                                >
                                    <div className="flex space-x-1">
                                        {[1, 2, 3].map((level) => (
                                            <motion.div
                                                key={level}
                                                className={`h-2 flex-1 rounded transition-all ${
                                                    level <= passwordStrength.strength ? passwordStrength.color : 'bg-muted'
                                                }`}
                                                initial={{scaleX: 0}}
                                                animate={{scaleX: 1}}
                                                transition={{duration: 0.3, delay: level * 0.1}}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-sm font-medium ${
                                        passwordStrength.strength === 1 ? 'text-red-400' :
                                            passwordStrength.strength === 2 ? 'text-yellow-400' :
                                                'text-green-400'
                                    }`}>
                                        {passwordStrength.text}
                                    </p>
                                </motion.div>
                            )}

                            {object.password.length > 0 && object.password.length < 8 && (
                                <motion.p
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="text-sm text-red-400 flex items-center gap-2"
                                >
                                    <AlertCircle className="size-4"/>
                                    Password must be at least 8 characters long
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.4, delay: 0.3}}
                            className="space-y-3"
                        >
                            <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"/>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={object.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    disabled={disabled}
                                    className="pl-10 pr-10 h-12 text-base border-border/50 focus:border-green-500/50 focus:ring-green-500/20"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={disabled}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </Button>
                            </div>

                            {object.confirmPassword.length > 0 && object.password !== object.confirmPassword && (
                                <motion.p
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    className="text-sm text-red-400 flex items-center gap-2"
                                >
                                    <AlertCircle className="size-4"/>
                                    Passwords do not match
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.4}}
                            className="pt-4"
                        >
                            <Button
                                onClick={handleNext}
                                disabled={disabled || !isValid || isCreating}
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isCreating ? (
                                    <>
                                        <motion.div
                                            className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"
                                            animate={{rotate: 360}}
                                            transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                                        />
                                        Creating Admin Account...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5 mr-2"/>
                                        Create Admin Account
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
