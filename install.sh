#!/bin/bash

# MinecraftTR Website Installation Script
# Turkish Minecraft Server Website Installer

echo "🎮 MinecraftTR Website Kurulum Scripti 🇹🇷"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı! Lütfen Node.js'i yükleyin: https://nodejs.org/"
    exit 1
fi

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL bulunamadı! Lütfen MySQL'i yükleyin."
    echo "Ubuntu/Debian: sudo apt install mysql-server"
    echo "CentOS/RHEL: sudo yum install mysql-server"
    echo "macOS: brew install mysql"
fi

echo "✅ Node.js sürümü: $(node --version)"
echo "✅ NPM sürümü: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Bağımlılıklar yükleniyor..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Bağımlılıklar başarıyla yüklendi!"
else
    echo "❌ Bağımlılık yükleme hatası!"
    exit 1
fi

# Create directories
echo ""
echo "📁 Dizinler oluşturuluyor..."
mkdir -p public/images/{ranks,kits,cosmetics,news}
mkdir -p public/css
mkdir -p public/js
mkdir -p views
mkdir -p logs

echo "✅ Dizinler oluşturuldu!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Çevre değişkenleri dosyası oluşturuluyor..."
    
    # Generate random session secret
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-session-key-$(date +%s)")
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-jwt-secret-key-$(date +%s)")
    
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=minecraft_server

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (Automatically generated)
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET

# Minecraft Server Configuration
MINECRAFT_SERVER_IP=localhost
MINECRAFT_SERVER_PORT=25565
RCON_PASSWORD=your-rcon-password

# External APIs
MOJANG_API_URL=https://api.mojang.com
CRAFATAR_API_URL=https://crafatar.com

# Website Configuration
WEBSITE_URL=http://localhost:3000
WEBSITE_NAME=MinecraftTR
ADMIN_EMAIL=admin@minecrafttr.com
EOF
    
    echo "✅ .env dosyası oluşturuldu!"
    echo "⚠️  Lütfen .env dosyasını düzenleyerek veritabanı ayarlarınızı yapın!"
else
    echo "✅ .env dosyası zaten mevcut."
fi

# Database setup prompt
echo ""
echo "🗄️  Veritabanı Kurulumu"
echo "====================="
echo "Veritabanını şimdi kurmak istiyor musunuz? (y/n)"
read -r setup_db

if [ "$setup_db" = "y" ] || [ "$setup_db" = "Y" ]; then
    echo ""
    echo "MySQL root şifrenizi girin:"
    read -rs mysql_password
    
    echo "Veritabanı oluşturuluyor..."
    mysql -u root -p"$mysql_password" -e "CREATE DATABASE IF NOT EXISTS minecraft_server;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Veritabanı başarıyla oluşturuldu!"
        
        # Update .env with password if provided
        if [ ! -z "$mysql_password" ]; then
            sed -i "s/DB_PASSWORD=/DB_PASSWORD=$mysql_password/" .env
            echo "✅ Veritabanı şifresi .env dosyasına kaydedildi!"
        fi
    else
        echo "❌ Veritabanı oluşturma hatası! Manuel olarak oluşturun:"
        echo "   mysql -u root -p"
        echo "   CREATE DATABASE minecraft_server;"
    fi
fi

# Create sample images directory structure
echo ""
echo "🖼️  Örnek resim dizinleri oluşturuluyor..."

# Create placeholder images info
cat > public/images/README.md << EOF
# Images Directory

Bu dizinde website için gerekli resimler bulunur:

## Gerekli Resimler:
- logo.png (Website logosu)
- favicon.ico (Website ikonu)
- default-avatar.png (Varsayılan kullanıcı avatarı)
- default-news.jpg (Varsayılan haber resmi)
- default-item.png (Varsayılan ürün resmi)
- minecraft-bg.jpg (Ana sayfa arkaplan resmi)
- og-image.png (Social media paylaşım resmi)

## Alt Dizinler:
- ranks/ (Rütbe resimleri)
- kits/ (Kit resimleri)
- cosmetics/ (Kozmetik resimleri)
- news/ (Haber resimleri)

Resimler PNG veya JPG formatında olmalıdır.
EOF

echo "✅ Resim dizinleri hazır!"

# Create startup script
echo ""
echo "🚀 Başlatma scripti oluşturuluyor..."

cat > start.sh << 'EOF'
#!/bin/bash
echo "🎮 MinecraftTR Website başlatılıyor..."
echo "🌐 Website: http://localhost:3000"
echo "⏹️  Durdurmak için: Ctrl+C"
echo ""
npm start
EOF

chmod +x start.sh

echo "✅ Başlatma scripti oluşturuldu!"

# Final instructions
echo ""
echo "🎉 Kurulum Tamamlandı!"
echo "===================="
echo ""
echo "📋 Sonraki Adımlar:"
echo "1. .env dosyasını düzenleyin (veritabanı ayarları)"
echo "2. public/images/ dizinine gerekli resimleri ekleyin"
echo "3. Website'i başlatın: ./start.sh veya npm start"
echo "4. Tarayıcınızda http://localhost:3000 adresini açın"
echo ""
echo "📚 Daha fazla bilgi için README.md dosyasını okuyun"
echo ""
echo "🎮 MinecraftTR ile harika bir sunucu website'i oluşturun!"
echo "🇹🇷 Türkiye'nin en iyi Minecraft sunucusu olmaya hazır mısınız?"