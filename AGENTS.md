# AI Contributor Guidelines for OneSila Frontend

## Scope
These instructions apply to the entire repository. Always read and follow them before modifying any files.

## Core Principles
- **Limit scope**: Only touch files directly related to the requested change. Do not refactor, reformat, or "clean up" unrelated code.
- **TypeScript & Vue 3**: Maintain the existing Vue 3 + TypeScript setup and adhere to the configured ESLint/pre-commit rules. Run all required checks before finishing.

## Internationalization (i18n)
- All user-visible text must be translated using Vue i18n.
- Add new keys in `src/locale/en.json` using a logical namespace (e.g., `dashboard.labels.totalOrders`). Provide an English default value.
- Copy the new keys to `src/locale/nl.json`, `src/locale/de.json`, and `src/locale/fr.json` with empty strings or placeholders for translators.
- Use `t('key')` in Vue components; never hardcode strings or inline translations.

## Component & Layout Practices
- Reuse the atomic design system components located in `src/shared/` (atoms, molecules, organisms, layouts) plus `GeneralListing`, `GeneralShow`, and `GeneralSearch` for CRUD pages.
- Only create a new component when no existing component fits the requirement. Place shared logic inside the appropriate atomic layer or module.
- Do not globally register components beyond what is already globally registered (`Flex` and `FlexCell`).

## GraphQL Usage
- Define every query, mutation, and subscription in `src/shared/api/`, organized by domain (auth, contacts, etc.).
- Each GraphQL operation must only request the fields actually used by the consuming component to prevent overfetching.
- Never embed GraphQL operations inside Vue components.
- Rely on the Apollo Client setup in `apollo-client.ts`, including centralized error handling via the `onError` link and the HTTP/WebSocket split.
- Choose an appropriate `fetchPolicy`: prefer `cache-only` or `cache-and-network` when data is used directly in components, and `network-only` after mutations or when fresh data is required.
- Avoid N+1 request patterns and prefer pagination over loading entire datasets.
- Review the [OneSila Headless backend](https://github.com/OneSila/OneSilaHeadless) and the (slightly outdated) [OneSila documentation repository](https://github.com/OneSila/OneSilaDocs) to understand the GraphQL schema, domain models, and available fields before designing operations.

## Directory & File Placement
- Keep assets in `src/assets/`.
- Place business logic in `src/core/`.
- Keep translations in `src/locale/`.
- Use `src/shared/` for reusable components, GraphQL API calls, modules, plugins, and templates.
- Store constants and helpers in `src/utils/`.
- Follow existing file naming and organization conventions.

## Styling & UX
- Style components with Tailwind CSS classes; avoid inline styles and hardcoded colors.
- Use the theme and layout configuration files (`theme.config.ts`, `app-setting.ts`, etc.) instead of custom global styles.
- Provide responsive layouts and clear interaction feedback (loading states, disabled states, tooltips as needed).
- When importing named exports, include spaces inside curly braces (e.g., `import { useI18n } from 'vue-i18n';`).

## Performance & Security
- Do not hardcode API endpoints or secrets. Use environment variables such as `VITE_APP_API_GRAPHQL_URL`.
- Avoid global component registration beyond the existing minimal set to keep memory usage low.
- Ensure new code maintains good performance characteristics and avoids unnecessary renders or data fetching.

## Build Verification
- Before completion, run `npm run build` and confirm it succeeds without errors. Report the command and outcome in your final summary.

## Communication
- Document any assumptions in your summary. Provide clear commit messages and keep pull requests focused on the requested change.

