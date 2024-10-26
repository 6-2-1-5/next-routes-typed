import path from 'path';
import { ESLint } from 'eslint';

export function generateRouteKey(segments: string[]): string {
    return segments
        .map((segment, index) => {
            // Remove brackets and spread operator
            let clean = segment
                .replace(/[\[\]]/g, '')
                .replace(/\.\.\./g, 'Catchall');

            // Handle hyphenated segments
            let parts = clean.split('-');
            parts = parts.map((part, i) => {
                // Capitalize first letter, lowercase the rest
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            });

            // For first segment, lowercase the first letter
            if (index === 0) {
                return parts[0].toLowerCase() + parts.slice(1).join('');
            }

            return parts.join('');
        })
        .join('');
}

export function formatTypescript(code: string): string {
    return `// This file is auto-generated. DO NOT EDIT IT MANUALLY!\n${code}`;
}

export function normalizePath(pathStr: string): string {
    return pathStr.split(path.sep).join('/');
}

export function getESLintVersion(): number {
    try {
        const version = ESLint.version;
        return parseInt(version.split('.')[0], 10);
    } catch (error) {
        // Default to v8 if can't detect
        return 8;
    }
}

export function isESLintV9OrHigher(): boolean {
    return getESLintVersion() >= 9;
}