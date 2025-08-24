import useBreadcrumbStore, {
    BreadcrumbItem as BreadcrumbAppItem,
} from '@/components/system/breadcrumb/hook/useBreadcrumbStore';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Fragment} from 'react/jsx-runtime';
import {Link, useRoute} from 'wouter';
import {AnimatePresence, motion} from 'framer-motion';
import {Home, Users, Shield, Settings, Gauge, Boxes, Server, User} from 'lucide-react';

export const AppBreadcrumb = () => {
    const {breadCrumbItems} = useBreadcrumbStore();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <AnimatePresence>
                    {breadCrumbItems.map((item, index) => (
                        <Fragment key={`${item.href}-${index}`}>
                            <motion.div
                                initial={{opacity: 0, x: -20, scale: 0.9}}
                                animate={{opacity: 1, x: 0, scale: 1}}
                                exit={{opacity: 0, x: 10, scale: 0.95}}
                                transition={{
                                    duration: 0.15,
                                    ease: "easeInOut"
                                }}
                                layout
                            >
                                <BreadcrumbItemComponent item={item}/>
                            </motion.div>
                            {index < breadCrumbItems.length - 1 && (
                                <motion.div
                                    initial={{opacity: 0, scale: 0.8}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.9}}
                                    transition={{
                                        duration: 0.1,
                                        ease: "easeInOut"
                                    }}
                                    layout
                                >
                                    <BreadcrumbSeparator/>
                                </motion.div>
                            )}
                        </Fragment>
                    ))}
                </AnimatePresence>
            </BreadcrumbList>
        </Breadcrumb>
    );
};

interface BreadcrumbItemProps {
    item: BreadcrumbAppItem;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({item}) => {
    const [match] = useRoute(item.activeHref);

    const getIcon = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('dashboard') || lowerLabel.includes('home')) return <Gauge className="w-4 h-4"/>;
        if (lowerLabel.includes('users')) return <Users className="w-4 h-4"/>;
        if (lowerLabel.includes('roles')) return <Shield className="w-4 h-4"/>;
        if (lowerLabel.includes('groups')) return <Boxes className="w-4 h-4"/>;
        if (lowerLabel.includes('services')) return <Server className="w-4 h-4"/>;
        if (lowerLabel.includes('players')) return <Users className="w-4 h-4"/>;
        if (lowerLabel.includes('terminal')) return <Server className="w-4 h-4"/>;
        if (lowerLabel.includes('team')) return <Shield className="w-4 h-4"/>;
        if (lowerLabel.includes('new group')) return <Boxes className="w-4 h-4"/>;
        if (lowerLabel.includes('settings')) return <Settings className="w-4 h-4"/>;
        if (lowerLabel.length < 20 && !lowerLabel.includes(' ') && !lowerLabel.includes('/')) return <User
            className="w-4 h-4"/>;
        return <Home className="w-4 h-4"/>;
    };

    return (
        <BreadcrumbItem className="block">
            {match ? (
                <BreadcrumbPage>
                    {getIcon(item.label)}
                    {item.label}
                </BreadcrumbPage>
            ) : (
                <Link href={item.href}>
                    <BreadcrumbLink>
                        {getIcon(item.label)}
                        {item.label}
                    </BreadcrumbLink>
                </Link>
            )}
        </BreadcrumbItem>
    );
};

export default AppBreadcrumb;
