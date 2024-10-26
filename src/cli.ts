import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { Command } from 'commander';
import chalk from 'chalk';
import { scanDirectory } from './scanner.js';
import { generateRouteTemplate } from './generator.js';
import { formatTypescript } from './utils.js';
import type { GeneratorOptions } from './types.js';

export async function execute(options: GeneratorOptions) {
    try {
        const rootAppDir = path.join(process.cwd(), 'app');
        const srcAppDir = path.join(process.cwd(), 'src', 'app');

        let appDir: string;

        if (fs.existsSync(srcAppDir)) {
            appDir = srcAppDir;
        } else if (fs.existsSync(rootAppDir)) {
            appDir = rootAppDir;
        } else {
            throw new Error('"app" directory not found. Please ensure you have an app directory either in root or src/app.');
        }

        // Use debug mode from options
        const routeTree = scanDirectory(appDir, '', options.debug);

        if (options.debug) {
            console.log('Route tree:', JSON.stringify(routeTree, null, 2));
        }

        // Generate and format the code
        const generatedCode = generateRouteTemplate(routeTree, options.debug);
        const formattedCode = formatTypescript(generatedCode);

        // Ensure output directory exists
        const outputPath = path.join(process.cwd(), options.output);
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Format with prettier if available
        let finalCode = formattedCode;
        try {
            const prettierConfig = options.prettierConfig
                ? await prettier.resolveConfig(process.cwd(), {
                    config: options.prettierConfig,
                })
                : await prettier.resolveConfig(process.cwd());

            finalCode = await prettier.format(formattedCode, {
                ...prettierConfig,
                parser: 'typescript',
            });
        } catch (error) {
            if (options.debug) {
                console.warn('Prettier formatting failed:', error);
            }
        }

        // Write the file
        const filePath = path.join(outputPath, options.filename);
        fs.writeFileSync(filePath, finalCode);

        if (options.debug) {
            console.log('Output file:', filePath);
            console.log('Generated code:', finalCode);
        }

        return filePath;
    } catch (error) {
        throw error;
    }
}

const program = new Command();

program
    .name('next-routify')
    .description('Generate type-safe route utilities for Next.js app router')
    .version('0.1.0')
    .option('-o, --output <path>', 'output directory', 'src/lib')
    .option('-f, --filename <name>', 'output filename', 'routes.ts')
    .option('--prettier-config <path>', 'path to prettier config')
    .option('--debug', 'enable debug logging')
    .action(async (options) => {
        try {
            const filePath = await execute(options);
            console.log(chalk.green('✓'), 'Routes generated successfully!');
            console.log(chalk.dim('Output:'), filePath);
        } catch (error) {
            console.error(chalk.red('✗ Error:'), error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse();