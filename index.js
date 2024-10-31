const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://drmncygzhn39:<db_password>@cluster0.r9idc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB’ye bağlandı'))
    .catch((error) => console.error('MongoDB bağlantı hatası:', error));

// Kullanıcı modeli
const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    tokenCount: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    twitterClaimed: { type: Boolean, default: false },
    telegramClaimed: { type: Boolean, default: false },
    dailyClaimedAt: { type: Date, default: null },
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Kullanıcıyı veritabanına kaydet veya güncelle
app.post('/api/saveUserData', async (req, res) => {
    const { telegramId, tokenCount, level, twitterClaimed, telegramClaimed, dailyClaimedAt } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { telegramId },
            { tokenCount, level, twitterClaimed, telegramClaimed, dailyClaimedAt },
            { upsert: true, new: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Veritabanı hatası.' });
    }
});

// Kullanıcı verilerini alma
app.get('/api/getUserData/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    try {
        const user = await User.findOne({ telegramId });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, error: 'Kullanıcı bulunamadı.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Veritabanı hatası.' });
    }
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
