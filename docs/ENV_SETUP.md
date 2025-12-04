# Environment Variables Setup

This guide explains how to configure environment variables for the ASP Dashboard.

## Quick Setup

1. **Create a `.env.local` file** in the project root directory (same level as `package.json`).

2. **Add the following variables:**

```bash
# ASP Platform API Configuration
ASP_API_BASE_URL=http://localhost:8080/v1
ASP_API_KEY=your_api_key_here
```

3. **Replace `your_api_key_here`** with your actual ASP Platform API key.

4. **Restart the development server** after creating/updating `.env.local`:
   ```bash
   npm run dev
   ```

## Environment Variables

### `ASP_API_BASE_URL`

The base URL for the ASP Platform API.

- **Development:** `http://localhost:8080/v1`
- **Production:** `https://api.asp-platform.com/v1`

**Default:** If not set, it defaults to:
- `http://localhost:8080/v1` in development
- `https://api.asp-platform.com/v1` in production

### `ASP_API_KEY`

Your ASP Platform API key for authentication.

**Format:**
- Live keys: `asp_live_sk_<prefix>_<secret>`
- Sandbox keys: `asp_sandbox_sk_<prefix>_<secret>`

**Example:**
```
asp_live_sk_abc123xyz_4f8a9b2c3d1e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

## Security Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- **Never expose API keys in client-side code** - all API calls go through Next.js API routes
- **Use different keys for development and production**

## Troubleshooting

### Error: "Missing ASP_API_KEY environment variable"

**Solution:** Make sure:
1. `.env.local` exists in the project root
2. `ASP_API_KEY` is set in `.env.local`
3. You've restarted the dev server after creating/updating `.env.local`

### Error: "403 Forbidden"

**Possible causes:**
1. Invalid API key format
2. Expired or revoked API key
3. API key doesn't have required permissions

**Solution:** Verify your API key is correct and active.

### Error: "Failed to fetch banks"

**Possible causes:**
1. Backend server is not running
2. Incorrect `ASP_API_BASE_URL`
3. Network connectivity issues

**Solution:** 
- Check if the backend is running at `http://localhost:8080`
- Verify `ASP_API_BASE_URL` matches your backend URL

## File Structure

```
asp-dashboard/
├── .env.local          ← Create this file
├── package.json
├── README.md
└── ...
```

## Next Steps

After setting up environment variables:
1. Restart the dev server: `npm run dev`
2. Visit `/dashboard/sandbox` to test the banks API
3. Check the browser console and terminal for any errors

