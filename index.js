const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://drmncygzhn39:<db_password>@cluster0.r9idc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Kullanıcı modelini tanımla
const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  tokenCount: { type: Number, default: 0 },
  lastClaimDate: { type: Date, default: null },
  socialRewardClaimed: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// JSON desteği ve statik dosyalar
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa yönlendirmesi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Günlük ödül talebi
app.post('/claim-daily-reward', async (req, res) => {
  const { telegramId } = req.body;
  const user = await User.findOne({ telegramId });
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  if (user.lastClaimDate && (now - new Date(user.lastClaimDate) < oneDay)) {
    return res.json({ success: false, message: 'You can only claim once every 24 hours.' });
  }

  user.tokenCount += 5000;
  user.lastClaimDate = now;
  await user.save();

  res.json({ success: true, tokenCount: user.tokenCount });
});

// Sosyal medya ödül talebi
app.post('/claim-social-reward', async (req, res) => {
  const { telegramId } = req.body;
  const user = await User.findOne({ telegramId });

  if (user.socialRewardClaimed) {
    return res.json({ success: false, message: 'You have already claimed your social media reward.' });
  }

  user.tokenCount += 5000;
  user.socialRewardClaimed = true;
  await user.save();

  res.json({ success: true, tokenCount: user.tokenCount });
});

// Token kazanma
app.post('/earn-token', async (req, res) => {
  const { telegramId } = req.body;
  const user = await User.findOne({ telegramId });

  user.tokenCount += 1;
  await user.save();

  res.json({ success: true, tokenCount: user.tokenCount });
});

// Sunucu başlatma
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
