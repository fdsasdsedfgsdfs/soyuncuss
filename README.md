# MinecraftTR - Türk Minecraft Sunucu Website'i

Bu proje, Türkiye'deki Minecraft sunucuları için modern, özellik dolu bir website şablonudur. SonoYuncu ve CraftRise gibi popüler Türk Minecraft sunucularından ilham alınarak geliştirilmiştir.

## 🚀 Özellikler

### 🎮 Oyuncu Yönetimi
- **AuthMe Plugin Entegrasyonu**: Oyun içi hesaplarla tam uyumluluk
- **Kullanıcı Profilleri**: Minecraft skin görüntüleme, istatistikler
- **Gerçek Zamanlı Durum**: Oyuncu sayısı ve sunucu durumu

### 🛒 Market Sistemi
- **Kategorize Ürünler**: Rütbeler, kitler, kozmetikler
- **Çoklu Para Birimi**: Coin ve token sistemi
- **Anında Teslimat**: Satın alınan ürünler otomatik olarak oyunda verilir
- **Güvenli Ödeme**: Şifreli ve güvenli satın alma işlemleri

### 📊 İstatistik ve Sıralama
- **Canlı Sunucu İstatistikleri**: Oyuncu sayısı, uptime
- **Top Donator Listesi**: En çok para yükleyen oyuncular
- **Oyun Süresi Sıralaması**: En aktif oyuncular
- **Profil İstatistikleri**: Bireysel oyuncu verileri

### 📰 İçerik Yönetimi
- **Haberler Sistemi**: Kategorizasyon ve öne çıkan haberler
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **SEO Optimizasyonu**: Arama motoru dostu

### 🎨 Modern Tasarım
- **Dark Theme**: Göz yormayan karanlık tema
- **Smooth Animasyonlar**: CSS3 ve JavaScript animasyonları
- **Tailwind CSS**: Modern ve responsive tasarım
- **Font Awesome Icons**: Profesyönel ikonlar

## 🛠️ Teknolojiler

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Veritabanı (AuthMe uyumlu)
- **bcryptjs** - Şifre hashleme
- **JWT** - Kimlik doğrulama

### Frontend
- **EJS** - Template engine
- **Tailwind CSS** - CSS framework
- **Alpine.js** - Minimal JavaScript framework
- **Font Awesome** - İkon kütüphanesi

### External APIs
- **Mojang API** - Minecraft profil bilgileri
- **Crafatar** - Minecraft skin/avatar servisi

## 📋 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- NPM veya Yarn

### 1. Projeyi İndirin
```bash
git clone https://github.com/yourusername/minecraft-server-website.git
cd minecraft-server-website
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Veritabanını Kurun
```sql
CREATE DATABASE minecraft_server;
```

### 4. Çevre Değişkenlerini Ayarlayın
`.env` dosyasını düzenleyin:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=minecraft_server
SESSION_SECRET=your_session_secret
```

### 5. Uygulamayı Başlatın
```bash
npm start
```

Website `http://localhost:3000` adresinde çalışacaktır.

## 🎮 AuthMe Plugin Entegrasyonu

Bu website AuthMe plugin'i ile tam uyumludur. AuthMe tablosu otomatik olarak oluşturulur ve mevcut AuthMe kurulumları ile çalışır.

### AuthMe Veritabanı Ayarları
```yaml
# AuthMe config.yml
DataSource:
  backend: 'MYSQL'
  mySQLHost: 'localhost'
  mySQLPort: '3306'
  mySQLDatabase: 'minecraft_server'
  mySQLUsername: 'root'
  mySQLPassword: 'your_password'
  mySQLTablename: 'authme'
```

## 🔧 Yapılandırma

### Minecraft Server Entegrasyonu
```javascript
// server.js içinde
// RCON bağlantısı için
const rcon = new RCON({
  host: process.env.MINECRAFT_SERVER_IP,
  port: process.env.MINECRAFT_RCON_PORT,
  password: process.env.RCON_PASSWORD
});
```

### Market Ürünleri Ekleme
```sql
INSERT INTO market_items (name, description, price, currency, category, command) 
VALUES ('VIP Rank', 'VIP oyuncu rütbesi', 500, 'coins', 'Rütbeler', 'lp user {username} parent add vip');
```

## 📱 Responsive Tasarım

Website tüm cihazlarda mükemmel görünüm sağlar:
- **Desktop**: Full özellikli deneyim
- **Tablet**: Dokunmatik optimize edilmiş
- **Mobile**: Hızlı ve kullanışlı

## 🔒 Güvenlik

- **Password Hashing**: bcrypt ile güvenli şifre saklama
- **Session Management**: Güvenli oturum yönetimi
- **Rate Limiting**: DDoS koruması
- **Input Validation**: XSS ve SQL injection koruması
- **CORS**: Cross-origin request koruması

## 🚀 Performans

- **Caching**: Veritabanı sorguları önbelleğe alınır
- **Compression**: Gzip sıkıştırma
- **Lazy Loading**: Görseller gecikmeli yüklenir
- **Minification**: CSS ve JS dosyaları optimize edilir

## 📄 API Endpoints

### Genel API'lar
```
GET  /api/server/stats     - Sunucu istatistikleri
GET  /api/player/:username - Oyuncu profil bilgileri
POST /purchase             - Ürün satın alma
```

### Kimlik Doğrulama
```
POST /login    - Kullanıcı girişi
POST /register - Kullanıcı kaydı
GET  /logout   - Çıkış yapma
```

## 🎨 Özelleştirme

### Renk Teması Değiştirme
`public/css/custom.css` dosyasında:
```css
.btn-primary {
    @apply bg-green-600 hover:bg-green-700; /* Yeşil teması */
}
```

### Logo ve Branding
- Logo: `public/images/logo.png`
- Favicon: `public/images/favicon.ico`
- Site adı: `views/layout.ejs` içinde

## 🔄 Güncellemeler

### Sunucu İstatistikleri
İstatistikler her 30 saniyede bir güncellenir. `server.js` içinde:
```javascript
cron.schedule('*/30 * * * * *', updateServerStats);
```

### Oyuncu Verileri Senkronizasyonu
AuthMe plugin'i ile otomatik senkronizasyon sağlanır.

## 🎯 Gelecek Özellikler

- [ ] **Discord Bot Entegrasyonu**
- [ ] **PayPal/Stripe Ödeme Sistemi**
- [ ] **Başarım Sistemi**
- [ ] **Forum Modülü**
- [ ] **Etkinlik Takvimi**
- [ ] **Çoklu Dil Desteği**
- [ ] **Admin Panel**
- [ ] **Ticket Sistemi**

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🆘 Destek

Sorun yaşıyorsanız:
1. [Issues](https://github.com/yourusername/minecraft-server-website/issues) bölümünde arayın
2. Yeni issue açın
3. Discord sunucumuzdan destek alın

## 🏆 Teşekkürler

- **SonoYuncu** ve **CraftRise** - İlham kaynağı
- **AuthMe Team** - Mükemmel authentication plugin'i
- **Mojang** - Minecraft API
- **Crafatar** - Skin servisi

---

**MinecraftTR** ile Türkiye'nin en iyi Minecraft sunucu website'ini oluşturun! 🎮🇹🇷