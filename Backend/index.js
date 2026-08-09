require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve pre-built React frontend
const FRONTEND_BUILD = path.join(__dirname, '..', 'FrontEnd', 'build');
app.use(express.static(FRONTEND_BUILD));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'CloudNova2026';


const users = [];
const wallets = [];
const transactions = [];
const miningContracts = [];
const couponVouchers = [];
const bonusClaims = [];
const emailOtpCache = [];
const taskClaims = [];
const PROMO_MAX_FAILED_ATTEMPTS = 3;
const PROMO_LOCK_DURATION_MS = 60 * 60 * 1000;

const mockPasswordHash = bcrypt.hashSync('Admin@123', 10);
users.push({ id: 'usr_mock1', username: 'noor', fullName: 'Noor Zaman', email: 'noor@cloudnova.com', password: mockPasswordHash, role: 'admin', myReferralCode: 'NOOR99', referredBy: '', vipLevel: 'Bronze', paused: false, promoFailedAttempts: 0, promoLockedUntil: null });
wallets.push({ userId: 'usr_mock1', balance: 0, baseHashrate: 10.0, effectiveHashrate: 10.0, minersCount: 0 });

const findUpline = (referralCode) => users.find(user => user.myReferralCode === referralCode);

const getTeamTree = (userId) => {
  const levels = [[], [], []];
  let parentIds = [userId];
  for (let level = 0; level < 3; level += 1) {
    const members = users.filter(user => parentIds.includes(user.referredBy));
    levels[level] = members.map(user => {
      const deposits = transactions.filter(tx => tx.userId === user.id && tx.type === 'deposit');
      const latestDeposit = deposits.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return {
        id: user.id, username: user.username, fullName: user.fullName, referredBy: user.referredBy,
        depositStatus: latestDeposit ? latestDeposit.status : 'no_deposit',
        depositedAmount: deposits.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0)
      };
    });
    parentIds = members.map(user => user.id);
  }
  return levels;
};

const MINING_PLANS = {
  Starter: { cost: 10, dailyIncome: 0.50, durationDays: 40, hashrate: 5, limit: 1 },
  Pro: { cost: 20, dailyIncome: 0.67, durationDays: 60, hashrate: 15, limit: 1 },
  Enterprise: { cost: 50, dailyIncome: 2.00, durationDays: 90, hashrate: 50, limit: 2 }
};

const getMiningSummary = (userId) => miningContracts
  .filter(contract => contract.userId === userId)
  .map(contract => ({
    ...contract,
    status: new Date(contract.endDate) <= new Date() ? 'expired' : 'active'
  }));

const syncMiningWallet = (userId) => {
  const wallet = wallets.find(item => item.userId === userId);
  if (!wallet) return;
  const activeContracts = miningContracts.filter(contract => contract.userId === userId && new Date(contract.endDate) > new Date());
  wallet.minersCount = activeContracts.length;
  wallet.effectiveHashrate = Number((wallet.baseHashrate + activeContracts.reduce((sum, contract) => sum + contract.hashrate, 0)).toFixed(4));
};

const creditReferralRewards = (deposit) => {
  const depositor = users.find(user => user.id === deposit.userId);
  if (!depositor || !depositor.referredBy) return [];
  const rewards = [];
  let uplineId = depositor.referredBy;
  [0.06, 0.04, 0.02].forEach((rate, index) => {
    const upline = users.find(user => user.id === uplineId);
    if (!upline) return;
    const reward = Number((deposit.amount * rate).toFixed(4));
    const wallet = wallets.find(item => item.userId === upline.id);
    if (wallet && reward > 0) {
      wallet.balance = Number((wallet.balance + reward).toFixed(4));
      const rewardTransaction = { id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: upline.id, type: `Level ${index + 1} Deposit Reward`, amount: reward, network: 'Approved Team Deposit', txid: deposit.id, status: 'completed', date: new Date().toISOString(), sourceTransactionId: deposit.id, rate };
      transactions.push(rewardTransaction);
      rewards.push(rewardTransaction);
    }
    uplineId = upline.referredBy;
  });
  return rewards;
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Access Denied: Missing Header Token!' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    const user = users.find(item => item.id === req.user.id);
    if (!user) return res.status(401).json({ message: 'User account no longer exists.' });
    req.currentUser = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session Expired or Invalid Token Key!' });
  }
};

