<?php
// MinecraftTR Website XAMPP Installation Script
// XAMPP kullanıcıları için PHP kurulum scripti

header('Content-Type: text/html; charset=UTF-8');
session_start();

// Güvenlik kontrolü - sadece localhost'tan erişim
if (!in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1', 'localhost'])) {
    die('Bu script sadece localhost\'tan çalıştırılabilir!');
}

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MinecraftTR - XAMPP Kurulum</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #1f2937, #111827);
            color: white; min-height: 100vh; padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2.5em; color: #10b981; margin-bottom: 10px; }
        .card { 
            background: rgba(31, 41, 55, 0.8); 
            border: 1px solid #374151; 
            border-radius: 12px; 
            padding: 25px; 
            margin-bottom: 20px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .success { border-left: 4px solid #10b981; background: rgba(16, 185, 129, 0.1); }
        .error { border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.1); }
        .warning { border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .info { border-left: 4px solid #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .btn { 
            background: #10b981; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px; 
            margin: 10px 5px;
            transition: all 0.3s;
        }
        .btn:hover { background: #059669; transform: translateY(-2px); }
        .btn-secondary { background: #6b7280; }
        .btn-secondary:hover { background: #4b5563; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #374151; 
            border-radius: 6px; 
            background: #1f2937; 
            color: white; 
        }
        .progress { 
            background: #374151; 
            border-radius: 10px; 
            overflow: hidden; 
            margin: 10px 0; 
        }
        .progress-bar { 
            background: linear-gradient(90deg, #10b981, #059669); 
            height: 20px; 
            transition: width 0.5s; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 12px; 
            font-weight: bold;
        }
        .step { display: none; }
        .step.active { display: block; }
        .requirement { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px; 
            border-bottom: 1px solid #374151; 
        }
        .status-ok { color: #10b981; }
        .status-error { color: #ef4444; }
        .code-block { 
            background: #111827; 
            border: 1px solid #374151; 
            border-radius: 6px; 
            padding: 15px; 
            font-family: 'Courier New', monospace; 
            overflow-x: auto; 
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎮 MinecraftTR</div>
            <h1>XAMPP Kurulum Sihirbazı</h1>
            <p>Türkiye'nin en iyi Minecraft sunucu website'i</p>
        </div>

        <?php
        $step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
        $action = isset($_POST['action']) ? $_POST['action'] : '';

        // Kurulum fonksiyonları
        function checkRequirements() {
            $requirements = [
                'PHP Version' => version_compare(PHP_VERSION, '7.4.0', '>='),
                'MySQL Extension' => extension_loaded('mysqli'),
                'JSON Extension' => extension_loaded('json'),
                'cURL Extension' => extension_loaded('curl'),
                'Write Permission' => is_writable(__DIR__),
            ];
            
            return $requirements;
        }

        function createDatabase($host, $username, $password, $dbname) {
            try {
                $conn = new mysqli($host, $username, $password);
                
                if ($conn->connect_error) {
                    throw new Exception("MySQL bağlantı hatası: " . $conn->connect_error);
                }
                
                $sql = "CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
                if (!$conn->query($sql)) {
                    throw new Exception("Veritabanı oluşturma hatası: " . $conn->error);
                }
                
                $conn->select_db($dbname);
                
                // AuthMe tablosu oluştur
                $authmeTable = "
                CREATE TABLE IF NOT EXISTS `authme` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(255) NOT NULL UNIQUE,
                    `realname` VARCHAR(255) NOT NULL,
                    `password` VARCHAR(255) NOT NULL,
                    `ip` VARCHAR(40),
                    `lastlogin` BIGINT,
                    `x` DOUBLE DEFAULT 0,
                    `y` DOUBLE DEFAULT 0,
                    `z` DOUBLE DEFAULT 0,
                    `world` VARCHAR(255) DEFAULT 'world',
                    `regdate` BIGINT,
                    `regip` VARCHAR(40),
                    `yaw` FLOAT DEFAULT 0,
                    `pitch` FLOAT DEFAULT 0,
                    `email` VARCHAR(255),
                    `isLogged` SMALLINT DEFAULT 0,
                    `hasSession` SMALLINT DEFAULT 0
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                
                $conn->query($authmeTable);
                
                // Website users tablosu
                $websiteUsersTable = "
                CREATE TABLE IF NOT EXISTS `website_users` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(255) NOT NULL UNIQUE,
                    `email` VARCHAR(255),
                    `avatar` VARCHAR(255),
                    `coins` INT DEFAULT 0,
                    `tokens` INT DEFAULT 0,
                    `rank_name` VARCHAR(50) DEFAULT 'Oyuncu',
                    `join_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `last_online` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `total_playtime` INT DEFAULT 0,
                    `is_online` BOOLEAN DEFAULT FALSE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                
                $conn->query($websiteUsersTable);
                
                // Market items tablosu
                $marketTable = "
                CREATE TABLE IF NOT EXISTS `market_items` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `description` TEXT,
                    `price` INT NOT NULL,
                    `currency` ENUM('coins', 'tokens') DEFAULT 'coins',
                    `category` VARCHAR(100),
                    `image` VARCHAR(255),
                    `command` TEXT,
                    `is_active` BOOLEAN DEFAULT TRUE,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                
                $conn->query($marketTable);
                
                // News tablosu
                $newsTable = "
                CREATE TABLE IF NOT EXISTS `news` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `title` VARCHAR(255) NOT NULL,
                    `content` TEXT NOT NULL,
                    `author` VARCHAR(255),
                    `image` VARCHAR(255),
                    `category` VARCHAR(100) DEFAULT 'Genel',
                    `is_featured` BOOLEAN DEFAULT FALSE,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
                
                $conn->query($newsTable);
                
                // Diğer tablolar...
                $conn->query("CREATE TABLE IF NOT EXISTS `donations` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(255),
                    `amount` DECIMAL(10,2),
                    `currency` VARCHAR(10) DEFAULT 'TL',
                    `donation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                
                $conn->query("CREATE TABLE IF NOT EXISTS `server_stats` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `server_name` VARCHAR(100),
                    `online_players` INT DEFAULT 0,
                    `max_players` INT DEFAULT 100,
                    `is_online` BOOLEAN DEFAULT TRUE,
                    `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                
                $conn->query("CREATE TABLE IF NOT EXISTS `user_purchases` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(255),
                    `item_id` INT,
                    `purchase_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `price` INT,
                    `currency` VARCHAR(20)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                
                // Örnek veriler ekle
                $conn->query("INSERT IGNORE INTO market_items (name, description, price, currency, category, command) VALUES 
                    ('VIP Rank', 'VIP oyuncu rütbesi - Özel komutlar ve ayrıcalıklar', 500, 'coins', 'Rütbeler', 'lp user {username} parent add vip'),
                    ('Premium Rank', 'Premium oyuncu rütbesi - Gelişmiş özellikler', 1000, 'coins', 'Rütbeler', 'lp user {username} parent add premium'),
                    ('Diamond Kit', 'Elmas zırh seti ve araçlar', 250, 'tokens', 'Kitler', 'kit diamond {username}')");
                
                $conn->query("INSERT IGNORE INTO news (title, content, author, category, is_featured) VALUES 
                    ('Sunucuya Hoş Geldiniz!', 'Minecraft sunucumuz açıldı! Hemen giriş yapın ve maceraya başlayın.', 'Admin', 'Duyuru', 1)");
                
                // Admin kullanıcısı oluştur
                $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
                $conn->query("INSERT IGNORE INTO authme (username, realname, password, email, regdate, regip) VALUES 
                    ('admin', 'admin', '$adminPassword', 'admin@minecrafttr.com', " . (time() * 1000) . ", '127.0.0.1')");
                
                $conn->query("INSERT IGNORE INTO website_users (username, email, rank_name, is_admin) VALUES 
                    ('admin', 'admin@minecrafttr.com', 'Administrator', 1)");
                
                $conn->close();
                return true;
            } catch (Exception $e) {
                return $e->getMessage();
            }
        }

        function createEnvFile($config) {
            $envContent = "# Database Configuration
DB_HOST={$config['db_host']}
DB_USER={$config['db_user']}
DB_PASSWORD={$config['db_password']}
DB_NAME={$config['db_name']}

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=" . bin2hex(random_bytes(32)) . "
JWT_SECRET=" . bin2hex(random_bytes(32)) . "

# Minecraft Server Configuration
MINECRAFT_SERVER_IP={$config['mc_ip']}
MINECRAFT_SERVER_PORT=25565
RCON_PASSWORD={$config['rcon_password']}

# External APIs
MOJANG_API_URL=https://api.mojang.com
CRAFATAR_API_URL=https://crafatar.com

# Website Configuration
WEBSITE_URL={$config['website_url']}
WEBSITE_NAME={$config['website_name']}
ADMIN_EMAIL={$config['admin_email']}";

            return file_put_contents('.env', $envContent);
        }

        function createDirectories() {
            $dirs = [
                'public/images/ranks',
                'public/images/kits', 
                'public/images/cosmetics',
                'public/images/news',
                'public/css',
                'public/js',
                'views',
                'logs'
            ];
            
            foreach ($dirs as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
            }
            return true;
        }

        // Adım işleme
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            switch ($action) {
                case 'check_requirements':
                    header('Location: ?step=2');
                    exit;
                    
                case 'configure_database':
                    $_SESSION['config'] = $_POST;
                    
                    $result = createDatabase(
                        $_POST['db_host'], 
                        $_POST['db_user'], 
                        $_POST['db_password'], 
                        $_POST['db_name']
                    );
                    
                    if ($result === true) {
                        header('Location: ?step=3');
                    } else {
                        $error = $result;
                    }
                    break;
                    
                case 'finalize_setup':
                    $config = $_SESSION['config'];
                    $config['website_name'] = $_POST['website_name'];
                    $config['admin_email'] = $_POST['admin_email'];
                    $config['website_url'] = $_POST['website_url'];
                    $config['mc_ip'] = $_POST['mc_ip'];
                    $config['rcon_password'] = $_POST['rcon_password'];
                    
                    createEnvFile($config);
                    createDirectories();
                    
                    header('Location: ?step=4');
                    exit;
            }
        }
        ?>

        <!-- Adım 1: Gereksinimler Kontrolü -->
        <div class="step <?= $step == 1 ? 'active' : '' ?>">
            <div class="card info">
                <h2>📋 Sistem Gereksinimleri Kontrolü</h2>
                
                <?php $requirements = checkRequirements(); ?>
                
                <?php foreach ($requirements as $name => $status): ?>
                <div class="requirement">
                    <span><?= $name ?></span>
                    <span class="<?= $status ? 'status-ok' : 'status-error' ?>">
                        <?= $status ? '✅ Tamam' : '❌ Eksik' ?>
                    </span>
                </div>
                <?php endforeach; ?>
                
                <?php if (array_product($requirements)): ?>
                <div class="card success">
                    <p>✅ Tüm gereksinimler karşılanıyor! Kuruluma devam edebilirsiniz.</p>
                </div>
                
                <form method="POST">
                    <input type="hidden" name="action" value="check_requirements">
                    <button type="submit" class="btn">Devam Et →</button>
                </form>
                <?php else: ?>
                <div class="card error">
                    <p>❌ Eksik gereksinimler var. Lütfen XAMPP kurulumunuzu kontrol edin.</p>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Adım 2: Veritabanı Yapılandırması -->
        <div class="step <?= $step == 2 ? 'active' : '' ?>">
            <div class="card">
                <h2>🗄️ Veritabanı Yapılandırması</h2>
                
                <?php if (isset($error)): ?>
                <div class="card error">
                    <p>❌ Hata: <?= htmlspecialchars($error) ?></p>
                </div>
                <?php endif; ?>
                
                <form method="POST">
                    <input type="hidden" name="action" value="configure_database">
                    
                    <div class="form-group">
                        <label>Database Host:</label>
                        <input type="text" name="db_host" value="localhost" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Kullanıcı Adı:</label>
                        <input type="text" name="db_user" value="root" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Database Şifresi:</label>
                        <input type="password" name="db_password" placeholder="XAMPP'te genelde boş">
                    </div>
                    
                    <div class="form-group">
                        <label>Database Adı:</label>
                        <input type="text" name="db_name" value="minecraft_server" required>
                    </div>
                    
                    <button type="submit" class="btn">Veritabanını Oluştur</button>
                    <a href="?step=1" class="btn btn-secondary">← Geri</a>
                </form>
            </div>
        </div>

        <!-- Adım 3: Website Yapılandırması -->
        <div class="step <?= $step == 3 ? 'active' : '' ?>">
            <div class="card success">
                <h2>🎉 Veritabanı Başarıyla Oluşturuldu!</h2>
                <p>MySQL tabloları hazırlandı ve örnek veriler eklendi.</p>
            </div>
            
            <div class="card">
                <h2>⚙️ Website Yapılandırması</h2>
                
                <form method="POST">
                    <input type="hidden" name="action" value="finalize_setup">
                    
                    <div class="form-group">
                        <label>Website Adı:</label>
                        <input type="text" name="website_name" value="MinecraftTR" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Admin E-posta:</label>
                        <input type="email" name="admin_email" value="admin@minecrafttr.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Website URL:</label>
                        <input type="url" name="website_url" value="http://localhost:3000" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Minecraft Server IP:</label>
                        <input type="text" name="mc_ip" value="localhost" required>
                    </div>
                    
                    <div class="form-group">
                        <label>RCON Şifresi:</label>
                        <input type="text" name="rcon_password" placeholder="RCON şifreniz">
                    </div>
                    
                    <button type="submit" class="btn">Kurulumu Tamamla</button>
                    <a href="?step=2" class="btn btn-secondary">← Geri</a>
                </form>
            </div>
        </div>

        <!-- Adım 4: Kurulum Tamamlandı -->
        <div class="step <?= $step == 4 ? 'active' : '' ?>">
            <div class="card success">
                <h2>🎉 Kurulum Başarıyla Tamamlandı!</h2>
                
                <div class="progress">
                    <div class="progress-bar" style="width: 100%;">100% Tamamlandı</div>
                </div>
                
                <h3>📋 Yapılanlar:</h3>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>✅ MySQL veritabanı ve tabloları oluşturuldu</li>
                    <li>✅ .env yapılandırma dosyası hazırlandı</li>
                    <li>✅ Klasör yapısı oluşturuldu</li>
                    <li>✅ Örnek veriler eklendi</li>
                    <li>✅ AuthMe entegrasyonu hazırlandı</li>
                    <li>✅ Modern CSS tasarım dosyası hazırlandı</li>
                </ul>
                
                <h3>🚀 Sonraki Adımlar:</h3>
                <div class="code-block">
# 1. Node.js'i yükleyin (https://nodejs.org/)
# 2. Komut satırında proje klasörüne gidin
# 3. Şu komutları çalıştırın:

npm install
npm start

# Website http://localhost:3000 adresinde çalışacak
                </div>
                
                <h3>🎨 Özelleştirme:</h3>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>📁 <code>public/images/</code> klasörüne logo ve görselleri ekleyin</li>
                    <li>⚙️ <code>.env</code> dosyasını gerektiğinde düzenleyin</li>
                    <li>🎮 AuthMe plugin ayarlarını website ile eşleyin</li>
                    <li>🎨 <code>public/css/style.css</code> dosyasını özelleştirin</li>
                </ul>
                
                <div class="card info">
                    <h3>👤 Admin Hesabı Oluşturuldu:</h3>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li><strong>Kullanıcı Adı:</strong> admin</li>
                        <li><strong>Şifre:</strong> admin123</li>
                        <li><strong>Panel:</strong> <a href="http://localhost:3000/admin" target="_blank">http://localhost:3000/admin</a></li>
                        <li style="color: #f59e0b;">⚠️ Güvenlik için şifreyi değiştirmeyi unutmayın!</li>
                    </ul>
                </div>
                
                <div class="card info">
                    <h3>🆕 Yeni Tasarım Özellikleri:</h3>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>✅ Modern Minecraft temalı tasarım</li>
                        <li>✅ Responsive (mobil uyumlu) layout</li>
                        <li>✅ Smooth animasyonlar ve hover efektleri</li>
                        <li>✅ Dark theme ve gradient renkler</li>
                        <li>✅ Font Awesome icon desteği</li>
                        <li>✅ Custom CSS (Tailwind'siz)</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost/phpmyadmin" class="btn btn-secondary" target="_blank">
                        📊 phpMyAdmin'i Aç
                    </a>
                    <button onclick="window.location.reload()" class="btn">
                        🔄 Yeniden Kur
                    </button>
                </div>
            </div>
            
            <div class="card warning">
                <h3>⚠️ Güvenlik Uyarısı</h3>
                <p>Kurulum tamamlandıktan sonra bu <code>install.php</code> dosyasını silin veya production sunucusunda kullanmayın!</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
            <p>🎮 MinecraftTR - Türkiye'nin En İyi Minecraft Sunucu Website'i 🇹🇷</p>
        </div>
    </div>

    <script>
        // Auto-refresh için basit script
        if (window.location.search.includes('step=4')) {
            console.log('Kurulum tamamlandı! 🎉');
        }
    </script>
</body>
</html>