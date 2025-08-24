export const PLATFORM_IMAGE_MAP: Record<string, string> = {
    'paper': '/paper.svg',
    'purpur': '/purpur.svg',
    'fabric': '/fabric.png',
    'folia': '/folia.svg',
    'nukkit': '/nukkit.png',
    'pandaspigot': '/pandaspigot.png',
    'limbo': '/limbo.jpg',
    'pumpkin': '/pumkin.svg',
    'leaf': '/leaf.svg',

    'velocity': '/velocity.svg',
    'waterdog': 'waterdog.png',
    'waterfall': '/waterfall.svg',
    'bungeecord': '/bungeecord.png',
    'gate': '/gate.png',
};

export const getPlatformImage = (platformName: string): string => {
    const normalizedName = platformName.toLowerCase();
    return PLATFORM_IMAGE_MAP[normalizedName] || '/placeholder.png';
};

export const getPlatformDisplayName = (platformName: string): string => {
    return platformName.charAt(0).toUpperCase() + platformName.slice(1);
};

export const getPlatformTypeDisplayName = (type: 'SERVER' | 'PROXY'): string => {
    return type === 'SERVER' ? 'Server' : 'Proxy';
};

export const getPlatformTypeColor = (type: 'SERVER' | 'PROXY'): string => {
    return type === 'SERVER'
        ? 'text-blue-600 bg-blue-500/10 border-blue-500/20'
        : 'text-purple-600 bg-purple-500/10 border-purple-500/20';
};

export const checkPlatformImageExists = async (platformName: string): Promise<boolean> => {
    try {
        const imagePath = getPlatformImage(platformName);
        const response = await fetch(imagePath, {method: 'HEAD'});
        return response.ok;
    } catch {
        return false;
    }
};

export const getAvailablePlatformNames = (): string[] => {
    return Object.keys(PLATFORM_IMAGE_MAP);
};

