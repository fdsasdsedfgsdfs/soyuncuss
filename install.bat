@echo off
chcp 65001 >nul
echo.
echo 🎮 MinecraftTR Website Kurulum Scripti 🇹🇷
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js bulunamadı! Lütfen Node.js'i yükleyin: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js sürümü:
node --version
echo ✅ NPM sürümü:
npm --version
echo.

REM Install dependencies
echo 📦 Bağımlılıklar yükleniyor...
npm install

if errorlevel 1 (
    echo ❌ Bağımlılık yükleme hatası!
    pause
    exit /b 1
) else (
    echo ✅ Bağımlılıklar başarıyla yüklendi!
)

echo.

REM Create directories
echo 📁 Dizinler oluşturuluyor...
if not exist "public\images\ranks" mkdir "public\images\ranks"
if not exist "public\images\kits" mkdir "public\images\kits"
if not exist "public\images\cosmetics" mkdir "public\images\cosmetics"
if not exist "public\images\news" mkdir "public\images\news"
if not exist "public\css" mkdir "public\css"
if not exist "public\js" mkdir "public\js"
if not exist "views" mkdir "views"
if not exist "logs" mkdir "logs"

echo ✅ Dizinler oluşturuldu!
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 🔧 Çevre değişkenleri dosyası oluşturuluyor...
    
    REM Generate random session secret using current time
    for /f "tokens=1-5 delims=/:. " %%a in ("%date% %time%") do (
        set SESSION_SECRET=minecraft-tr-session-%%a%%b%%c%%d%%e
        set JWT_SECRET=minecraft-tr-jwt-%%a%%b%%c%%d%%e
    )
    
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=minecraft_server
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Security ^(Automatically generated^)
        echo SESSION_SECRET=!SESSION_SECRET!
        echo JWT_SECRET=!JWT_SECRET!
        echo.
        echo # Minecraft Server Configuration
        echo MINECRAFT_SERVER_IP=localhost
        echo MINECRAFT_SERVER_PORT=25565
        echo RCON_PASSWORD=your-rcon-password
        echo.
        echo # External APIs
        echo MOJANG_API_URL=https://api.mojang.com
        echo CRAFATAR_API_URL=https://crafatar.com
        echo.
        echo # Website Configuration
        echo WEBSITE_URL=http://localhost:3000
        echo WEBSITE_NAME=MinecraftTR
        echo ADMIN_EMAIL=admin@minecrafttr.com
    ) > .env
    
    echo ✅ .env dosyası oluşturuldu!
    echo ⚠️  Lütfen .env dosyasını düzenleyerek veritabanı ayarlarınızı yapın!
) else (
    echo ✅ .env dosyası zaten mevcut.
)

echo.

REM Create placeholder images info
echo 🖼️  Örnek resim dizinleri oluşturuluyor...

(
    echo # Images Directory
    echo.
    echo Bu dizinde website için gerekli resimler bulunur:
    echo.
    echo ## Gerekli Resimler:
    echo - logo.png ^(Website logosu^)
    echo - favicon.ico ^(Website ikonu^)
    echo - default-avatar.png ^(Varsayılan kullanıcı avatarı^)
    echo - default-news.jpg ^(Varsayılan haber resmi^)
    echo - default-item.png ^(Varsayılan ürün resmi^)
    echo - minecraft-bg.jpg ^(Ana sayfa arkaplan resmi^)
    echo - og-image.png ^(Social media paylaşım resmi^)
    echo.
    echo ## Alt Dizinler:
    echo - ranks/ ^(Rütbe resimleri^)
    echo - kits/ ^(Kit resimleri^)
    echo - cosmetics/ ^(Kozmetik resimleri^)
    echo - news/ ^(Haber resimleri^)
    echo.
    echo Resimler PNG veya JPG formatında olmalıdır.
) > "public\images\README.md"

echo ✅ Resim dizinleri hazır!
echo.

REM Create startup script
echo 🚀 Başlatma scripti oluşturuluyor...

(
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🎮 MinecraftTR Website başlatılıyor...
    echo echo 🌐 Website: http://localhost:3000
    echo echo ⏹️  Durdurmak için: Ctrl+C
    echo echo.
    echo npm start
    echo pause
) > start.bat

echo ✅ Başlatma scripti oluşturuldu!
echo.

REM Database setup information
echo 🗄️  Veritabanı Kurulumu
echo =====================
echo.
echo MySQL kurulumu için:
echo 1. XAMPP, WAMP veya standalone MySQL yükleyin
echo 2. MySQL'i başlatın
echo 3. phpMyAdmin veya MySQL Workbench ile bağlanın
echo 4. "minecraft_server" adında veritabanı oluşturun
echo 5. .env dosyasında veritabanı ayarlarını yapın
echo.

REM Final instructions
echo 🎉 Kurulum Tamamlandı!
echo ====================
echo.
echo 📋 Sonraki Adımlar:
echo 1. MySQL'i yükleyin ve başlatın
echo 2. "minecraft_server" veritabanını oluşturun
echo 3. .env dosyasını düzenleyin ^(veritabanı ayarları^)
echo 4. public\images\ dizinine gerekli resimleri ekleyin
echo 5. Website'i başlatın: start.bat dosyasını çalıştırın
echo 6. Tarayıcınızda http://localhost:3000 adresini açın
echo.
echo 📚 Daha fazla bilgi için README.md dosyasını okuyun
echo.
echo 🎮 MinecraftTR ile harika bir sunucu website'i oluşturun!
echo 🇹🇷 Türkiye'nin en iyi Minecraft sunucusu olmaya hazır mısınız?
echo.
pause