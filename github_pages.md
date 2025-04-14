# GitHub Pages Deployment Setup

This document explains how GitHub Pages is set up for this project and how to interact with it.

## GitHub Pages Configuration

This project is deployed to GitHub Pages using a GitHub Actions workflow.

### Workflow File

The workflow file is located at `.github/workflows/deploy-gh-pages.yml`.

### Workflow Trigger

The workflow is triggered automatically on each push to the `master` branch.

### Deployment Process

The workflow does the following:

1.  **Checks out the code:**  Retrieves the latest code from the `master` branch.
2.  **Sets up Node.js:** Configures Node.js environment required for building the Next.js application.
3.  **Installs dependencies:** Installs project dependencies using `yarn install`.
4.  **Builds the Next.js site:** Builds the Next.js application using `yarn build`. The build output is configured to be exported as static files to the `out` directory.
5.  **Uploads artifact:** Uploads the `out` directory as an artifact for GitHub Pages.
6.  **Deploys to GitHub Pages:** Deploys the uploaded artifact to GitHub Pages.

## Interacting with GitHub Pages

### Viewing the Deployed Site

Once the workflow successfully completes, the deployed website will be available at the GitHub Pages URL for this repository. You can find the URL in the GitHub repository settings under the "Pages" section.

### Triggering Deployments

To update the deployed website, simply push your changes to the `master` branch. This will automatically trigger the GitHub Actions workflow, which will rebuild and redeploy the site to GitHub Pages.

### Monitoring Deployments

You can monitor the progress and status of deployments in the "Actions" tab of your GitHub repository. Look for the "Deploy Next.js site to Pages" workflow.

### Customization

The deployment process can be customized by modifying the `.github/workflows/deploy-gh-pages.yml` file. For example, you can change the Node.js version, build commands, or deployment options.