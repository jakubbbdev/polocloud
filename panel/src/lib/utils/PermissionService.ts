export interface CurrentUser {
    id: string;
    username: string;
    role: number;
}

export class PermissionService {
    private currentUser: CurrentUser | null = null;
    private userPermissions: string[] = [];
    private isLoadingUser: boolean = true;

    constructor() {}

    setUserData(user: CurrentUser | null, permissions: string[]) {
        this.currentUser = user;
        this.userPermissions = permissions;
    }


    setLoadingStatus(loading: boolean) {
        this.isLoadingUser = loading;
    }

    hasPermission(permission: string): boolean {
        if (this.currentUser?.role === -1) {
            return true;
        }

        return this.userPermissions.includes(permission);
    }


    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    }

    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }

    getCurrentUser(): CurrentUser | null {
        return this.currentUser;
    }

    getUserPermissions(): string[] {
        return this.userPermissions;
    }

    isLoading(): boolean {
        return this.isLoadingUser;
    }

    isAdmin(): boolean {
        return this.currentUser?.role === -1;
    }
}

export const permissionService = new PermissionService();
