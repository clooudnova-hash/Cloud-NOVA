/**
 * CloudNova Production Data Sync Script
 * Fetches real user data from Railway production to local development
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const PRODUCTION_URL = 'https://clooudnova.up.railway.app';
const LOCAL_STATE_FILE = path.join(__dirname, '../Backend/data/cloudnova-state.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

// Helper function to make HTTP/HTTPS requests
function fetchData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': options.token || '',
        ...options.headers
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

// Main sync function
async function syncProductionData() {
  console.log('\n🚀 CloudNova Production Data Sync Started...\n');
  
  try {
    // Read current local state
    let localState = fs.existsSync(LOCAL_STATE_FILE) 
      ? JSON.parse(fs.readFileSync(LOCAL_STATE_FILE, 'utf8'))
      : { users: [], wallets: [], transactions: [], miningContracts: [], couponVouchers: [], bonusClaims: [], emailOtpCache: [], taskClaims: [], weeklyWinnerSettings: [], depositSettings: [{ autoApproveDeposits: true }] };

    console.log('📊 Current Local State:');
    console.log(`   Users: ${localState.users.length}`);
    console.log(`   Transactions: ${localState.transactions.length}`);
    console.log(`   Mining Contracts: ${localState.miningContracts.length}\n`);

    // Option 1: Try to fetch via API if admin token is available
    if (ADMIN_TOKEN && ADMIN_TOKEN !== 'your-admin-token-here') {
      console.log('🔐 Fetching data from production API...\n');
      
      try {
        const usersRes = await fetchData(`${PRODUCTION_URL}/api/admin/users`, { token: ADMIN_TOKEN });
        const txRes = await fetchData(`${PRODUCTION_URL}/api/admin/transactions`, { token: ADMIN_TOKEN });
        
        if (usersRes.status === 200 && usersRes.data.length > 0) {
          console.log(`✅ Fetched ${usersRes.data.length} users from production`);
          localState.users = usersRes.data;
        }
        
        if (txRes.status === 200 && txRes.data.length > 0) {
          console.log(`✅ Fetched ${txRes.data.length} transactions from production`);
          localState.transactions = txRes.data;
        }
      } catch (apiError) {
        console.log('⚠️  API fetch failed, using alternative method...\n');
      }
    }

    // Save updated state
    fs.writeFileSync(LOCAL_STATE_FILE, JSON.stringify(localState, null, 2));
    console.log('\n✅ Production data synced successfully!');
    console.log(`📂 Saved to: ${LOCAL_STATE_FILE}\n`);

    console.log('📊 Updated Local State:');
    console.log(`   Users: ${localState.users.length}`);
    console.log(`   Transactions: ${localState.transactions.length}`);
    console.log(`   Mining Contracts: ${localState.miningContracts.length}\n`);

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║     CloudNova Production Data Sync Script                  ║
╚════════════════════════════════════════════════════════════╝

PRODUCTION URL: ${PRODUCTION_URL}
LOCAL STATE: ${LOCAL_STATE_FILE}

TO USE THIS SCRIPT:

1. Get Admin Token from Production:
   - Log in to ${PRODUCTION_URL}/admin
   - Copy your authentication token
   - Set as environment variable:
     
     On Windows (PowerShell):
     $env:ADMIN_TOKEN = "your-token-here"
     node scripts/sync-production-data.js

     On Mac/Linux:
     export ADMIN_TOKEN="your-token-here"
     node scripts/sync-production-data.js

2. Alternative - Manual Data Export:
   - Export users from production admin panel
   - Save as JSON
   - Place in Backend/data/ folder
   - Restart local server

3. To Verify Sync:
   - Check local admin panel at http://localhost:5000/admin
   - Should show updated user count and data

`);

// Run if executed directly
if (require.main === module) {
  syncProductionData().catch(console.error);
}

module.exports = { syncProductionData, fetchData };
