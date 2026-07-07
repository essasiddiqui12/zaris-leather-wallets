# 🚀 Supabase Setup Guide for Zaris

Follow these steps to set up your database so products sync across all devices!

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Verify your email if needed

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name:** `zaris-store` (or any name you like)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to India (e.g., Mumbai or Singapore)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Set Up Database Tables

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from your Zaris folder
4. Copy ALL the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** button (bottom right)
7. You should see "Success. No rows returned" ✅

## Step 4: Get Your API Keys

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"** under Project Settings
3. You'll see two important values:

### Copy These Values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon/public Key:** (long text starting with "eyJ...")
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Give Me These Keys

Reply with:
```
Project URL: [paste here]
API Key: [paste here]
```

⚠️ **Important:** These are PUBLIC keys (safe to share with me). Don't share the `service_role` key!

## After You Give Me the Keys:

I'll integrate them into your website, and then:
- ✅ Products added on laptop will show on phone
- ✅ All devices will see the same products
- ✅ Orders will be saved permanently
- ✅ Admin panel will work from anywhere
- ✅ Data won't be lost when clearing browser cache

---

Ready? Go through Steps 1-4 and send me your keys! 🎯
