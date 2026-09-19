#!/bin/bash
# verify-oauth-setup.sh - Verify OAuth configuration

echo "=== Veyrivo CRM OAuth Setup Verification ==="
echo ""

# Check if .env files exist
echo "1. Checking environment files..."
if [ -f "server/.env" ]; then
    echo "✓ server/.env exists"
    grep -q "SUPABASE_URL" server/.env && echo "  ✓ SUPABASE_URL set" || echo "  ✗ SUPABASE_URL missing"
    grep -q "SUPABASE_ANON_KEY" server/.env && echo "  ✓ SUPABASE_ANON_KEY set" || echo "  ✗ SUPABASE_ANON_KEY missing"
    grep -q "SUPABASE_SERVICE_ROLE_KEY" server/.env && echo "  ✓ SUPABASE_SERVICE_ROLE_KEY set" || echo "  ✗ SUPABASE_SERVICE_ROLE_KEY missing"
else
    echo "✗ server/.env not found"
fi

if [ -f "client/.env" ]; then
    echo "✓ client/.env exists"
    grep -q "VITE_SUPABASE_URL" client/.env && echo "  ✓ VITE_SUPABASE_URL set" || echo "  ✗ VITE_SUPABASE_URL missing"
    grep -q "VITE_SUPABASE_ANON_KEY" client/.env && echo "  ✓ VITE_SUPABASE_ANON_KEY set" || echo "  ✗ VITE_SUPABASE_ANON_KEY missing"
else
    echo "✗ client/.env not found"
fi

echo ""
echo "=== Supabase Dashboard Configuration Checklist ==="
echo ""
echo "1. Supabase Dashboard → Authentication → Providers → Google"
echo "   ☐ Google provider enabled"
echo "   ☐ Client ID and Secret configured from Google Cloud Console"
echo ""
echo "2. Supabase Dashboard → Authentication → URL Configuration"
echo "   ☐ Site URL: http://localhost:5173 (dev) / https://yourdomain.com (prod)"
echo "   ☐ Redirect URLs: http://localhost:5173/auth/callback"
echo ""
echo "3. Google Cloud Console → APIs & Services → Credentials"
echo "   ☐ OAuth 2.0 Client ID created"
echo "   ☐ Authorized redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback"
echo ""
echo "4. Test OAuth Flow:"
echo "   - Visit http://localhost:5173/login"
echo "   - Click 'Continue with Google'"
echo "   - Should redirect to Google OAuth consent screen"
echo "   - After consent, should redirect to /auth/callback → /admin/dashboard"

echo ""
echo "=== Quick Test Commands ==="
echo "cd server && npm run dev    # Start backend on :5000"
echo "cd client && npm run dev    # Start frontend on :5173"