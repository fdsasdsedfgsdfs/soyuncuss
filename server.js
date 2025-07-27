const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'minecraft-server-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'minecraft_server'
};

let db;

// Initialize database connection
async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    await createTables();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Create necessary tables
async function createTables() {
  const tables = [
    // AuthMe users table (compatible with AuthMe plugin)
    `CREATE TABLE IF NOT EXISTS authme (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      realname VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      ip VARCHAR(40),
      lastlogin BIGINT,
      x DOUBLE DEFAULT 0,
      y DOUBLE DEFAULT 0,
      z DOUBLE DEFAULT 0,
      world VARCHAR(255) DEFAULT 'world',
      regdate BIGINT,
      regip VARCHAR(40),
      yaw FLOAT DEFAULT 0,
      pitch FLOAT DEFAULT 0,
      email VARCHAR(255),
      isLogged SMALLINT DEFAULT 0,
      hasSession SMALLINT DEFAULT 0
    )`,
    
    // Website users (extended profile data)
    `CREATE TABLE IF NOT EXISTS website_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255),
      avatar VARCHAR(255),
      coins INT DEFAULT 0,
      tokens INT DEFAULT 0,
      rank_name VARCHAR(50) DEFAULT 'Oyuncu',
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_playtime INT DEFAULT 0,
      is_online BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (username) REFERENCES authme(username) ON DELETE CASCADE
    )`,
    
    // Market items
    `CREATE TABLE IF NOT EXISTS market_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price INT NOT NULL,
      currency ENUM('coins', 'tokens') DEFAULT 'coins',
      category VARCHAR(100),
      image VARCHAR(255),
      command TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // User purchases
    `CREATE TABLE IF NOT EXISTS user_purchases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255),
      item_id INT,
      purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      price INT,
      currency VARCHAR(20),
      FOREIGN KEY (username) REFERENCES authme(username),
      FOREIGN KEY (item_id) REFERENCES market_items(id)
    )`,
    
    // News
    `CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(255),
      image VARCHAR(255),
      category VARCHAR(100) DEFAULT 'Genel',
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    // Top donators
    `CREATE TABLE IF NOT EXISTS donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255),
      amount DECIMAL(10,2),
      currency VARCHAR(10) DEFAULT 'TL',
      donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (username) REFERENCES authme(username)
    )`,
    
    // Server statistics
    `CREATE TABLE IF NOT EXISTS server_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      server_name VARCHAR(100),
      online_players INT DEFAULT 0,
      max_players INT DEFAULT 100,
      is_online BOOLEAN DEFAULT TRUE,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    try {
      await db.execute(table);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
  
  // Insert default data
  await insertDefaultData();
}

// Insert default data
async function insertDefaultData() {
  // Default market items
  const defaultItems = [
    {
      name: 'VIP Rank',
      description: 'VIP oyuncu rütbesi - Özel komutlar ve ayrıcalıklar',
      price: 500,
      currency: 'coins',
      category: 'Rütbeler',
      image: '/images/ranks/vip.png',
      command: 'lp user {username} parent add vip'
    },
    {
      name: 'Premium Rank',
      description: 'Premium oyuncu rütbesi - Gelişmiş özellikler',
      price: 1000,
      currency: 'coins',
      category: 'Rütbeler',
      image: '/images/ranks/premium.png',
      command: 'lp user {username} parent add premium'
    },
    {
      name: 'Diamond Kit',
      description: 'Elmas zırh seti ve araçlar',
      price: 250,
      currency: 'tokens',
      category: 'Kitler',
      image: '/images/kits/diamond.png',
      command: 'kit diamond {username}'
    }
  ];

  for (const item of defaultItems) {
    try {
      await db.execute(
        'INSERT IGNORE INTO market_items (name, description, price, currency, category, image, command) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.name, item.description, item.price, item.currency, item.category, item.image, item.command]
      );
    } catch (error) {
      console.error('Error inserting default item:', error);
    }
  }

  // Default news
  const defaultNews = [
    {
      title: 'Sunucuya Hoş Geldiniz!',
      content: 'Minecraft sunucumuz açıldı! Hemen giriş yapın ve maceraya başlayın.',
      author: 'Admin',
      category: 'Duyuru',
      is_featured: true
    }
  ];

  for (const news of defaultNews) {
    try {
      await db.execute(
        'INSERT IGNORE INTO news (title, content, author, category, is_featured) VALUES (?, ?, ?, ?, ?)',
        [news.title, news.content, news.author, news.category, news.is_featured]
      );
    } catch (error) {
      console.error('Error inserting default news:', error);
    }
  }
}

// Minecraft API functions
async function getPlayerSkin(username) {
  try {
    const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (response.data && response.data.id) {
      return `https://crafatar.com/avatars/${response.data.id}?size=64`;
    }
  } catch (error) {
    console.error('Error fetching player skin:', error);
  }
  return '/images/default-avatar.png';
}

