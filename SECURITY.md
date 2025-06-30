# Security Guidelines for DreamAdvisor

## 🚨 IMMEDIATE SECURITY NOTICE

**Your API keys have been secured in the `.env` file and are now protected from GitHub commits.**

## 🔐 API Key Security

### Environment Variables
- **NEVER** commit `.env` files to version control
- Use `.env.example` as a template for required variables
- All client-side variables must use `VITE_` prefix
- Rotate API keys regularly (monthly recommended)

### Required vs Optional Keys
**Required (App won't work without these):**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)

**Optional (App has fallbacks):**
- `VITE_OPENROUTER_API_KEY` - For AI script generation
- `VITE_TAVUS_API_KEY` - For AI video generation
- `VITE_ELEVENLABS_API_KEY` - For voice synthesis

### Safe vs Unsafe Keys
**Safe for client-side exposure:**
- Supabase anon key (designed for public use)
- Public API endpoints
- CDN URLs

**NEVER expose these:**
- Supabase service role key
- Private API keys
- Database passwords
- JWT secrets

## 🚀 Deployment Security

### Development
```bash
# Your .env file is already configured with your keys
# NEVER commit this file to GitHub
```

### Production (Netlify)
1. Go to Site Settings → Environment Variables
2. Add each variable individually:
   - `VITE_SUPABASE_URL` = your_production_supabase_url
   - `VITE_SUPABASE_ANON_KEY` = your_production_anon_key
   - etc.

### Production (Vercel)
1. Go to Project Settings → Environment Variables
2. Add variables for Production environment
3. Redeploy to apply changes

## 🛡️ Security Best Practices

### API Key Management
- Use different keys for development/staging/production
- Set up API key restrictions where possible:
  - Domain restrictions
  - IP restrictions
  - Rate limiting
- Monitor API usage for unusual activity

### Database Security
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Public leaderboard has specific policies
- Regular security audits

### Client-Side Security
- All API calls go through Supabase (no direct external API calls)
- Input validation on all forms
- XSS protection through React's built-in escaping
- HTTPS enforced in production

## 🔍 Security Monitoring

### Automated Checks
- API key validation on app startup
- Security status component in development
- Environment validation
- Error message sanitization

### Manual Checks
- Review API usage monthly
- Check for exposed keys in logs
- Audit user permissions
- Update dependencies regularly

## 🚨 Security Incident Response

### If API Keys Are Exposed
1. **Immediately rotate all exposed keys**
2. Check API usage for unauthorized activity
3. Update all environments with new keys
4. Review git history for key exposure
5. Consider using git-secrets or similar tools

### If Database Is Compromised
1. Check RLS policies are working
2. Review user access patterns
3. Audit recent database changes
4. Update Supabase project if needed

## 📋 Security Checklist

### Before Deployment
- [x] `.env` file is not committed
- [x] All required environment variables are set
- [x] API keys are production-ready (not test/demo keys)
- [x] HTTPS is enforced
- [x] RLS policies are tested
- [x] Error handling doesn't expose sensitive data

### Regular Maintenance
- [ ] Rotate API keys monthly
- [ ] Update dependencies
- [ ] Review API usage
- [ ] Check security logs
- [ ] Test RLS policies
- [ ] Audit user permissions

## 🔗 Resources

- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

## 📞 Support

If you discover a security vulnerability, please email security@dreamadvisor.app instead of creating a public issue.