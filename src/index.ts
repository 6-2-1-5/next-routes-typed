// src/index.ts
import { ESLint } from 'eslint';
import { execute } from './cli.js';

export { execute };
export type { RouteNode, RouteConfig, GeneratorOptions } from './types.js';

function validateESLintVersion() {
    try {
        const version = parseInt(ESLint.version.split('.')[0], 10);
        if (version < 8) {
            console.warn('Warning: next-routes-typed requires ESLint v8 or higher');
        }
    } catch (error) {
        // ESLint not found, skip validation
    }
}

// Run validation when package is imported
validateESLintVersion();