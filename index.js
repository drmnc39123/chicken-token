// index.js

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB bağlantı stringi (MongoDB Atlas'tan alınacak)
const uri = "YOUR_MONGODB_CONNECTION_STRING"; // Buraya kendi MongoDB bağlantı stringinizi ekleyin
const client = new MongoClient(uri);

let database, usersCollection;

// MongoDB'ye bağlanma
async function connectToDatabase() {
    try {
        await client.connect();
        database = client.db('chickenTokenDB'); // Veritabanı adı
        usersCollection = database.collection('users'); // "users" koleksiyonu
        console.log('Connected to MongoDB!');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Kullanıcı verisini veritabanına kaydetme veya güncelleme
async function saveUserProgress(userId, tokenCount, level) {
    const filter = { userId: userId };
    const update = {
        $set: {
            tokenCount: tokenCount,
            level: level,
            lastUpdated: new Date()
        }
    };
    const options = { upsert: true }; // Eğer kullanıcı yoksa ekle
    await usersCollection.updateOne(filter, update, options);
    console.log(`User ${userId} progress saved.`);
}

// Kullanıcı verisini veritabanından çekme
async function getUserProgress(userId) {
    const user = await usersCollection.findOne({ userId: userId });
    return user;
}

// Sunucu başlatıldığında MongoDB'ye bağlan
connectToDatabase();

// Kullanıcıdan token kazanma ve ilerlemesini kaydetme
let tokenCount = 0;
let level = 1;

// Tavuk resmine tıklayınca token kazanma
app.get('/tap/:userId', async (req, res) => {
    const userId = req.params.userId;

    // Token ve seviye güncelleniyor
    tokenCount += 1;
    updateLevel();

    // İlerlemeyi veritabanına kaydet
    await saveUserProgress(userId, tokenCount, level);
    
    res.send(`You tapped! Token Count: ${tokenCount}, Level: ${level}`);
});

// Kullanıcı verisini yükleme
app.get('/load/:userId', async (req, res) => {
    const userId = req.params.userId;

    const user = await getUserProgress(userId);
    if (user) {
        tokenCount = user.tokenCount;
        level = user.level;
        res.send(`Progress loaded! Token Count: ${tokenCount}, Level: ${level}`);
    } else {
        res.send("No progress found for this user.");
    }
});

// Token sayısına göre level belirleme
function updateLevel() {
    if (tokenCount >= 10000000) {
        level = 10;
    } else if (tokenCount >= 5000000) {
        level = 9;
    } else if (tokenCount >= 1000000) {
        level = 8;
    } else if (tokenCount >= 500000) {
        level = 7;
    } else if (tokenCount >= 250000) {
        level = 6;
    } else if (tokenCount >= 100000) {
        level = 5;
    } else if (tokenCount >= 50000) {
        level = 4;
    } else if (tokenCount >= 20000) {
        level = 3;
    } else if (tokenCount >= 10000) {
        level = 2;
    } else {
        level = 1;
    }
}

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