// OTP step bypassed — always returns success so the frontend can proceed
app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email address field cannot be blank!' });
  const normalizedEmail = email.toLowerCase().trim();
  const userExists = users.find(u => u.email === normalizedEmail);
  if (userExists) return res.status(400).json({ message: 'This email is already registered!' });
  // Store a fixed bypass code so the frontend OTP field passes validation
  const cacheIndex = emailOtpCache.findIndex(c => c.email === normalizedEmail);
  if (cacheIndex > -1) { emailOtpCache[cacheIndex].otp = '000000'; }
  else { emailOtpCache.push({ email: normalizedEmail, otp: '000000' }); }
  return res.status(200).json({ success: true, message: 'Proceed to register.' });
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const { fullName, email, password, referralCode, otpCode } = req.body;
    if (!fullName || !email || !password || !otpCode) return res.status(400).json({ message: 'Missing core signup fields!' });

    const normalizedEmail = email.toLowerCase().trim();
    // OTP verification bypassed

    if (users.find(u => u.email === normalizedEmail)) return res.status(400).json({ message: 'This email is already registered!' });

    const hashed = bcrypt.hashSync(password, 10);
    const ref = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newUserId = 'usr_' + Math.random().toString(36).substring(2, 9);

    const upline = referralCode ? findUpline(referralCode.trim()) : null;
    users.push({ id: newUserId, username: normalizedEmail.split('@')[0], fullName, email: normalizedEmail, password: hashed, role: 'user', myReferralCode: ref, referredBy: upline ? upline.id : '', vipLevel: 'Bronze', paused: false, promoFailedAttempts: 0, promoLockedUntil: null });
    wallets.push({ userId: newUserId, balance: 0, baseHashrate: 10.0, effectiveHashrate: 10.0, minersCount: 0 });

    const clearIdx = emailOtpCache.findIndex(c => c.email === normalizedEmail);
    if (clearIdx > -1) emailOtpCache.splice(clearIdx, 1);

    return res.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: 'Invalid Login Credentials!' });
    if (user.paused) return res.status(403).json({ message: 'This account is paused. Contact an administrator.' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ success: true, token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/user/dashboard', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    const wallet = wallets.find(w => w.userId === req.user.id);
    if (!user || !wallet) return res.status(404).json({ message: 'User record files missing!' });
    syncMiningWallet(user.id);

    return res.status(200).json({
      fullName: user.fullName, vipLevel: user.vipLevel, myReferralCode: user.myReferralCode,
      username: user.username, referredBy: user.referredBy, paused: user.paused,
      balance: wallet.balance, baseHashrate: wallet.baseHashrate, effectiveHashrate: wallet.effectiveHashrate, minersCount: wallet.minersCount,
      team: getTeamTree(user.id), miningContracts: getMiningSummary(user.id)
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/user/team', verifyToken, (req, res) => {
  return res.status(200).json({ team: getTeamTree(req.user.id), levels: { level1: '6%', level2: '4%', level3: '2%' } });
});

app.get('/api/mining/contracts', verifyToken, (req, res) => {
  syncMiningWallet(req.user.id);
  return res.status(200).json(getMiningSummary(req.user.id));
});

app.post('/api/mining/collect', verifyToken, (req, res) => {
  try {
    if (req.currentUser.paused) return res.status(403).json({ message: 'Mining is paused for this account.' });
    const now = new Date();
    const wallet = wallets.find(item => item.userId === req.user.id);
    syncMiningWallet(req.user.id);
    const earnings = [];
    miningContracts.filter(contract => contract.userId === req.user.id).forEach(contract => {
      const end = new Date(contract.endDate);
      const collectionEnd = end < now ? end : now;
      const lastCollected = new Date(contract.lastCollectedAt);
      const availableDays = Math.floor((collectionEnd - lastCollected) / 86400000);
      if (availableDays <= 0) return;
      const amount = Number((availableDays * contract.dailyIncome).toFixed(4));
      contract.lastCollectedAt = collectionEnd.toISOString();
      wallet.balance = Number((wallet.balance + amount).toFixed(4));
      const transaction = { id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: 'Mining Income', amount, network: 'CloudNova Mining', txid: contract.id, status: 'completed', date: now.toISOString(), days: availableDays, contractId: contract.id };
      transactions.push(transaction);
      earnings.push(transaction);
    });
    syncMiningWallet(req.user.id);
    return res.status(200).json({ success: true, credited: Number(earnings.reduce((sum, item) => sum + item.amount, 0).toFixed(4)), earnings, balance: wallet.balance, message: earnings.length ? 'Mining income collected.' : 'No mining income is available yet.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/wallet/deposit', verifyToken, (req, res) => {
  try {
    const { txid, network, amount } = req.body;
    const depositAmount = parseFloat(amount);
    if (!txid || !network || !Number.isFinite(depositAmount) || depositAmount <= 0) return res.status(400).json({ message: 'Valid deposit amount, network, and transaction ID are required.' });
    if (transactions.find(t => t.txid === txid)) return res.status(400).json({ message: 'Transaction hash already exists!' });

    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: 'deposit', amount: depositAmount, network, txid, status: 'pending', date: new Date().toISOString() });
    return res.status(201).json({ success: true, message: 'Deposit proof hash queued successfully' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/wallet/withdraw', verifyToken, (req, res) => {
  try {
    const { address, network, amount } = req.body;
    const wallet = wallets.find(w => w.userId === req.user.id);
    const amt = parseFloat(amount);
    const reserved = transactions.filter(t => t.userId === req.user.id && t.type === 'withdrawal' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    if (!address || !network || !Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Valid withdrawal details are required.' });
    if (wallet.balance - reserved < amt) return res.status(400).json({ message: 'Insufficient available balance' });

    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: 'withdrawal', amount: amt, network, txid: address, status: 'pending', date: new Date().toISOString() });
    return res.status(201).json({ success: true, message: 'Withdrawal locked inside pending approvals pipeline' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/wallet/history', verifyToken, (req, res) => {
  try {
    return res.status(200).json(transactions.filter(t => t.userId === req.user.id));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/plans/lease', verifyToken, (req, res) => {
  try {
    if (req.currentUser.paused) return res.status(403).json({ message: 'Mining is paused for this account.' });
    const { tier } = req.body;
    const wallet = wallets.find(w => w.userId === req.user.id);
    const plan = MINING_PLANS[tier];
    if (!plan) return res.status(400).json({ message: 'Invalid network tier selection' });
    syncMiningWallet(req.user.id);
    const purchasedCount = miningContracts.filter(contract => contract.userId === req.user.id && contract.tier === tier).length;
    if (purchasedCount >= plan.limit) return res.status(400).json({ message: `${tier} plan purchase limit reached.` });

    if (wallet.balance < plan.cost) return res.status(400).json({ message: 'Insufficient resources account balance' });

    wallet.balance = Number((wallet.balance - plan.cost).toFixed(4));
    wallet.effectiveHashrate += plan.hashrate;
    wallet.minersCount += 1;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);
    const contract = { id: 'mine_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, tier, cost: plan.cost, dailyIncome: plan.dailyIncome, durationDays: plan.durationDays, hashrate: plan.hashrate, startDate: startDate.toISOString(), endDate: endDate.toISOString(), lastCollectedAt: startDate.toISOString() };
    miningContracts.push(contract);

    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: `Lease ${tier}`, amount: plan.cost, network: 'Internal Server', txid: contract.id, status: 'completed', date: startDate.toISOString(), contractId: contract.id });
    return res.status(200).json({ success: true, contract, message: 'Mining contract activated successfully.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/change-password', verifyToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ message: 'Current password is incorrect.' });
    user.password = bcrypt.hashSync(newPassword, 10);
    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/bonus/claim', verifyToken, (req, res) => {
  try {
    const { code } = req.body;
    const user = req.currentUser;
    const now = Date.now();
    const lockedUntil = user.promoLockedUntil ? new Date(user.promoLockedUntil).getTime() : 0;
    if (lockedUntil > now) {
      return res.status(429).json({ message: 'Promo-code feature is locked for 1 hour after three invalid attempts.', retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) });
    }
    if (lockedUntil && lockedUntil <= now) {
      user.promoFailedAttempts = 0;
      user.promoLockedUntil = null;
    }

    const voucher = couponVouchers.find(c => c.code === String(code || '') && c.active);
    if (!voucher) {
      user.promoFailedAttempts = (user.promoFailedAttempts || 0) + 1;
      if (user.promoFailedAttempts >= PROMO_MAX_FAILED_ATTEMPTS) {
        user.promoLockedUntil = new Date(now + PROMO_LOCK_DURATION_MS).toISOString();
        return res.status(429).json({ message: 'Three invalid attempts reached. Promo-code feature locked for 1 hour.', retryAfterSeconds: 3600 });
      }
      return res.status(400).json({ message: `Voucher code invalid. ${PROMO_MAX_FAILED_ATTEMPTS - user.promoFailedAttempts} attempt(s) remaining.` });
    }
    if (bonusClaims.find(claim => claim.userId === user.id && claim.code === voucher.code)) return res.status(400).json({ message: 'You have already claimed this voucher.' });

    const wallet = wallets.find(w => w.userId === user.id);
    wallet.balance += voucher.bonus;
    user.promoFailedAttempts = 0;
    user.promoLockedUntil = null;
    bonusClaims.push({ userId: user.id, code: voucher.code, amount: voucher.bonus, date: new Date().toISOString() });
    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: user.id, type: 'Promo Code Reward', amount: voucher.bonus, network: 'Admin Promo Code', txid: voucher.code, status: 'completed', date: new Date().toISOString() });
    return res.status(200).json({ success: true, bonus: voucher.bonus, message: 'Voucher applied successfully!' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/metrics', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Restricted administrative zone!' });
  return res.status(200).json({ totalUsers: users.length, systemFunds: wallets.reduce((s, w) => s + w.balance, 0), activeContracts: transactions.length });
});

app.get('/api/admin/transactions', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  return res.status(200).json(transactions);
});

app.post('/api/admin/transactions/action', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  try {
    const { id, action } = req.body;
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'pending') return res.status(400).json({ message: 'Process already verified or closed' });

    if (action === 'approve') {
      tx.status = 'completed';
      if (tx.type === 'deposit') {
        const w = wallets.find(wall => wall.userId === tx.userId);
        if (w) w.balance += tx.amount;
        creditReferralRewards(tx);
      }
    } else if (action === 'reject') {
      tx.status = 'rejected';
      if (tx.type === 'withdrawal') {
        const w = wallets.find(wall => wall.userId === tx.userId);
        if (w) w.balance = Number(w.balance.toFixed(4));
      }
    } else return res.status(400).json({ message: 'Action must be approve or reject.' });
    if (action === 'approve' && tx.type === 'withdrawal') {
      const w = wallets.find(wall => wall.userId === tx.userId);
      if (!w || w.balance < tx.amount) {
        tx.status = 'pending';
        return res.status(400).json({ message: 'Insufficient balance to approve this withdrawal.' });
      }
      w.balance = Number((w.balance - tx.amount).toFixed(4));
    }
    return res.status(200).json({ success: true, message: 'Status updated' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: list all users
app.get('/api/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  const result = users.map(u => {
    const w = wallets.find(wl => wl.userId === u.id) || {};
    const upline = users.find(user => user.id === u.referredBy);
    return { id: u.id, username: u.username, fullName: u.fullName, email: u.email, role: u.role, vipLevel: u.vipLevel, myReferralCode: u.myReferralCode, referredBy: u.referredBy, referredByUser: upline ? { username: upline.username, fullName: upline.fullName } : null, paused: Boolean(u.paused), balance: w.balance || 0, minersCount: w.minersCount || 0 };
  });
  return res.status(200).json(result);
});

app.post('/api/admin/users/pause', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  const user = users.find(item => item.id === req.body.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.id === req.user.id) return res.status(400).json({ message: 'You cannot pause the current admin account.' });
  user.paused = req.body.paused === undefined ? !user.paused : Boolean(req.body.paused);
  return res.status(200).json({ success: true, paused: user.paused, message: user.paused ? 'User paused.' : 'User resumed.' });
});

app.delete('/api/admin/users/:userId', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  if (req.params.userId === req.user.id) return res.status(400).json({ message: 'You cannot remove the current admin account.' });
  const index = users.findIndex(item => item.id === req.params.userId);
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  users.splice(index, 1);
  const walletIndex = wallets.findIndex(item => item.userId === req.params.userId);
  if (walletIndex !== -1) wallets.splice(walletIndex, 1);
  for (let index = transactions.length - 1; index >= 0; index -= 1) if (transactions[index].userId === req.params.userId) transactions.splice(index, 1);
  for (let index = bonusClaims.length - 1; index >= 0; index -= 1) if (bonusClaims[index].userId === req.params.userId) bonusClaims.splice(index, 1);
  return res.status(200).json({ success: true, message: 'User removed.' });
});

// Admin: adjust user balance (credit or debit)
app.post('/api/admin/users/adjust-balance', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  try {
    const { userId, amount, note } = req.body;
    if (!userId || amount == null) return res.status(400).json({ message: 'userId and amount are required' });
    const wallet = wallets.find(w => w.userId === userId);
    const user = users.find(u => u.id === userId);
    if (!wallet || !user) return res.status(404).json({ message: 'User not found' });
    const adj = parseFloat(amount);
    if (isNaN(adj)) return res.status(400).json({ message: 'Invalid amount' });
    const newBalance = Number((wallet.balance + adj).toFixed(4));
    if (newBalance < 0) return res.status(400).json({ message: 'Balance cannot go below zero' });
    wallet.balance = newBalance;
    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId, type: adj >= 0 ? 'Admin Credit' : 'Admin Debit', amount: Math.abs(adj), network: 'Admin Panel', txid: note || 'Manual adjustment', status: 'completed', date: new Date().toISOString() });
    return res.status(200).json({ success: true, message: `Balance updated to $${newBalance.toFixed(2)}`, newBalance });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: set user VIP level
app.post('/api/admin/users/set-vip', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  try {
    const { userId, vipLevel } = req.body;
    const allowed = ['Bronze', 'Silver', 'Gold', 'Diamond', 'LV1', 'LV2', 'LV3'];
    if (!userId || !allowed.includes(vipLevel)) return res.status(400).json({ message: 'Invalid userId or vipLevel' });
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.vipLevel = vipLevel;
    return res.status(200).json({ success: true, message: `VIP level updated to ${vipLevel}` });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: list bonus codes
app.get('/api/admin/bonus', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  return res.status(200).json(couponVouchers);
});

// Admin: add bonus code
app.post('/api/admin/bonus/add', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  try {
    const { code, bonus } = req.body;
    const reward = parseFloat(bonus);
    const exactCode = String(code || '').trim();
    if (!exactCode || !Number.isFinite(reward) || reward <= 0) return res.status(400).json({ message: 'Code and a positive reward amount are required' });
    if (couponVouchers.find(c => c.code === exactCode)) return res.status(400).json({ message: 'Code already exists' });
    couponVouchers.push({ code: exactCode, bonus: reward, active: true });
    return res.status(201).json({ success: true, message: 'Bonus code added!' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: toggle bonus code active/inactive
app.post('/api/admin/bonus/toggle', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  const { code } = req.body;
  const voucher = couponVouchers.find(c => c.code === code);
  if (!voucher) return res.status(404).json({ message: 'Code not found' });
  voucher.active = !voucher.active;
  return res.status(200).json({ success: true, active: voucher.active });
});

// Admin: delete bonus code
app.delete('/api/admin/bonus/:code', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  const idx = couponVouchers.findIndex(c => c.code === req.params.code);
  if (idx === -1) return res.status(404).json({ message: 'Code not found' });
  couponVouchers.splice(idx, 1);
  return res.status(200).json({ success: true, message: 'Deleted' });
});

// User: get own task claim statuses
app.get('/api/tasks/my-claims', verifyToken, (req, res) => {
  const mine = taskClaims.filter(c => c.userId === req.user.id);
  return res.status(200).json(mine);
});

// Allowed task IDs and their rewards — single source of truth (string keys to avoid type ambiguity)
const TASK_REWARDS = { '1': 0.50, '2': 1.00, '3': 2.50 };

// User: submit a task reward claim
app.post('/api/tasks/claim', verifyToken, (req, res) => {
  try {
    const { taskId, taskName } = req.body;
    if (taskId == null || !taskName) return res.status(400).json({ message: 'taskId and taskName are required.' });
    const tid = String(taskId).trim();
    if (!TASK_REWARDS.hasOwnProperty(tid)) return res.status(400).json({ message: 'Invalid task ID.' });
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const approved = taskClaims.find(c => c.userId === req.user.id && c.taskId === tid && c.status === 'approved');
    if (approved) return res.status(400).json({ message: 'You have already received the reward for this task.' });
    const reward = TASK_REWARDS[tid];
    const claim = {
      id: 'tc_' + Math.random().toString(36).substring(2, 9),
      userId: req.user.id,
      userEmail: user.email,
      userName: user.fullName,
      taskId: tid,
      taskName,
      status: 'approved',
      reward,
      date: new Date().toISOString()
    };
    taskClaims.push(claim);
    const wallet = wallets.find(w => w.userId === user.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found.' });
    wallet.balance = Number((wallet.balance + reward).toFixed(4));
    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: user.id, type: 'Task Reward', amount: reward, network: 'Automatic Task Claim', txid: claim.id, status: 'completed', date: claim.date, taskId: tid });
    return res.status(201).json({ success: true, reward, message: `Task approved automatically. $${reward.toFixed(2)} added to your wallet.` });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: get all task claims
app.get('/api/admin/task-claims', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  return res.status(200).json(taskClaims.slice().reverse());
});

// Admin: approve or reject a task claim
app.post('/api/admin/task-claims/action', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  return res.status(410).json({ message: 'Task claims are auto-approved; no admin action is required.' });
});

// Socket.io chat relay
io.on('connection', (socket) => {
  socket.on('sendMessage', (data) => { io.emit('receiveMessage', data); });
});

// Temporary: download full source zip
app.get('/download-source', (req, res) => {
  const zipPath = path.join(__dirname, '..', 'CloudNova_Full.zip');
  res.download(zipPath, 'CloudNova_Full.zip');
});

// Catch-all: serve React frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================\n🚀 CLOUDNOVA SERVER LIVE ON PORT: ${PORT}\n=========================================`);
});