async function getPlayerUUID(username) {
  try {
    const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    return response.data ? response.data.id : null;
  } catch (error) {
    console.error('Error fetching player UUID:', error);
    return null;
  }
}

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    // Get featured news
    const [news] = await db.execute(
      'SELECT * FROM news WHERE is_featured = TRUE ORDER BY created_at DESC LIMIT 3'
    );
    
    // Get server stats
    const [serverStats] = await db.execute(
      'SELECT * FROM server_stats ORDER BY id DESC LIMIT 1'
    );
    
    // Get top donators
    const [topDonators] = await db.execute(`
      SELECT u.username, SUM(d.amount) as total_amount 
      FROM donations d 
      JOIN website_users u ON d.username = u.username 
      GROUP BY u.username 
      ORDER BY total_amount DESC 
      LIMIT 10
    `);

    res.render('index', {
      user: req.session.user,
      news: news,
      serverStats: serverStats[0] || { online_players: 0, max_players: 100, is_online: true },
      topDonators: topDonators
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.render('index', {
      user: req.session.user,
      news: [],
      serverStats: { online_players: 0, max_players: 100, is_online: true },
      topDonators: []
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Check AuthMe database
    const [rows] = await db.execute(
      'SELECT * FROM authme WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.render('login', { error: 'Kullanıcı bulunamadı!' });
    }
    
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.render('login', { error: 'Yanlış şifre!' });
    }
    
    // Get or create website user profile
    const [websiteUser] = await db.execute(
      'SELECT * FROM website_users WHERE username = ?',
      [username]
    );
    
    if (websiteUser.length === 0) {
      // Create website profile
      const avatar = await getPlayerSkin(username);
      await db.execute(
        'INSERT INTO website_users (username, avatar) VALUES (?, ?)',
        [username, avatar]
      );
    }
    
    req.session.user = {
      username: user.username,
      email: user.email
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Giriş sırasında bir hata oluştu!' });
  }
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  try {
    // Check if username exists
    const [existing] = await db.execute(
      'SELECT username FROM authme WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return res.render('register', { error: 'Bu kullanıcı adı zaten alınmış!' });
    }
    
    // Hash password (AuthMe compatible)
    const hashedPassword = await bcrypt.hash(password, 10);
    const currentTime = Date.now();
    
    // Insert into AuthMe table
    await db.execute(
      'INSERT INTO authme (username, realname, password, email, regdate, regip) VALUES (?, ?, ?, ?, ?, ?)',
      [username, username, hashedPassword, email, currentTime, req.ip]
    );
    
    // Create website profile
    const avatar = await getPlayerSkin(username);
    await db.execute(
      'INSERT INTO website_users (username, email, avatar) VALUES (?, ?, ?)',
      [username, email, avatar]
    );
    
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: 'Kayıt sırasında bir hata oluştu!' });
  }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const [userProfile] = await db.execute(
      'SELECT * FROM website_users WHERE username = ?',
      [req.session.user.username]
    );
    
    const [recentPurchases] = await db.execute(`
      SELECT p.*, m.name as item_name, m.image as item_image 
      FROM user_purchases p 
      JOIN market_items m ON p.item_id = m.id 
      WHERE p.username = ? 
      ORDER BY p.purchase_date DESC 
      LIMIT 5
    `, [req.session.user.username]);
    
    res.render('dashboard', {
      user: req.session.user,
      profile: userProfile[0] || {},
      recentPurchases: recentPurchases
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', {
      user: req.session.user,
      profile: {},
      recentPurchases: []
    });
  }
});

app.get('/market', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    let query = 'SELECT * FROM market_items WHERE is_active = TRUE';
    let params = [];
    
    if (category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, name';
    
    const [items] = await db.execute(query, params);
    const [categories] = await db.execute(
      'SELECT DISTINCT category FROM market_items WHERE is_active = TRUE'
    );
    
    res.render('market', {
      user: req.session.user,
      items: items,
      categories: categories,
      currentCategory: category
    });
  } catch (error) {
    console.error('Market error:', error);
    res.render('market', {
      user: req.session.user,
      items: [],
      categories: [],
      currentCategory: 'all'
    });
  }
});

