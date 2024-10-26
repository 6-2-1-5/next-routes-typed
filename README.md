# next-routify

Generate type-safe route utilities for Next.js app router. Automatically generate route constants and helper functions that match your app directory structure.

## Features

✨ **Automatic Route Generation**: Generates routes based on your Next.js app directory structure<br>
🎯 **Type Safety**: Full TypeScript support with type inference<br>
🔄 **Dynamic Routes**: Support for dynamic routes, catch-all routes, and optional catch-all routes<br>
📁 **Route Groups**: Support for route groups (folders in parentheses)<br>
🛠️ **Custom Configuration**: Configurable output location and filename<br>
🎨 **Pretty Output**: Formatted output with Prettier support

## Installation

```bash
npm install --save-dev next-routify
# or
yarn add -D next-routify
# or
pnpm add -D next-routify
```

## Usage

### Basic Usage

Run in your Next.js project root:

```bash
npx next-routify
```

This will generate a `routes.ts` file in `src/lib` by default.

### CLI Options

```bash
npx next-routify --help

Options:
  -o, --output <path>       output directory (default: "src/lib")
  -f, --filename <name>     output filename (default: "routes.ts")
  --prettier-config <path>  path to prettier config
  --debug                   enable debug logging
  -h, --help               display help for command
```

### Example

For a Next.js app structure like:

```
app/
├── page.tsx
├── about/
│   └── page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
└── products/
    └── [category]/
        └── [id]/
            └── page.tsx
```

`next-routify` will generate:

```typescript
export const routes = {
  home: {
    path: "/",
  },
  about: {
    path: "/about",
  },
  blog: {
    path: "/blog",
  },
  blogSlug: {
    path: "/blog/[slug]",
    params: {
      slug: "",
    },
  },
  productsCategoryId: {
    path: "/products/[category]/[id]",
    params: {
      category: "",
      id: "",
    },
  },
} as const;

export type AppRoutes = keyof typeof routes;

export function createUrl(
  route: AppRoutes,
  params?: Record<string, string>,
  query?: Record<string, string>
): string;
```

### Using Generated Routes

```typescript
import { createUrl } from "@/lib/routes";

// Simple route
const aboutUrl = createUrl("about");
// Result: /about

// Route with parameters
const blogPostUrl = createUrl("blogSlug", { slug: "hello-world" });
// Result: /blog/hello-world

// Route with parameters and query
const productUrl = createUrl(
  "productsCategoryId",
  { category: "electronics", id: "123" },
  { ref: "homepage" }
);
// Result: /products/electronics/123?ref=homepage
```

## Supported Route Types

- Basic routes: `/about`
- Dynamic routes: `/blog/[slug]`
- Catch-all routes: `/docs/[...slug]`
- Optional catch-all routes: `/docs/[[...slug]]`
- Route groups: `(marketing)/blog`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 For bugs and feature requests, please [create an issue](https://github.com/6-2-1-5/next-routify/issues)
- 💬 For questions and discussions, please use [GitHub Discussions](https://github.com/6-2-1-5/next-routify/discussions)
