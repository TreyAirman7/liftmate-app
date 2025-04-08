# LiftMate Project Setup Guide

## Project Overview

LiftMate is a fitness tracking application built with Next.js, React, TypeScript, and Tailwind CSS. The application uses shadcn/ui components and has a multi-tab interface for different features like workouts, stats, progress, exercises, history, goals, and pictures.

## Project Structure

The project follows a standard Next.js App Router structure:

- `app/`: Contains the main application code, including the root layout and page components
- `components/`: Contains reusable UI components
- `lib/`: Contains utility functions and context providers
- `public/`: Contains static assets
- `styles/`: Contains global styles (note: there's duplication with app/globals.css)

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Fix CSS Configuration

There are two global CSS files in the project:
- `app/globals.css`: The main CSS file specified in components.json
- `styles/globals.css`: A secondary CSS file with basic Tailwind setup

**Recommendation**: Keep `app/globals.css` as the main CSS file and remove or merge `styles/globals.css` to avoid conflicts.

### 3. Fix Misnamed File

There's a misnamed file `file=` in the root directory that appears to be a custom implementation of the Progress component. The content suggests it should be at `components/ui/progress.tsx`, but a different version of that file already exists.

**Recommendation**: Compare the two implementations and decide which one to keep. If the custom implementation has additional features (like showing percentage values), consider merging those features into the existing file.

### 4. Run Development Server

```bash
pnpm dev
```

## Project Configuration

### Next.js Configuration

The project uses Next.js 15.2.4 with the following configuration in `next.config.mjs`:
- ESLint and TypeScript errors are ignored during builds
- Images are unoptimized
- Several experimental features are enabled

### Tailwind CSS Configuration

The project uses Tailwind CSS with the following configuration:
- Dark mode is enabled via the "class" strategy
- Custom colors are defined for the UI theme
- CSS variables are used for theming
- The tailwindcss-animate plugin is used for animations

### UI Components

The project uses shadcn/ui components with the following configuration in `components.json`:
- RSC (React Server Components) are enabled
- TSX is used for components
- Tailwind CSS is configured with CSS variables
- Lucide is used as the icon library

## Known Issues

1. **CSS Duplication**: There are two global CSS files that might cause conflicts.
2. **Misnamed File**: The `file=` file in the root directory needs to be properly renamed or merged.
3. **Layout.tsx Issues**: The `app/layout.tsx` file has duplicate imports and the metadata export is at the end of the file, which is unusual.

## Next Steps

1. Fix the CSS configuration by consolidating the global styles
2. Address the misnamed file issue
3. Clean up the layout.tsx file
4. Run the development server to verify everything works correctly