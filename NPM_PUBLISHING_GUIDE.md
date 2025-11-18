# NPM Publishing Guide

This guide walks you through setting up automated npm publishing for the Zaguán SDK.

## Prerequisites

1. **npm Account** - Create an account at https://www.npmjs.com/signup
2. **Package Name** - Verify `@zaguan/sdk` is available (or you own the `@zaguan` scope)
3. **GitHub Repository** - Admin access to set up secrets

## Step 1: Create npm Account & Get Token

### 1.1 Create npm Account
1. Go to https://www.npmjs.com/signup
2. Create your account
3. Verify your email address

### 1.2 Create an npm Access Token
1. Log in to npm
2. Click your profile picture → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** type (for CI/CD)
5. Copy the token (starts with `npm_...`)
6. **Save it securely** - you won't see it again!

## Step 2: Set up npm Organization (if using scoped package)

Since the package is `@zaguan/sdk`, you need the `@zaguan` scope:

### Option A: Create Organization
1. Go to https://www.npmjs.com/org/create
2. Create organization named `zaguan`
3. Choose plan (free is fine for public packages)

### Option B: Use Personal Scope
1. Change package name in `package.json` to `zaguan-sdk` (without @scope)
2. Or use your username: `@yourusername/zaguan-sdk`

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token from Step 1.2
6. Click **Add secret**

## Step 4: Verify package.json Configuration

The `package.json` should have:

```json
{
  "name": "@zaguan/sdk",
  "version": "1.1.0",
  "publishConfig": {
    "access": "public"
  }
}
```

If using a scoped package (`@zaguan/sdk`), you MUST set `"access": "public"` or it will try to publish as private (requires paid plan).

## Step 5: Test Publishing Locally (Optional but Recommended)

Before automating, test the publish process:

```bash
# Login to npm
npm login

# Dry run to see what would be published
npm publish --dry-run

# Check the files that will be included
npm pack
tar -tzf zaguan-sdk-1.1.0.tgz

# If everything looks good, publish manually first
npm publish --access public
```

## Step 6: How the Automated Publishing Works

The workflow (`.github/workflows/publish.yml`) will:

1. **Trigger**: Automatically run when you create a GitHub Release
2. **Build**: Install dependencies and build the package
3. **Test**: Run all tests to ensure quality
4. **Publish**: Push to npm with provenance (supply chain security)

### Creating a Release to Trigger Publishing

```bash
# You already have the tag, so just create a GitHub Release:
# 1. Go to: https://github.com/ZaguanLabs/zaguan-sdk-ts/releases
# 2. Click "Draft a new release"
# 3. Choose tag: v1.1.0
# 4. Title: "Release v1.1.0"
# 5. Description: Copy from CHANGELOG.md
# 6. Click "Publish release"
```

The workflow will automatically publish to npm!

## Step 7: Verify Publication

After the workflow completes:

1. Check npm: https://www.npmjs.com/package/@zaguan/sdk
2. Verify version shows 1.1.0
3. Test installation:
   ```bash
   npm install @zaguan/sdk
   ```

## Alternative: Manual Publishing

If you prefer manual control:

```bash
# 1. Ensure you're on the right version
npm version 1.1.0

# 2. Build
npm run build

# 3. Test
npm run test:run

# 4. Publish
npm publish --access public
```

## Troubleshooting

### Error: "You must sign up for private packages"
**Solution**: Add to `package.json`:
```json
"publishConfig": {
  "access": "public"
}
```

### Error: "You do not have permission to publish"
**Solutions**:
- Verify you own the `@zaguan` scope
- Or change package name to unscoped: `zaguan-sdk`
- Or use your username: `@yourusername/zaguan-sdk`

### Error: "Package name too similar to existing package"
**Solution**: Choose a different name or contact npm support

### Error: "Invalid token"
**Solutions**:
- Regenerate npm token
- Ensure token type is "Automation"
- Update GitHub secret with new token

### Workflow doesn't trigger
**Solutions**:
- Ensure you created a GitHub **Release** (not just a tag)
- Check workflow permissions in repo settings
- Verify workflow file is in `.github/workflows/`

## Security Best Practices

1. ✅ **Never commit npm tokens** to git
2. ✅ **Use Automation tokens** for CI/CD (not Classic tokens with full access)
3. ✅ **Enable 2FA** on your npm account
4. ✅ **Use provenance** (included in workflow) for supply chain security
5. ✅ **Review published files** with `npm pack` before publishing
6. ✅ **Use semantic versioning** for releases

## Package Scope Recommendations

For `@zaguan/sdk`:
- ✅ Professional appearance
- ✅ Prevents naming conflicts
- ✅ Allows multiple packages under same scope
- ❌ Requires organization or personal scope ownership

For `zaguan-sdk`:
- ✅ Simpler setup (no scope needed)
- ✅ Easier to claim
- ❌ More likely to have naming conflicts
- ❌ Less professional appearance

## Next Steps

1. [ ] Create npm account
2. [ ] Get npm access token
3. [ ] Add NPM_TOKEN to GitHub secrets
4. [ ] Verify package name availability
5. [ ] Add `publishConfig` to package.json if needed
6. [ ] Test with `npm publish --dry-run`
7. [ ] Create GitHub Release for v1.1.0
8. [ ] Verify automated publish works
9. [ ] Test installation from npm

## Useful Commands

```bash
# Check who you're logged in as
npm whoami

# View package info
npm view @zaguan/sdk

# Check what files will be published
npm pack --dry-run

# Unpublish a version (within 72 hours)
npm unpublish @zaguan/sdk@1.1.0

# Deprecate a version
npm deprecate @zaguan/sdk@1.1.0 "Use version 1.1.1 instead"
```

## Support

- npm documentation: https://docs.npmjs.com/
- GitHub Actions: https://docs.github.com/en/actions
- npm provenance: https://docs.npmjs.com/generating-provenance-statements
