# next-routify

[![npm version](https://badge.fury.io/js/next-routify.svg)](https://badge.fury.io/js/next-routify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/next-routify.svg)](https://www.npmjs.com/package/next-routify)

Generate type-safe route utilities for Next.js app router. Automatically generate route constants and helper functions that match your app directory structure.

## 🌟 Features and Why next-routify?

- ✨ **Type-safe route generation**: Full TypeScript support with type inference
- 🎯 **App Router Support**: Built for Next.js 13+ app directory
- 🔄 **Dynamic Routes**: Support for `[param]`, `[...catchAll]`, and `[[...optional]]`
- 📁 **Route Groups**: Support for route groups (folders in parentheses)
- 🌍 **i18n Ready**: Perfect for internationalized applications
- 🛠️ **Zero Config**: Works out of the box with your existing Next.js structure
- 🎨 **Developer Experience**: Great autocomplete and type checking
- 🔒 **Type Safety**: Catch routing errors at compile time
- 🚀 **Performance**: Zero runtime overhead
- 📦 **Lightweight**: No dependencies

## 🚀 Getting Started

```bash
npm install --save-dev next-routify
# or
yarn add -D next-routify
# or
pnpm add -D next-routify
```

## 📘 Usage

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

## 🎯 Supported Route Types

- Basic routes: `/about`
- Dynamic routes: `/blog/[slug]`
- Catch-all routes: `/docs/[...slug]`
- Optional catch-all routes: `/docs/[[...slug]]`
- Route groups: `(marketing)/blog`
- Parallel routes: `@modal/login`
- Intercepting routes: `(.)photo`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt).

## 📢 Support

- 🐛 For bugs and feature requests, please [create an issue](https://github.com/6-2-1-5/next-routify/issues)
- 💬 For questions and discussions, please use [GitHub Discussions](https://github.com/6-2-1-5/next-routify/discussions)
