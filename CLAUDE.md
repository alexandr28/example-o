# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
React-based municipal tax management system (Sistema de Gestión Tributaria) built with TypeScript, Vite, Material-UI, and Tailwind CSS.

## Essential Commands

### Development
```bash
npm run dev          # Start development server on port 3000
npm run build        # TypeScript check + production build  
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Testing
No test framework currently configured. Consider implementing tests with Vitest or Jest.

## Architecture

### Core Technologies
- **React 19.0** with TypeScript
- **Vite** for building and dev server
- **Material-UI v7** + **Tailwind CSS** for UI
- **React Query** (TanStack Query) for server state
- **React Hook Form** + **Zod** for forms and validation
- **React Router v7** for routing

### Module Structure
The application is organized by business domains:
- **Contribuyentes**: Taxpayer management
- **Predios**: Property registry with multi-floor support
- **Direcciones**: Address and location management
- **Aranceles**: Tax rates and unit values
- **Caja**: Cash operations
- **Cuenta Corriente**: Current account management
- **Coactiva**: Coercive collection
- **Reportes**: Reporting system

### Directory Layout
```
src/
├── components/[domain]/  # Domain-specific components
├── services/             # API service layer (extends BaseService)
├── hooks/                # Custom React hooks
├── context/              # React Context providers (Auth, Theme, etc.)
├── models/               # TypeScript data models
├── pages/                # Route components
└── types/                # TypeScript type definitions
```

### Path Aliases
Use these import aliases:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@services/` → `src/services/`
- `@hooks/` → `src/hooks/`
- `@context/` → `src/context/`

### API Configuration
- Backend: `http://26.161.18.122:8080`
- Auth API: `http://192.168.20.160:8080`
- Configured in `vite.config.ts` with proxy for CORS
- No authentication required for API endpoints (open access)

## Key Patterns

### Service Layer
All API services extend `BaseService` class:
```typescript
class ServiceName extends BaseService {
  constructor() {
    super('/api/endpoint');
  }
}
```

### Context Providers
Multiple contexts wrap the app:
- `AuthProvider`: Authentication state
- `ThemeProvider`: MUI theme configuration
- `SidebarProvider`: Navigation state
- Form-specific providers for complex forms

### Component Organization
Components are grouped by business domain in `src/components/[domain]/`:
- Each domain has its own CRUD components
- Shared UI components in `src/components/ui/`
- Modal components in `src/components/modal/`

### Form Handling
- Use React Hook Form with Zod validation
- Complex forms use dedicated Context providers
- Spanish localization for date pickers and validation messages

## Development Notes

### When modifying forms:
- Check for existing Zod schemas in the component
- Use React Hook Form's `useForm` hook
- Validate with Spanish error messages

### When adding new API endpoints:
- Create service in `src/services/`
- Extend `BaseService` class
- Use consistent error handling patterns

### When creating new components:
- Follow existing component structure in the same domain
- Use TypeScript interfaces for props
- Leverage existing UI components from `@components/ui/`

### Styling:
- Prefer Tailwind CSS utilities
- Use MUI components with sx prop when needed
- Dark mode support via Tailwind classes