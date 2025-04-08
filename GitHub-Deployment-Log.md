# LiftMate GitHub Repository & Pages Deployment Log

This document details the configuration for the GitHub repository and GitHub Pages deployment for the LiftMate project.

## GitHub Repository Details

*   **Repository Name:** `liftmate-app`
*   **Repository Owner:** `TreyAirman7`
*   **Repository URL:** [https://github.com/TreyAirman7/liftmate-app](https://github.com/TreyAirman7/liftmate-app)
*   **Default Branch:** `master`
*   **Visibility:** Public

## GitHub Pages Deployment Configuration

*   **Deployment Method:** GitHub Actions
*   **Workflow File:** `.github/workflows/deploy-gh-pages.yml`
*   **Trigger Branch:** `master` (on push)
*   **Deployment Source Setting (Required Manual Step):** In repository settings -> Pages -> Build and deployment -> Source, **"GitHub Actions"** must be selected.
*   **Deployed Site URL (Expected):** [https://TreyAirman7.github.io/liftmate-app/](https://TreyAirman7.github.io/liftmate-app/)

## Next.js Configuration for Static Export (GitHub Pages)

The following configurations were made in the project to enable static export compatible with GitHub Pages:

1.  **`package.json`:**
    *   No specific `export` script is needed as `next build` handles it with the config below. The build is triggered by `yarn build` in the workflow.
2.  **`next.config.mjs`:**
    *   `output: 'export'` was added to enable static site generation.
    *   `basePath: '/liftmate-app'` was added to handle the repository subdirectory structure on GitHub Pages.
    *   `assetPrefix: '/liftmate-app'` was added for correct asset loading from the subdirectory.
    *   `images: { unoptimized: true }` was already present, which is often necessary for static exports.
3.  **`.nojekyll` File:**
    *   An empty `.nojekyll` file was created in the project root to prevent GitHub Pages from interfering with Next.js routing.

## Deployment History Notes

*   **Initial Push:** Project files initially pushed to `master`.
*   **Workflow Added:** GitHub Actions workflow created for automated deployment.
*   **Build Error 1:** Workflow failed due to using deprecated `next export` command.
*   **Workflow Fix:** Workflow updated to use `yarn build` instead of `yarn export`.
*   **Deployment Error 1:** Workflow failed during deployment step (HTTP 404) because GitHub Pages source was not set to "GitHub Actions" in repository settings.
*   **Resolution:** Manual configuration required in repository settings (Settings -> Pages -> Source -> GitHub Actions).