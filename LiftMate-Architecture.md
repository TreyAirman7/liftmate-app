# LiftMate Architecture Document

## Application Overview

LiftMate is a fitness tracking application designed to help users track their workouts, monitor progress, set goals, and manage their fitness journey. The application is built with Next.js, React, TypeScript, and Tailwind CSS, using shadcn/ui components for the UI.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       LiftMate App                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   UI Layer   │  │ Logic Layer │  │    Storage Layer    │  │
│  │             │  │             │  │                     │  │
│  │ Components  │◄─┼─────────────┼─►│  Local Storage      │  │
│  │ UI Elements │  │ Contexts    │  │  IndexedDB          │  │
│  │ Layouts     │  │ Hooks       │  │                     │  │
│  └─────────────┘  │ Utils       │  └─────────────────────┘  │
│                   └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

The application is organized into the following main components:

### Core Components

1. **App Layout** (`app/layout.tsx`): The root layout component that wraps the entire application and provides the theme context and workout context.

2. **Main Page** (`app/page.tsx`): The main page component that handles tab navigation and renders the appropriate tab content.

3. **Tab Components**:
   - `WorkoutTab`: Displays workout templates and active workouts
   - `StatsTab`: Shows workout statistics and metrics
   - `ProgressTab`: Displays progress over time
   - `ExercisesTab`: Lists available exercises
   - `HistoryTab`: Shows workout history
   - `GoalsTab`: Displays and manages fitness goals
   - `PicsTab`: Manages progress photos

4. **Active Workout Components**:
   - `TemplateSelector`: For selecting workout templates
   - `WorkoutFlow`: Manages the workout flow
   - `WorkoutLogger`: For logging workout data
   - `WorkoutSummary`: Displays workout summary
   - `WorkoutTracker`: Tracks workout progress

5. **UI Components**: Reusable UI components from shadcn/ui and custom components

### Context Providers

1. **ThemeProvider** (`components/theme-provider.tsx`): Manages the application theme (light/dark mode)

2. **WorkoutProvider** (`lib/workout-context.tsx`): Manages workout state and data

3. **LoadingContext** (`lib/loading-context.tsx`): Manages loading states

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │     │  Context/State  │     │  Storage Layer  │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  User Interactions    │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │                       │  Data Operations      │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │  Data Updates         │
         │                       │◄──────────────────────┤
         │                       │                       │
         │  UI Updates           │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
```

## Storage Strategy

The application uses client-side storage for data persistence:

1. **LocalStorage**: Used for storing small amounts of data like user preferences and settings

2. **IndexedDB** (via `PhotoStorage`): Used for storing larger data like progress photos

## Key Features and Implementation

### 1. Workout Tracking

- **Workout Templates**: Predefined workout structures that users can select
- **Active Workout Flow**: Step-by-step guidance through a workout
- **Workout Logging**: Recording sets, reps, weights, and other metrics

### 2. Progress Tracking

- **Stats Visualization**: Charts and graphs showing progress over time
- **Progress Photos**: Before/after comparisons
- **Muscle Heatmap**: Visual representation of muscle activation

### 3. Exercise Library

- **Exercise Database**: Comprehensive list of exercises
- **Muscle Group Filtering**: Filtering exercises by muscle group
- **Custom Exercises**: Ability to add custom exercises

### 4. Performance Optimization

- **Animation Monitoring**: Monitoring and adjusting animations based on device performance
- **Simplified Animations**: Fallback to simpler animations on lower-end devices
- **Lazy Loading**: Loading components only when needed

## Technical Considerations

### 1. Responsive Design

The application is designed to work on various screen sizes, with special attention to mobile devices.

### 2. Offline Functionality

The application stores data locally, allowing for offline usage.

### 3. Performance

- **Animation Optimization**: Animations are optimized based on device capabilities
- **Memory Management**: Careful management of resources, especially for photo storage
- **Rendering Optimization**: Efficient rendering of components

### 4. Accessibility

- **Keyboard Navigation**: Support for keyboard navigation
- **Screen Reader Support**: Proper ARIA attributes for screen reader compatibility
- **Reduced Motion**: Support for users who prefer reduced motion

## Future Enhancements

1. **Cloud Sync**: Synchronizing data across devices
2. **Social Features**: Sharing workouts and progress with friends
3. **AI-Powered Recommendations**: Personalized workout recommendations
4. **Integration with Fitness Devices**: Connecting with fitness trackers and smart devices

## Development Guidelines

1. **Component Structure**: Keep components small and focused on a single responsibility
2. **State Management**: Use context providers for shared state
3. **Performance**: Monitor and optimize performance, especially for animations
4. **Accessibility**: Ensure all features are accessible
5. **Testing**: Write tests for critical functionality

## Conclusion

LiftMate is designed as a comprehensive fitness tracking application with a focus on user experience, performance, and offline functionality. The architecture supports the current features while allowing for future enhancements and scalability.