# GitHub Pages Deployment Guide

This repository uses GitHub Actions to deploy the React application to GitHub Pages.

## Prerequisites

**Important:** GitHub Pages must be configured to use "GitHub Actions" as the deployment source.

### Configure GitHub Pages:

1. Go to your repository Settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - **NOT** "Deploy from a branch" (this will show only the README)

## How It Works

The deployment workflow (`.github/workflows/deploy.yml`) automatically:

1. Checks out the repository
2. Installs Node.js dependencies
3. Builds the React application
4. Creates a `.nojekyll` file (to prevent Jekyll processing)
5. Uploads the build artifact
6. Deploys to GitHub Pages

## Workflow Configuration

The workflow includes:
- **Base Path**: `/movik-festivalen/` (configured in `movik/vite.config.ts`)
- **Build Output**: `movik/dist/`
- **Auto-enablement**: `enablement: true` parameter attempts to enable Pages automatically

## Troubleshooting

### Issue: Site shows README instead of React app

**Cause**: Pages is configured to deploy from a branch instead of GitHub Actions.

**Solution**: 
1. Check repository Settings → Pages
2. Ensure Source is set to "GitHub Actions"
3. Re-run the workflow if needed

### Issue: Assets return 404

**Cause**: Missing `.nojekyll` file or wrong base path.

**Solution**: Already handled by the workflow (creates `.nojekyll` automatically)

### Issue: Workflow succeeds but site doesn't update

**Possible causes**:
1. **Browser cache**: Clear cache or use incognito mode
2. **CDN cache**: Wait a few minutes for GitHub's CDN to update
3. **Wrong source**: Verify Pages source is "GitHub Actions"

## Manual Deployment

To trigger a deployment manually:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"
4. Select branch "main"
5. Click "Run workflow"

## Site URL

The deployed site will be available at:
**https://thortveito.github.io/movik-festivalen/**
