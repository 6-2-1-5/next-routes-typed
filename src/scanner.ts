import fs from 'fs';
import path from 'path';
import type { RouteNode } from './types.js';
import { normalizePath } from './utils.js';

export function scanDirectory(dir: string, root = '', debug = false): RouteNode {
    if (debug) {
        console.log(`Scanning directory: ${dir}`);
        console.log(`Current root: ${root}`);
    }

    const node: RouteNode = {
        path: root,
        params: [],
        children: {},
        hasPage: false
    };

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    if (debug) {
        console.log(`Found entries:`, entries.map(e => e.name));
    }

    for (const entry of entries) {
        // Skip files and directories we don't want to process
        if (
            entry.name.startsWith('.') ||
            entry.name.startsWith('_') ||
            entry.name === 'api' ||
            entry.name === 'node_modules'
        ) {
            if (debug) console.log(`Skipping ${entry.name}`);
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (debug) console.log(`Processing directory: ${entry.name}`);

            // Handle route groups
            const routeName = entry.name.replace(/^\((.*)\)$/, '');
            const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');

            if (debug) {
                console.log(`Route name: ${routeName}`);
                console.log(`Is route group: ${isRouteGroup}`);
            }

            // Extract params first
            const params: string[] = [];
            if (routeName.startsWith('[') && routeName.endsWith(']')) {
                let paramName = routeName.slice(1, -1);
                if (paramName.startsWith('...')) {
                    paramName = paramName.slice(3);
                    params.push(`...${paramName}`);
                } else if (paramName.startsWith('[...') && paramName.endsWith(']')) {
                    paramName = paramName.slice(4, -1);
                    params.push(`...${paramName}?`);
                } else {
                    params.push(paramName);
                }
                if (debug) console.log(`Added params:`, params);
            }

            // Handle path construction
            let childPath: string;
            if (isRouteGroup) {
                // For route groups, keep the parent path
                childPath = root;
            } else {
                // For normal routes, append the route name
                childPath = root ? `${root}/${routeName}` : routeName;
            }

            if (debug) console.log(`Child path: ${childPath}`);

            // Scan child directory
            const childNode = scanDirectory(fullPath, childPath, debug);

            // Merge or add child node
            if (isRouteGroup) {
                if (debug) console.log(`Merging route group children`);
                // For route groups, merge children and params
                Object.assign(node.children, childNode.children);
                node.params.push(...childNode.params);
                // If the route group has a page, mark the parent as having a page
                if (childNode.hasPage) {
                    node.hasPage = true;
                }
            } else {
                // For normal routes
                if (Object.keys(childNode.children).length > 0 || childNode.hasPage) {
                    node.children[routeName] = childNode;
                    if (params.length > 0) {
                        childNode.params.push(...params);
                    }
                }
            }
        } else if (
            entry.name === 'page.tsx' ||
            entry.name === 'page.ts' ||
            entry.name === 'page.jsx' ||
            entry.name === 'page.js'
        ) {
            if (debug) console.log(`Found page file at: ${fullPath}`);
            node.hasPage = true;
        }
    }

    if (debug) {
        console.log(`Finished scanning ${dir}`);
        console.log(`Node result:`, JSON.stringify(node, null, 2));
    }

    return node;
}