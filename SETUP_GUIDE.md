# 🎯 Complete Setup Guide - Zaris Application

This guide will walk you through setting up the entire Zaris application from scratch.

## ⏱️ Estimated Time: 15-20 minutes

---

## Step 1: Install Prerequisites (5 minutes)

### Node.js and npm
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (v18 or higher)
3. Install and verify:
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

### Git (Optional but recommended)
1. Go to [git-scm.com](https://git-scm.com/)
2. Download and install
3. Verify: `git --version`

---

## Step 2: Set Up Supabase (5 minutes)

### Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Create New Project
1. Click "New Project"
2. Choose organization (or create one)
3. Fill in project details:
   - **Name**: zaris-app (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Run Database Schema
1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `database/schema.sql` from your Zaris project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Enable Email Authentication
1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **Email** provider
3. Make sure it's enabled (toggle on)
4. Click **Save** if you made changes

### Get Your Credentials
1. Go to **Project Settings** → **API** (gear icon in sidebar)
2. You'll need three values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with "eyJ...")
   - **service_role** key (click "Reveal" to see it)
3. **Keep these safe!** You'll need them in the next steps

---

## Step 3: Install Frontend Dependencies (3 minutes)

1. Open terminal/command prompt
2. Navigate to the frontend directory:
```bash
cd path/to/Zaris/frontend
```

3. Install dependencies:
```bash
npm install
```

4. Wait for installation to complete (may take 2-3 minutes)

---

## Step 4: Configure Frontend (2 minutes)

1. In the `frontend` folder, create a new file called `.env`
2. Copy this template and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
VITE_API_URL=http://localhost:5000/api
```

3. Replace:
   - `https://xxxxx.supabase.co` with your Project URL
   - `eyJhbGc...your-anon-key-here` with your anon public key

4. Save the file

---

## Step 5: Install Backend Dependencies (3 minutes)

1. Open a **new terminal window** (keep the first one open)
2. Navigate to the backend directory:
```bash
cd path/to/Zaris/backend
```

3. Install dependencies:
```bash
npm install
```

4. Wait for installation to complete

---

## Step 6: Configure Backend (2 minutes)

1. In the `backend` folder, create a new file called `.env`
2. Copy this template and fill in your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-role-key-here

FRONTEND_URL=http://localhost:3000
```

3. Replace with your actual values:
   - Project URL
   - anon public key
   - **service_role key** (this is different from anon key!)

4. Save the file

**⚠️ Important**: The service_role key should NEVER be shared or committed to git!

---

## Step 7: Start the Application (2 minutes)

You'll need **two terminal windows**:

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

### Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.1.4  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## Step 8: Test the Application (5 minutes)

1. Open your browser and go to `http://localhost:3000`
2. You should see the Zaris login page

### Create Your First Account
1. Click **"Sign up"**
2. Enter your email and a password (min 6 characters)
3. Click **"Sign Up"**
4. You'll be automatically logged in!

### Test the Dashboard
- You should see the dashboard with stats (all showing 0)
- You should see your email in the top right

### Create Your First Project
1. Click **"Projects"** in the sidebar
2. Click **"+ New Project"** button
3. Fill in the form:
   - Title: "My First Project"
   - Description: "Testing the app"
   - Status: Active
4. Click **"Create Project"**
5. You should see your project appear!

### Verify Everything Works
- Go back to **Dashboard** - stats should now show "1" total project
- Try deleting the project
- Try creating a few more projects
- Check that the counts update

---

## 🎉 Congratulations!

Your Zaris application is now fully set up and running!

---

## 📋 Quick Reference

### Start the App (after initial setup)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Supabase Dashboard: `https://supabase.com/dashboard`

### Stop the App
Press `Ctrl + C` in each terminal window

---

## ❓ Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend won't connect to backend
- Check both servers are running
- Verify `VITE_API_URL=http://localhost:5000/api` in frontend/.env
- Check for CORS errors in browser console

### Can't log in
- Verify email provider is enabled in Supabase
- Check your Supabase credentials in .env files
- Look for errors in browser console (F12)

### Projects not showing
- Check you're logged in
- Verify RLS policies were created (run schema.sql again)
- Check Network tab in browser dev tools for errors

### Port already in use
```bash
# Change the port in backend/.env
PORT=5001

# And update frontend/.env
VITE_API_URL=http://localhost:5001/api
```

---

## 🆘 Still Having Issues?

1. Check the main README.md for more details
2. Look at the database/README.md for Supabase-specific help
3. Check browser console (F12) for error messages
4. Check terminal for server errors

---

## 🚀 Next Steps

- Customize the UI colors in `frontend/src/index.css`
- Add more fields to projects
- Create additional features
- Deploy to production (see README.md)

Happy coding! 🎉
