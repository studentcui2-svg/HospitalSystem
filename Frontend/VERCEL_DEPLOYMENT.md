# Vercel Deployment Configuration

## Important: Backend API URL Configuration

The application requires the backend API URL to be configured for production deployment on Vercel.

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend-domain.com`)
   - **Environment**: Production

### Step 2: Alternative - Runtime Configuration

If you don't want to rebuild, you can also set the API URL at runtime by modifying the deployed `index.html`:

The `index.html` already includes:

```html
<script>
  window.__API_BASE__ = window.__API_BASE__ || "http://localhost:5000";
</script>
```

You can override this in Vercel by:

1. Using Vercel's **Build Settings** to inject the API URL
2. Or modifying the build output before deployment

### Step 3: Redeploy

After setting the environment variable, trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

## Verification

After deployment, check the browser console:

- You should see API calls going to your backend domain, not the frontend domain
- Example: `[API] GET https://your-backend-domain.com/api/lab` (NOT `frontend-delta-black-25.vercel.app/api/lab`)

## Current Issue

The lab portal shows "No test records found" because:

- API calls are going to `https://frontend-delta-black-25.vercel.app/api/lab` (404 Not Found)
- They should go to your backend server URL

## Solution Applied

All API calls now use the `jsonFetch` utility which:

1. Checks `window.__API_BASE__` first
2. Then checks `import.meta.env.VITE_API_BASE_URL`
3. Falls back to `http://localhost:5000` for local development

This ensures proper API routing in all environments.
