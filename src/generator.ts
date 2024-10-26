// src/generator.ts
import type { RouteNode, RouteConfig } from './types.js';
import { generateRouteKey, normalizePath } from './utils.js';

function extractParamsFromPath(path: string): string[] {
    const params: string[] = [];
    const segments = path.split('/');

    segments.forEach(segment => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
            let param = segment.slice(1, -1);
            if (param.startsWith('...')) {
                params.push(param);
            } else {
                params.push(param);
            }
        }
    });

    return params;
}

function generateRoutesType(node: RouteNode, prefix = '', visitedSegments = new Set<string>(), debug = false): string {
    let output = '';

    // Handle path construction to avoid segment duplication
    let currentPath: string;
    if (prefix) {
        const prefixSegments = prefix.split('/');
        const nodeSegments = node.path.split('/');

        // Keep track of segments we've seen globally and in this path
        const seenInCurrentPath = new Set<string>();

        // Combine segments without duplicates
        const finalSegments = [...prefixSegments, ...nodeSegments]
            .filter(segment => {
                if (!segment) return false;

                // For parameters, only keep first occurrence
                if (segment.startsWith('[')) {
                    if (seenInCurrentPath.has(segment)) {
                        return false;
                    }
                    seenInCurrentPath.add(segment);
                    return true;
                }

                // For regular segments, track them to avoid duplicates
                const normalizedSegment = segment.toLowerCase();
                if (seenInCurrentPath.has(normalizedSegment)) {
                    return false;
                }
                seenInCurrentPath.add(normalizedSegment);
                return true;
            });

        currentPath = finalSegments.join('/');
    } else {
        currentPath = node.path;
    }

    if (debug) {
        console.log('Generating route for:', currentPath);
        console.log('Node:', node);
    }

    if (node.hasPage) {
        // Generate route key without duplicates
        const segments = currentPath.split('/').filter(Boolean);
        const seenSegments = new Set<string>();
        const uniqueSegments = segments.filter(segment => {
            // For parameters and regular segments, check for duplicates
            const normalizedSegment = segment.toLowerCase();
            if (seenSegments.has(normalizedSegment)) {
                return false;
            }
            seenSegments.add(normalizedSegment);
            return true;
        });

        const routeKey = generateRouteKey(uniqueSegments);

        if (debug) {
            console.log('Generated route key:', routeKey);
        }

        output += `  ${routeKey}: {\n`;
        output += `    path: '${currentPath}',\n`;

        // Collect unique parameters
        const allParams = [...new Set([...node.params, ...extractParamsFromPath(currentPath)])];
        if (allParams.length > 0) {
            output += '    params: {\n';
            allParams.forEach(param => {
                const paramName = param.replace(/^\.\.\./, '').replace(/[?\[\]]/g, '');
                output += `      ${paramName}: '',\n`;
            });
            output += '    },\n';
        }

        output += '  },\n';
    }

    // Process children
    Object.entries(node.children).forEach(([key, childNode]) => {
        output += generateRoutesType(childNode, currentPath, visitedSegments, debug);
    });

    return output;
}

export function generateRouteTemplate(routeNode: RouteNode, debug = false): string {
    const routesContent = generateRoutesType(routeNode, '', new Set(), debug);

    return `import { ParsedUrlQueryInput } from 'querystring';

type RouteConfig = {
    [key: string]: {
        path: string;
        params?: Record<string, string>;
        query?: Record<string, string>;
    };
};

export const routes = {
${routesContent}} as const;

export type AppRoutes = keyof typeof routes;

export function createUrl(
    route: AppRoutes,
    params?: Record<string, string>,
    query?: Record<string, ParsedUrlQueryInput>
): string {
    let path: string = routes[route].path;

    // Replace dynamic parameters
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
        // Replace all occurrences of the parameter
        const paramRegex = new RegExp(\`\\\\[(?:\\\\.\\\\.\\\\.)?\${key}\\\\]\`, 'g');
        path = path.replace(paramRegex, value) as string;
        });
    }

    // Add query parameters
    if (query) {
        const queryString = Object.entries(query)
            .map(([key, value]) => \`\${key}=\${encodeURIComponent(String(value))}\`)
            .join('&');
        if (queryString) {
            path += \`?\${queryString}\`;
        }
    }

    return path;
}
`;
}