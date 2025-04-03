# src/ Directory Structure Guidelines

## 1. components/
- Store reusable UI components
- Each component should have:
  - a Grouping directory (Ex: Buttons/)
  - Component file (Ex: ComponentName.tsx)
  - Single default exported component (Ex: export default ComponentName.tsx)
  - Comment describing component usage
- If the component is specific to a particular screen and not readily reusable, it should not be added to this directory. Please store that component in the components folder associated with the screen.

## 2. screens/
- Contains full page/screen components
- Each screen in its own directory
- Include screen-specific components
- Follow the pattern:
  ```
  screens/
  ├── Home/
  │   ├── Home.tsx
  │   ├── components/
  ```
- Add a console log to ensure screen is not rendered multiple times (Ex: console.log([Rendered Home screen]))

## 3. navigation/
- All navigation-related configuration
- Navigation stacks
- Route types
- Navigation utilities
- Screen linking configuration

## 4. context/
- React Context definitions
- Global state management
- Context providers and hooks
- Separate contexts by domain/feature

## 5. utils/
- Helper functions and classes
- Common utilities
- Constants
- Type definitions
- Please do not add any functions that return react components. All util files should only be `.ts` files and never `.tsx`.

## 6. store/
- Redux State management
- Actions
- Reducers
- Selectors
- Store configuration

## 7. configs/
- Application configuration files
- Environment variables
- API configurations
- Theme configurations
- Constants and settings

## 8. guidelines/
- Project documentation
- Coding standards
- Best practices
- Component usage guides

## Best Practices:
1. Maintain clear separation of concerns
2. Keep related files close together
3. Follow consistent naming conventions
4. Write unit tests for components and utilities
5. Document complex logic and component usage
6. Use TypeScript for better type safety
7. Keep components small and focused
8. Use absolute imports with path aliases

## File Naming Conventions:
- Components: PascalCase (e.g., `Button.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE
- Test files: `*.test.tsx` or `*.spec.tsx`
