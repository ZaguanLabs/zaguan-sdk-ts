# NPM Publishing Setup - Quick Checklist

## ✅ What's Already Done

- [x] Created `.github/workflows/publish.yml` - Automated publishing workflow
- [x] Added `publishConfig` to `package.json` - Set to public access
- [x] Created comprehensive `NPM_PUBLISHING_GUIDE.md`
- [x] Package is built and tested (v1.1.0)
- [x] Git tag v1.1.0 exists and is pushed

## 📋 What You Need to Do

### 1. Create npm Account (5 minutes)
- [ ] Go to https://www.npmjs.com/signup
- [ ] Create account with email/password
- [ ] Verify email address
- [ ] Enable 2FA (recommended)

### 2. Get npm Access Token (2 minutes)
- [ ] Log in to npm
- [ ] Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- [ ] Click "Generate New Token" → "Classic Token"
- [ ] Select **Automation** type
- [ ] Copy the token (starts with `npm_...`)
- [ ] Save it securely!

### 3. Handle Package Scope (Choose One)

#### Option A: Use @zaguan scope (Recommended)
- [ ] Create organization at https://www.npmjs.com/org/create
- [ ] Name it `zaguan`
- [ ] Choose free plan (public packages)
- [ ] Package will be `@zaguan_ai/sdk` ✅

#### Option B: Use your personal scope
- [ ] Change package name in `package.json` to `@yourusername/zaguan-sdk`
- [ ] Update README and documentation with new name

#### Option C: Use unscoped name
- [ ] Change package name in `package.json` to `zaguan-sdk`
- [ ] Check availability: `npm view zaguan-sdk`
- [ ] Update README and documentation

### 4. Add npm Token to GitHub (2 minutes)
- [ ] Go to https://github.com/ZaguanLabs/zaguan-sdk-ts/settings/secrets/actions
- [ ] Click "New repository secret"
- [ ] Name: `NPM_TOKEN`
- [ ] Value: Paste your npm token
- [ ] Click "Add secret"

### 5. Test Locally First (Optional but Recommended)
```bash
# Login to npm
npm login

# Test what will be published
npm publish --dry-run

# See the package contents
npm pack
tar -tzf zaguan-sdk-1.1.0.tgz

# Manually publish first time (optional)
npm publish --access public
```

### 6. Create GitHub Release to Trigger Auto-Publish
- [ ] Go to https://github.com/ZaguanLabs/zaguan-sdk-ts/releases/new
- [ ] Choose tag: `v1.1.0`
- [ ] Release title: `Release v1.1.0`
- [ ] Description: Copy from CHANGELOG.md
- [ ] Click "Publish release"
- [ ] Watch the workflow run in Actions tab

### 7. Verify Publication
- [ ] Check https://www.npmjs.com/package/@zaguan_ai/sdk
- [ ] Verify version 1.1.0 is live
- [ ] Test installation: `npm install @zaguan_ai/sdk`

## 🚀 Quick Start Commands

```bash
# 1. Create npm account (web browser)
# 2. Get token (web browser)
# 3. Add token to GitHub secrets (web browser)

# 4. Test locally (optional)
npm login
npm publish --dry-run

# 5. Create GitHub Release (web browser)
# The workflow will automatically publish!
```

## ⚡ Super Quick Path (Minimal Steps)

If you want to get published ASAP:

1. **Create npm account** (5 min)
2. **Get automation token** (2 min)
3. **Add NPM_TOKEN to GitHub secrets** (2 min)
4. **Create GitHub Release for v1.1.0** (2 min)
5. **Done!** Workflow publishes automatically

Total time: ~11 minutes

## 📞 Need Help?

See the full guide: `NPM_PUBLISHING_GUIDE.md`

## 🔒 Security Reminders

- ✅ Use "Automation" token type (not "Publish")
- ✅ Enable 2FA on npm account
- ✅ Never commit npm tokens to git
- ✅ Keep tokens in GitHub Secrets only
