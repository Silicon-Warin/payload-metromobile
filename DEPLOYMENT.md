# Payload CMS Deployment Guide

## Prerequisites

- Vercel account with project created
- Neon PostgreSQL database (production)
- Vercel Blob Storage configured

## Environment Variables

Set these environment variables in Vercel project settings:

### Database

```env
POSTGRES_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Get from Neon dashboard → Connection string (Pooled)

### Payload Core

```env
PAYLOAD_SECRET=<generate-random-32-char-string>
```

Generate with: `openssl rand -base64 32`

### Server URL

```env
NEXT_PUBLIC_SERVER_URL=https://your-payload-domain.vercel.app
```

**Important:** No trailing slash

### Cron Jobs

```env
CRON_SECRET=<generate-random-string>
```

Used for scheduled tasks and maintenance

### Preview Mode

```env
PREVIEW_SECRET=<generate-random-string>
```

Used for draft preview functionality

### Frontend Revalidation

```env
FRONTEND_URL=https://bydmetromobile.com
PAYLOAD_REVALIDATE_SECRET=<generate-random-string>
```

**Important:** `PAYLOAD_REVALIDATE_SECRET` must match the same value in frontend project

### Vercel Blob Storage

```env
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

Get from Vercel dashboard → Storage → Blob → Show secret

## Deployment Steps

### 1. Initial Setup

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm payload migrate

# Seed admin user
pnpm seed:admin

# Seed Header/Footer globals
pnpm seed:globals
```

### 2. Deploy to Vercel

```bash
# Push to main branch
git push origin main

# Vercel will auto-deploy
```

Or deploy manually:

```bash
vercel --prod
```

### 3. Post-Deployment

1. **Verify database connection**
   - Check Vercel deployment logs
   - Ensure migrations ran successfully

2. **Create admin user** (if not seeded)
   ```bash
   vercel env pull .env.local
   pnpm seed:admin
   ```

3. **Seed globals** (if not seeded)
   ```bash
   pnpm seed:globals
   ```

4. **Test admin access**
   - Visit `https://your-payload-domain.vercel.app/admin`
   - Login with: `bydmetro@nextmail.dev` / `Test998724!!`

5. **Test revalidation webhook**
   - Create/publish a promotion
   - Check frontend for updated content

## Troubleshooting

### Database Connection Issues

- Verify `POSTGRES_URL` is correct
- Check Neon database is running
- Ensure SSL mode is enabled (`?sslmode=require`)

### Migration Errors

```bash
# Reset migrations (DANGER: drops all data)
pnpm payload migrate:reset

# Run migrations again
pnpm payload migrate
```

### Blob Storage Issues

- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob Storage is enabled
- Test upload in Media collection

### Revalidation Not Working

- Verify `PAYLOAD_REVALIDATE_SECRET` matches in both projects
- Check `FRONTEND_URL` is correct
- Test webhook manually:
  ```bash
  curl -X POST https://bydmetromobile.com/api/revalidate/promotion \
    -H "x-revalidate-secret: YOUR_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"slug": "test-promo"}'
  ```

## Security Checklist

- [ ] All secrets are randomly generated (32+ characters)
- [ ] `PAYLOAD_REVALIDATE_SECRET` matches in both projects
- [ ] Database uses SSL connection
- [ ] Admin password is changed from default
- [ ] CORS is properly configured
- [ ] Environment variables are not committed to git

## Maintenance

### Update Admin Password

```bash
# Run in Vercel console or locally with production env
pnpm payload
# Then use CLI to update user password
```

### Backup Database

```bash
# Use Neon dashboard to create backup
# Or use pg_dump:
pg_dump $POSTGRES_URL > backup.sql
```

### Monitor Logs

```bash
# View Vercel deployment logs
vercel logs --prod

# View specific deployment
vercel logs [deployment-url]
```

## Support

For issues, check:
- Vercel deployment logs
- Neon database logs
- Payload CMS documentation: https://payloadcms.com/docs