app.post('/purchase', isAuthenticated, async (req, res) => {
  const { itemId } = req.body;
  
  try {
    const [item] = await db.execute(
      'SELECT * FROM market_items WHERE id = ? AND is_active = TRUE',
      [itemId]
    );
    
    if (item.length === 0) {
      return res.json({ success: false, message: 'Ürün bulunamadı!' });
    }
    
    const [user] = await db.execute(
      'SELECT * FROM website_users WHERE username = ?',
      [req.session.user.username]
    );
    
    if (user.length === 0) {
      return res.json({ success: false, message: 'Kullanıcı profili bulunamadı!' });
    }
    
    const userProfile = user[0];
    const itemData = item[0];
    
    // Check if user has enough currency
    const userCurrency = itemData.currency === 'coins' ? userProfile.coins : userProfile.tokens;
    
    if (userCurrency < itemData.price) {
      return res.json({ 
        success: false, 
        message: `Yeterli ${itemData.currency === 'coins' ? 'coin' : 'token'} yok!` 
      });
    }
    
    // Deduct currency
    const newAmount = userCurrency - itemData.price;
    const updateField = itemData.currency === 'coins' ? 'coins' : 'tokens';
    
    await db.execute(
      `UPDATE website_users SET ${updateField} = ? WHERE username = ?`,
      [newAmount, req.session.user.username]
    );
    
    // Record purchase
    await db.execute(
      'INSERT INTO user_purchases (username, item_id, price, currency) VALUES (?, ?, ?, ?)',
      [req.session.user.username, itemId, itemData.price, itemData.currency]
    );
    
    // Here you would execute the command in-game
    // This is where you'd integrate with your Minecraft server
    console.log(`Execute command: ${itemData.command.replace('{username}', req.session.user.username)}`);
    
    res.json({ success: true, message: 'Satın alma başarılı!' });
  } catch (error) {
    console.error('Purchase error:', error);
    res.json({ success: false, message: 'Satın alma sırasında bir hata oluştu!' });
  }
});

app.get('/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const [news] = await db.execute(
      'SELECT * FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM news');
    const totalPages = Math.ceil(countResult[0].total / limit);
    
    res.render('news', {
      user: req.session.user,
      news: news,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('News error:', error);
    res.render('news', {
      user: req.session.user,
      news: [],
      currentPage: 1,
      totalPages: 1
    });
  }
});

app.get('/profile/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    const [profile] = await db.execute(`
      SELECT w.*, a.regdate, a.lastlogin 
      FROM website_users w 
      JOIN authme a ON w.username = a.username 
      WHERE w.username = ?
    `, [username]);
    
    if (profile.length === 0) {
      return res.status(404).render('404');
    }
    
    const playerProfile = profile[0];
    const playerUUID = await getPlayerUUID(username);
    
    res.render('profile', {
      user: req.session.user,
      profile: playerProfile,
      playerUUID: playerUUID
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(404).render('404');
  }
});

app.get('/toplist', async (req, res) => {
  try {
    const [topDonators] = await db.execute(`
      SELECT u.username, u.avatar, u.rank_name, SUM(d.amount) as total_amount 
      FROM donations d 
      JOIN website_users u ON d.username = u.username 
      GROUP BY u.username, u.avatar, u.rank_name 
      ORDER BY total_amount DESC 
      LIMIT 50
    `);
    
    const [topPlaytime] = await db.execute(`
      SELECT username, avatar, rank_name, total_playtime 
      FROM website_users 
      ORDER BY total_playtime DESC 
      LIMIT 50
    `);
    
    res.render('toplist', {
      user: req.session.user,
      topDonators: topDonators,
      topPlaytime: topPlaytime
    });
  } catch (error) {
    console.error('Toplist error:', error);
    res.render('toplist', {
      user: req.session.user,
      topDonators: [],
      topPlaytime: []
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// API endpoints for external integration
app.get('/api/player/:username', async (req, res) => {
  try {
    const [player] = await db.execute(`
      SELECT w.*, a.lastlogin, a.regdate 
      FROM website_users w 
      JOIN authme a ON w.username = a.username 
      WHERE w.username = ?
    `, [req.params.username]);
    
    if (player.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/server/stats', async (req, res) => {
  try {
    const [stats] = await db.execute(
      'SELECT * FROM server_stats ORDER BY last_updated DESC LIMIT 1'
    );
    
    res.json(stats[0] || { online_players: 0, max_players: 100, is_online: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cron job to update server statistics (would integrate with your Minecraft server)
cron.schedule('*/5 * * * *', async () => {
  // This would query your Minecraft server for real statistics
  try {
    // Placeholder - replace with actual server query
    const onlinePlayers = Math.floor(Math.random() * 50);
    
    await db.execute(
      'INSERT INTO server_stats (server_name, online_players, max_players, is_online) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE online_players = ?, last_updated = CURRENT_TIMESTAMP',
      ['Main Server', onlinePlayers, 100, true, onlinePlayers]
    );
  } catch (error) {
    console.error('Error updating server stats:', error);
  }
});

// Initialize and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;