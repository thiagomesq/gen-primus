export interface Route {
    name: string;
    href: string;
    auth: boolean;
    icon: React.ElementType | null;
}