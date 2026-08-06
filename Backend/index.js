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
const JWT_SECRET = process.env.JWT_SECRET || 'CLOUD_NOVA_MASTER_SECRET_KEY_2026';


const users = [];
const wallets = [];
const transactions = [];
const couponVouchers = [
  { code: 'NOVA50', bonus: 50.0, active: true },
  { code: 'FREE10', bonus: 10.0, active: true }
];
const emailOtpCache = [];
const taskClaims = [];

const mockPasswordHash = bcrypt.hashSync('Admin@123', 10);
users.push({ id: 'usr_mock1', fullName: 'Noor Zaman', email: 'noor@cloudnova.com', password: mockPasswordHash, role: 'admin', myReferralCode: 'NOOR99', referredBy: '', vipLevel: 'Bronze' });
wallets.push({ userId: 'usr_mock1', balance: 0.4000, baseHashrate: 10.0, effectiveHashrate: 10.0, minersCount: 0 });

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Access Denied: Missing Header Token!' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
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

    users.push({ id: newUserId, fullName, email: normalizedEmail, password: hashed, role: 'user', myReferralCode: ref, referredBy: referralCode || '', vipLevel: 'Bronze' });
    wallets.push({ userId: newUserId, balance: referralCode ? 0.5000 : 0.4000, baseHashrate: 10.0, effectiveHashrate: 10.0, minersCount: 0 });

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

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ success: true, token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/user/dashboard', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    const wallet = wallets.find(w => w.userId === req.user.id);
    if (!user || !wallet) return res.status(404).json({ message: 'User record files missing!' });

    return res.status(200).json({
      fullName: user.fullName, vipLevel: user.vipLevel, myReferralCode: user.myReferralCode,
      balance: wallet.balance, baseHashrate: wallet.baseHashrate, effectiveHashrate: wallet.effectiveHashrate, minersCount: wallet.minersCount
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/wallet/deposit', verifyToken, (req, res) => {
  try {
    const { txid, network, amount } = req.body;
    if (transactions.find(t => t.txid === txid)) return res.status(400).json({ message: 'Transaction hash already exists!' });

    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: 'deposit', amount: parseFloat(amount), network, txid, status: 'pending', date: new Date().toISOString() });
    return res.status(201).json({ success: true, message: 'Deposit proof hash queued successfully' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.post('/api/wallet/withdraw', verifyToken, (req, res) => {
  try {
    const { address, network, amount } = req.body;
    const wallet = wallets.find(w => w.userId === req.user.id);
    const amt = parseFloat(amount);
    if (wallet.balance < amt) return res.status(400).json({ message: 'Insufficient funding balance' });

    wallet.balance -= amt;
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
    const { tier } = req.body;
    const wallet = wallets.find(w => w.userId === req.user.id);
    let cost = 0, boost = 0;

    if (tier === 'Starter') { cost = 10.0; boost = 5.0; }
    else if (tier === 'Pro') { cost = 20.0; boost = 15.0; }
    else if (tier === 'Enterprise') { cost = 50.0; boost = 50.0; }
    else return res.status(400).json({ message: 'Invalid network tier selection' });

    if (wallet.balance < cost) return res.status(400).json({ message: 'Insufficient resources account balance' });

    wallet.balance -= cost;
    wallet.effectiveHashrate += boost;
    wallet.minersCount += 1;

    transactions.push({ id: 'tx_' + Math.random().toString(36).substring(2, 9), userId: req.user.id, type: `Lease ${tier}`, amount: cost, network: 'Internal Server', txid: 'CN_' + Math.random().toString(36).substring(2,8).toUpperCase(), status: 'completed', date: new Date().toISOString() });
    return res.status(200).json({ success: true, message: 'Cloud computing server accelerated successfully!' });
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
    const voucher = couponVouchers.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!voucher) return res.status(400).json({ message: 'Voucher code invalid or already used!' });

    const wallet = wallets.find(w => w.userId === req.user.id);
    wallet.balance += voucher.bonus;
    voucher.active = false;
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
      }
    } else {
      tx.status = 'rejected';
      if (tx.type === 'withdrawal') {
        const w = wallets.find(wall => wall.userId === tx.userId);
        if (w) w.balance += tx.amount;
      }
    }
    return res.status(200).json({ success: true, message: 'Status updated' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// Admin: list all users
app.get('/api/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Denied' });
  const result = users.map(u => {
    const w = wallets.find(wl => wl.userId === u.id) || {};
    return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, vipLevel: u.vipLevel, myReferralCode: u.myReferralCode, referredBy: u.referredBy, balance: w.balance || 0, minersCount: w.minersCount || 0 };
  });
  return res.status(200).json(result);
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
    if (!code || !bonus) return res.status(400).json({ message: 'Code and bonus amount required' });
    const upperCode = code.toUpperCase().trim();
    if (couponVouchers.find(c => c.code === upperCode)) return res.status(400).json({ message: 'Code already exists' });
    couponVouchers.push({ code: upperCode, bonus: parseFloat(bonus), active: true });
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
  const idx = couponVouchers.findIndex(c => c.code === req.params.code.toUpperCase());
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
    // Normalize to string and validate against allowlist
    const tid = String(taskId).trim();
    if (!TASK_REWARDS.hasOwnProperty(tid)) return res.status(400).json({ message: 'Invalid task ID.' });
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Block if already approved — one reward per (userId, taskId), ever
    const approved = taskClaims.find(c => c.userId === req.user.id && c.taskId === tid && c.status === 'approved');
    if (approved) return res.status(400).json({ message: 'You have already received the reward for this task.' });
    // Block if a pending claim already exists
    const pending = taskClaims.find(c => c.userId === req.user.id && c.taskId === tid && c.status === 'pending');
    if (pending) return res.status(400).json({ message: 'Your claim for this task is already pending admin review.' });
    const claim = {
      id: 'tc_' + Math.random().toString(36).substring(2, 9),
      userId: req.user.id,
      userEmail: user.email,
      userName: user.fullName,
      taskId: tid,   // always stored as string
      taskName,
      status: 'pending',
      date: new Date().toISOString()
    };
    taskClaims.push(claim);
    return res.status(201).json({ success: true, message: 'Task claim submitted! Admin will review and approve your reward.' });
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
  try {
    const { id, action } = req.body;
    const claim = taskClaims.find(c => c.id === id);
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });
    if (claim.status !== 'pending') return res.status(400).json({ message: `Claim already ${claim.status}.` });

    if (action === 'approve') {
      // Normalize stored taskId to string for safe comparison (defense against legacy data)
      const tid = String(claim.taskId).trim();
      // Defense-in-depth: ensure no other approved claim exists for this user+task
      const alreadyApproved = taskClaims.find(c => c.id !== claim.id && c.userId === claim.userId && String(c.taskId).trim() === tid && c.status === 'approved');
      if (alreadyApproved) {
        claim.status = 'rejected';
        return res.status(400).json({ message: 'This user already received the reward for this task. Claim auto-rejected.' });
      }
      const reward = TASK_REWARDS[tid] || 0;
      const wallet = wallets.find(w => w.userId === claim.userId);
      if (wallet) wallet.balance = Number((wallet.balance + reward).toFixed(4));
      claim.status = 'approved';
      claim.reward = reward;
      return res.status(200).json({ success: true, message: `Claim approved. $${reward} added to user wallet.` });
    } else if (action === 'reject') {
      claim.status = 'rejected';
      return res.status(200).json({ success: true, message: 'Claim rejected.' });
    }
    return res.status(400).json({ message: 'Action must be approve or reject.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
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
