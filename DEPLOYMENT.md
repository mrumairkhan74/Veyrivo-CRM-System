# Veyrivo CRM - Production Deployment Guide

## Prerequisites

1. **Supabase Project** - Create at [supabase.com](https://supabase.com)
2. **Render Account** - For hosting at [render.com](https://render.com)
3. **Google Cloud Console** - For Google OAuth
4. **GitHub Repository** - For CI/CD

---

## 1. Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create new project
2. Note down: Project URL, Anon Key, Service Role Key

### 1.2 Run Database Migrations
Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Run server/database/schema.sql
-- Run server/database/storage.sql
```

### 1.3 Configure Authentication
1. **Authentication > Providers**: Enable **Google** provider
2. **Authentication > URL Configuration**:
   - Site URL: `https://your-app.onrender.com`
   - Redirect URLs: `https://your-app.onrender.com/confirm-email`
3. **Authentication > Settings**: Enable "Confirm email" 

### 1.4 Create Storage Bucket
Run `server/database/storage.sql` in SQL Editor or use Dashboard:
1. Storage > New Bucket: `avatars`
2. Public bucket: ✅
3. File size limit: 5MB
4. Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

---

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. **APIs & Services > Credentials** > Create Credentials > OAuth 2.0 Client ID
4. Authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
3. Save Client ID and Secret
4. Add to Supabase: Authentication > Providers > Google

---

## 3. Render Deployment

### 3.1 Backend Service
1. New > Web Service
2. Connect GitHub repo
3. Settings:
   - Name: `veyrivo-crm-api`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node app.js`
   - Health Check Path: `/health`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_32_char_secret
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   FRONTEND_URL=https://your-app.onrender.com
   ```

### 3.2 Frontend Service
1. New > Static Site
2. Connect same GitHub repo
3. Settings:
   - Name: `veyrivo-crm-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3.3 Custom Domain (Optional)
1. Settings > Custom Domains
2. Add your domain
3. Update DNS records as instructed

---

## 4. GitHub Secrets for CI/CD

Add to GitHub Repository > Settings > Secrets > Actions:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_32_char_secret
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID_FRONTEND=your_frontend_service_id
RENDER_SERVICE_ID_BACKEND=your_backend_service_id
```

---

## 5. Local Development

### Backend
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## 6. Production Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Storage bucket created
- [ ] Google OAuth configured
- [ ] Email confirmation enabled
- [ ] Render services deployed
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] GitHub Actions CI/CD passing
- [ ] SSL certificate active (Render provides)
- [ ] Error tracking configured (optional)

---

## 7. Monitoring & Maintenance

### Health Checks
- Backend: `https://your-api.onrender.com/health`
- Frontend: `https://your-app.onrender.com`

### Logs
- Render Dashboard > Logs
- Supabase Dashboard > Logs

### Backups
- Supabase: Automatic daily backups
- Manual: `pg_dump` from Supabase CLI

### Updates
- Monitor Render deployments
- Check GitHub Actions for CI/CD status
- Update dependencies monthly

---

## 8. Troubleshooting

### Common Issues

**CORS Errors**
- Check `FRONTEND_URL` matches frontend URL exactly
- Verify CORS config in `app.js`

**Supabase Connection Failed**
- Verify `SUPABASE_URL` and keys
- Check Supabase project status

**Email Not Sending**
- Check Supabase Auth > Settings > SMTP settings
- Verify email templates in Supabase

**Google OAuth Fails**
- Verify redirect URI in Google Console
- Check Supabase Auth > Providers > Google

**JWT Errors**
- Ensure `JWT_SECRET` is 32+ chars
- Check token expiration settings

---

## 9. Quick Commands Reference

```bash
# Local development
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :5173

# Testing
cd server && npm test       # Backend tests
cd client && npm run test   # Frontend tests
npx cypress open           # E2E tests

# Build
cd client && npm run build  # Production build

# Deploy
git push origin main        # Triggers CI/CD
```

---

## Support

For issues:
1. Check Render logs
2. Check Supabase logs
3. Check GitHub Actions
4. Review this guide

**Time estimate**: 2-3 hours for full setup