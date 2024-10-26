export interface RouteNode {
    path: string;
    params: string[];
    children: Record<string, RouteNode>;
    groups?: string[];
    hasPage?: boolean;
}

export interface GeneratorOptions {
    output: string;
    filename: string;
    prettierConfig?: string;
    debug?: boolean;
}

export type RouteConfig = {
    [key: string]: {
        path: string;
        params?: Record<string, string>;
        query?: Record<string, string>;
    };
};