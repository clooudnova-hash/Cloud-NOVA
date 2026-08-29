# CloudNova Production Data Import Guide

## 🎯 Goal
Fetch real user data from your Railway production server to see on local admin panel

---

## 📋 Prerequisites

You need ONE of these:
1. ✅ **Admin Token** from production login
2. ✅ **Database credentials** (PostgreSQL)
3. ✅ **Direct API access** to production endpoints

---

## Method 1: Using Admin Token (Easiest) 🔐

### Step 1: Get Admin Token from Production
```
1. Go to https://clooudnova.up.railway.app
2. Click "Sign In" → Login with admin credentials
3. Open Browser Developer Tools (F12)
4. Go to Application/Storage → Local Storage
5. Look for "token" or "auth" key
6. Copy the token value
```

### Step 2: Export Production Data
Run this command in PowerShell:
```powershell
cd "c:\Users\PC\Desktop\Minning Project\CloudNova_Full latest hamza"

$env:ADMIN_TOKEN = "paste-your-token-here"
node scripts/sync-production-data.js
```

### Step 3: Verify Import
- Open http://localhost:5000/admin
- Check if user count increased
- View Referral Teams tab for real data

---

## Method 2: Manual JSON Export 📥

### Step 1: Export from Production Admin
```
1. Log in to https://clooudnova.up.railway.app/admin
2. Open Browser Console (F12 → Console)
3. Paste this code:

fetch('/api/admin/users')
  .then(r => r.json())
  .then(data => {
    console.log(data);
    // Copy all data from console
  });

4. Right-click console → Save as JSON file
5. Save as: production-users.json
```

### Step 2: Import to Local
```
1. Copy production-users.json to:
   Backend/data/production-users.json

2. Update Backend/data/cloudnova-state.json:
   - Replace "users" array with production data
   - Keep other fields (wallets, transactions, etc)

3. Restart local server:
   npm start
```

---

## Method 3: Database Connection 🗄️

### If you have PostgreSQL credentials:
```
DATABASE_URL=your-railway-postgres-url
node scripts/sync-production-data.js
```

---

## 📊 What Gets Imported?

✅ All users (with profiles, balances, VIP levels)
✅ Referral teams (3-level structure)
✅ Mining contracts (machines purchased)
✅ Transactions (deposits, withdrawals)
✅ Wallet data (balances, hashrate)
✅ Bonus codes (used/unused)
✅ Task claims

---

## 🔍 Verify Import Success

After import, check:

1. **Dashboard**: 
   - User count should match production
   - Total Transactions updated

2. **Users Tab**:
   - See all users with real data
   - Click search to find specific users

3. **Referral Teams Tab**:
   - View team structure (Level 1, 2, 3)
   - See deposits and withdrawals

4. **Transactions Tab**:
   - View all deposits/withdrawals
   - Check pending approvals

---

## ⚠️ Important Notes

- **Backup First**: Local data will be replaced
- **Read-Only Option**: Import, then view only (don't modify)
- **Regular Sync**: You can run this anytime to update
- **Credentials Safe**: Token/DB credentials not stored in repo

---

## 🆘 Troubleshooting

**"401 Unauthorized"**
- Token expired or invalid
- Get new token from production login

**"No data imported"**
- Check if admin token is correct
- Verify production server is running
- Check API endpoints are accessible

**"Permission denied"**
- Admin user doesn't have proper permissions
- Use production admin account only

---

## 📞 Next Steps

1. **Option A**: Give me admin token → I run sync script
2. **Option B**: You run export command → Send JSON file
3. **Option C**: Share database credentials → I connect directly

**Tell me which option and provide the credentials!** 🚀
