# Deploying to GitHub Pages

This guide shows you how to deploy the WDStat frontend to GitHub Pages.

## Prerequisites

- Git repository initialized
- GitHub repository created
- Node.js and npm installed

## Method 1: Manual Deployment (Using gh-pages)

### Step 1: Build the Application

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

### Step 2: Deploy to GitHub Pages

```bash
npm run deploy
```

This command:
- Runs `predeploy` (which builds the app)
- Deploys the `build` folder to the `gh-pages` branch
- Your site will be available at: `https://kiraezy.github.io/WDStatFrontend/`

### Step 3: Enable GitHub Pages (First Time Only)

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

Your site will be live in a few minutes!

## Method 2: Automatic Deployment (GitHub Actions)

If you have a GitHub Actions workflow set up, deployment happens automatically when you push to `main` or `master`.

### Step 1: Commit and Push

```bash
# Make sure you're in the root directory
git add .
git commit -m "Update frontend with count endpoint"
git push origin main
```

### Step 2: Check GitHub Actions

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Watch the deployment workflow run
4. Once complete, your site will be updated automatically

## Important: Environment Variables

**⚠️ Important**: Environment variables in `.env` files are NOT included in the build. You need to set them differently for GitHub Pages.

### Option 1: Hardcode in Code (Not Recommended for Secrets)

Update `api.js` to use the production URL directly:

```javascript
const countUrl = 'https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws';
```

### Option 2: Use GitHub Secrets (For GitHub Actions)

If using GitHub Actions, you can set secrets:
1. Go to repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secrets like `REACT_APP_COUNT_API_URL`
3. Update the workflow to use them

### Option 3: Build-time Environment Variables

Create a script that sets environment variables during build:

```json
// In package.json
"scripts": {
  "build:prod": "REACT_APP_COUNT_API_URL=https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws npm run build"
}
```

## Quick Deployment Checklist

- [ ] Code is committed to Git
- [ ] `.env` variables are handled (hardcoded or via build script)
- [ ] Build succeeds: `npm run build`
- [ ] Deploy: `npm run deploy`
- [ ] GitHub Pages is enabled (Settings → Pages)
- [ ] Site is accessible at your GitHub Pages URL

## Troubleshooting

### Issue: "gh-pages: command not found"

**Solution**: Install gh-pages:
```bash
cd frontend
npm install --save-dev gh-pages
```

### Issue: Site shows blank page

**Solution**: 
1. Check browser console for errors
2. Verify the `homepage` in `package.json` matches your GitHub Pages URL
3. Check that all asset paths are correct (React Router might need `basename`)

### Issue: API calls fail after deployment

**Solution**:
- Environment variables aren't available in production build
- Hardcode the API URLs in the code or use build-time variables
- Check CORS settings on Lambda Function URLs

### Issue: Changes not appearing

**Solution**:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for GitHub Pages to update
- Check the `gh-pages` branch was updated

## Updating After Changes

Every time you make changes:

```bash
# 1. Make your changes
# 2. Test locally
npm start

# 3. Build and deploy
cd frontend
npm run deploy

# Or if using GitHub Actions, just:
git add .
git commit -m "Your commit message"
git push origin main
```

## Current Configuration

- **Repository**: `WDStatFrontend` (or your repo name)
- **Homepage URL**: `https://kiraezy.github.io/WDStatFrontend/`
- **Deploy Branch**: `gh-pages`
- **Build Directory**: `frontend/build`

## Next Steps

1. **Set up environment variables** for production
2. **Test the deployed site** thoroughly
3. **Set up custom domain** (optional) in GitHub Pages settings
4. **Enable HTTPS** (automatic with GitHub Pages)

