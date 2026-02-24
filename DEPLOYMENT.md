# Vercel Deployment Guide - 12th Fail Jobs

## Fixed Issues ✅

The following issues have been resolved to fix the Vercel deployment error:

### 1. Missing Dependencies
- Added `helmet@^7.1.0` for security headers
- Added `express-rate-limit@^7.1.5` for rate limiting

### 2. Cache Control Issues
- Updated `vercel.json` with proper cache headers
- Added cache-busting version from `v=2` to `v=3` in login pages
- Configured static file caching for JS/CSS files

### 3. Route Configuration
- Enhanced routing in `vercel.json` to handle all paths correctly
- Added specific routes for `/worker/*` and `/recruiter/*` paths

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Environment Variables (if needed)
Set these in your Vercel dashboard:
- `NODE_ENV`: `production`

## File Structure
```
├── server/
│   ├── index.js          # Main server file
│   └── database.js       # In-memory database
├── worker/
│   └── login.html        # Worker login (updated cache busting)
├── recruiter/
│   └── login.html        # Recruiter login (updated cache busting)
├── js/
│   └── app.js           # Frontend JavaScript
├── vercel.json          # Vercel configuration (updated)
└── package.json         # Dependencies (updated)
```

## Sample Login Credentials
After deployment, you can test with these accounts:

### Worker Accounts:
- **Email**: rahul@example.com
- **Password**: password123

- **Email**: amit@example.com  
- **Password**: password123

### Recruiter Account:
- **Email**: priya@example.com
- **Password**: password123

## Troubleshooting

### If you still get 403 errors:
1. Clear your browser cache completely
2. Try incognito/private browsing mode
3. Check the Vercel deployment logs for any errors

### If login doesn't work:
1. Check the browser console for JavaScript errors
2. Verify the API endpoints are accessible
3. Check network tab in browser dev tools

## Cache Busting
The JavaScript files now use `?v=3` parameter to force browser cache refresh. If you need to force another refresh, increment this number.

## Security Features
- Rate limiting on all endpoints
- XSS protection with helmet
- Input sanitization
- Password hashing with bcryptjs

## Support
If you encounter any issues after deployment:
1. Check Vercel function logs
2. Verify all dependencies are installed
3. Ensure the static files are being served correctly
