# Frontend Troubleshooting Guide

## Network Error (ERR_NETWORK)

If you're getting `AxiosError: Network Error`, this is usually a CORS (Cross-Origin Resource Sharing) issue.

### Solution 1: Verify Lambda Function URL CORS Configuration

1. Go to AWS Lambda Console
2. Select your function: `wdstat-world-domination-metrics-count`
3. Go to **Configuration** → **Function URL**
4. Verify CORS is enabled with:
   - **Allow origins**: `*` (or your specific domain)
   - **Allow methods**: `GET`, `OPTIONS`
   - **Allow headers**: `Content-Type`

### Solution 2: Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- CORS policy errors
- Preflight request failures
- Network tab shows failed requests

### Solution 3: Test the Endpoint Directly

Test if the endpoint works outside the browser:

```bash
# Using curl
curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"

# Using PowerShell
Invoke-WebRequest -Uri "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"
```

If this works but the browser doesn't, it's definitely a CORS issue.

### Solution 4: Update Lambda Function URL CORS

If CORS is not properly configured, update it:

```bash
aws lambda update-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region ap-east-1
```

### Solution 5: Use a Proxy (Development Only)

If you can't fix CORS immediately, add a proxy to `package.json`:

```json
{
  "name": "wdstat-frontend",
  "version": "0.1.0",
  "proxy": "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws",
  ...
}
```

Then update `api.js` to use relative URLs in development.

### Solution 6: Check Environment Variables

Make sure your `.env` file exists in the `frontend/` directory:

```env
REACT_APP_COUNT_API_URL=https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws
```

**Important**: After creating/updating `.env`, restart the development server:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

### Solution 7: Verify the URL is Correct

Double-check the Function URL:
1. Go to Lambda Console
2. Function: `wdstat-world-domination-metrics-count`
3. Configuration → Function URL
4. Copy the exact URL

## Common Issues

### Issue: "Network Error" in Browser Console

**Cause**: CORS not configured or browser blocking the request

**Fix**: 
1. Verify CORS on Lambda Function URL
2. Check browser console for specific CORS error message
3. Try accessing the URL directly in browser (should show JSON)

### Issue: "Timeout" Error

**Cause**: Lambda function taking too long or network issues

**Fix**:
1. Check Lambda function timeout (should be at least 30 seconds)
2. Check CloudWatch logs for function errors
3. Increase axios timeout in `api.js` if needed

### Issue: "404 Not Found"

**Cause**: Wrong Function URL or function doesn't exist

**Fix**:
1. Verify the Function URL is correct
2. Check if the function exists in Lambda Console
3. Verify the region matches (ap-east-1)

### Issue: "403 Forbidden"

**Cause**: IAM permissions issue

**Fix**: See `backend/FIX_COUNT_PERMISSIONS.md`

## Testing Steps

1. **Test endpoint directly**:
   ```bash
   curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"
   ```

2. **Check browser Network tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Try loading the page
   - Look for the failed request
   - Check the error message

3. **Check browser Console**:
   - Look for CORS errors
   - Look for any JavaScript errors

4. **Verify environment variables**:
   ```bash
   # In frontend directory
   echo $REACT_APP_COUNT_API_URL
   # Or check .env file exists
   ```

## Quick Fix Checklist

- [ ] Lambda Function URL has CORS enabled
- [ ] CORS allows `*` origins (or your specific domain)
- [ ] CORS allows `GET` and `OPTIONS` methods
- [ ] `.env` file exists with correct URL
- [ ] Development server restarted after `.env` changes
- [ ] Function URL is correct and accessible
- [ ] Browser console shows specific error (not just "Network Error")

## Still Not Working?

1. Check CloudWatch Logs for the Lambda function
2. Test the endpoint with Postman or curl
3. Check if other endpoints work (search endpoint)
4. Verify the function is deployed and active

