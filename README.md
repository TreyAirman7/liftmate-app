# LiftMate

A comprehensive fitness tracking application built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Workout Tracking**: Create and follow workout templates, log sets and reps
- **Progress Monitoring**: Track your fitness progress over time
- **Exercise Library**: Browse and filter exercises by muscle group
- **Goal Setting**: Set and track fitness goals
- **Progress Photos**: Upload and compare progress photos
- **Muscle Heatmap**: Visualize muscle activation
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/liftmate.git
   cd liftmate
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
LiftMate/
├── app/                  # Next.js App Router
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page component
├── components/           # React components
│   ├── ui/               # UI components
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions and context providers
├── public/               # Static assets
└── styles/               # Additional styles
```

## Documentation

For detailed documentation, please refer to the following guides:

- [Documentation Index](./LiftMate-Documentation-Index.md) - Table of contents for all documentation
- [Setup Guide](./LiftMate-Setup-Guide.md) - Instructions for setting up the project
- [Architecture Document](./LiftMate-Architecture.md) - Overview of the project architecture
- [Implementation Plan](./LiftMate-Implementation-Plan.md) - Step-by-step plan for implementing the project

## Development

### Commands

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check for code quality issues

### Coding Standards

- Use TypeScript for type safety
- Follow the component structure outlined in the Architecture Document
- Use Tailwind CSS for styling
- Follow the shadcn/ui component patterns

## Storage

LiftMate uses client-side storage for data persistence:

- **LocalStorage**: For user preferences and settings
- **IndexedDB**: For storing larger data like progress photos

## Performance Optimization

The application includes several performance optimizations:

- Adaptive animations based on device capabilities
- Efficient rendering of components
- Lazy loading of images and components
- Memory management for photo storage

## Contributing

Contributions are welcome! Please read the [Contribution Guidelines](./LiftMate-Documentation-Index.md#contribution-guidelines) before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Lucide](https://lucide.dev/) for the icons
- [Font Awesome](https://fontawesome.com/) for additional icons
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling