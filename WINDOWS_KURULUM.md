# 🪟 Windows Kurulum Rehberi - MinecraftTR

Bu rehber Windows işletim sisteminde MinecraftTR website'ini kurmanız için gereken tüm adımları içerir.

## 📋 Gereksinimler

### 1. Node.js Kurulumu
1. [Node.js resmi websitesine](https://nodejs.org/) gidin
2. **LTS sürümünü** indirin (Önerilen)
3. İndirilen `.msi` dosyasını çalıştırın
4. Kurulum sihirbazını takip edin (tüm varsayılan ayarları kabul edebilirsiniz)
5. Kurulum tamamlandıktan sonra bilgisayarınızı yeniden başlatın

**Kurulumu Doğrulama:**
- `Win + R` tuşlarına basın
- `cmd` yazın ve Enter'a basın
- Komut satırında şunları yazın:
```cmd
node --version
npm --version
```
- Her ikisi de sürüm numarası döndürüyorsa kurulum başarılı

### 2. MySQL Kurulumu (3 Seçenek)

#### Seçenek A: XAMPP (Önerilen - Kolay)
1. [XAMPP'i indirin](https://www.apachefriends.org/download.html)
2. Kurulum dosyasını çalıştırın
3. Apache ve MySQL'i seçin
4. XAMPP Control Panel'i açın
5. MySQL'i başlatın (Start butonuna basın)

#### Seçenek B: MySQL Standalone
1. [MySQL Community Server'ı indirin](https://dev.mysql.com/downloads/mysql/)
2. MSI Installer'ı seçin
3. Kurulum sihirbazını takip edin
4. Root şifresi belirleyin (unutmayın!)

#### Seçenek C: WAMP Server
1. [WAMP'i indirin](https://www.wampserver.com/en/)
2. Kurulum dosyasını çalıştırın
3. WAMP'i başlatın

## 🚀 Website Kurulumu

### Adım 1: Proje Dosyalarını İndirin
1. Proje klasörünü bilgisayarınıza kopyalayın
2. Dosya Gezgini'nde proje klasörüne gidin

### Adım 2: Kurulum Scriptini Çalıştırın
1. Proje klasöründe `install.bat` dosyasını bulun
2. Dosyaya **çift tıklayın** veya **sağ tık > Yönetici olarak çalıştır**
3. Script otomatik olarak:
   - Node.js kurulumunu kontrol eder
   - Gerekli paketleri yükler
   - Klasör yapısını oluşturur
   - Yapılandırma dosyalarını hazırlar

### Adım 3: Veritabanını Oluşturun

#### XAMPP Kullanıyorsanız:
1. XAMPP Control Panel'de MySQL'in çalıştığını kontrol edin
2. Web tarayıcısında `http://localhost/phpmyadmin` adresine gidin
3. Sol tarafta "Yeni" butonuna tıklayın
4. Veritabanı adını `minecraft_server` yazın
5. "Oluştur" butonuna tıklayın

#### MySQL Workbench Kullanıyorsanız:
1. MySQL Workbench'i açın
2. Local instance'a bağlanın
3. Şu komutu çalıştırın:
```sql
CREATE DATABASE minecraft_server;
```

### Adım 4: Yapılandırma Ayarları
1. Proje klasöründe `.env` dosyasını Not Defteri ile açın
2. Veritabanı ayarlarını düzenleyin:

```env
# XAMPP kullanıyorsanız:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=minecraft_server

# MySQL standalone kullanıyorsanız:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sizin_mysql_sifreniz
DB_NAME=minecraft_server
```

### Adım 5: Website'i Başlatın
1. `start.bat` dosyasına çift tıklayın
2. Komut satırında "Website başlatılıyor..." mesajını göreceksiniz
3. Web tarayıcınızda `http://localhost:3000` adresine gidin

## 🎨 Özelleştirme

### Logo ve Görseller Ekleme
1. `public/images/` klasörüne gidin
2. Aşağıdaki dosyaları ekleyin:
   - `logo.png` - Website logosu
   - `favicon.ico` - Browser ikonu
   - `default-avatar.png` - Varsayılan kullanıcı avatarı
   - `minecraft-bg.jpg` - Ana sayfa arka planı

### Sunucu Bilgilerini Güncelleme
1. `.env` dosyasını açın
2. Aşağıdaki bilgileri güncelleyin:
```env
WEBSITE_NAME=SizinSunucuAdınız
ADMIN_EMAIL=admin@sizinsite.com
MINECRAFT_SERVER_IP=sizin.sunucu.ip.adresi
```

## 🛠️ Sorun Giderme

### Problem: "node komutu tanınmıyor"
**Çözüm:**
1. Node.js'i yeniden kurun
2. Bilgisayarı yeniden başlatın
3. PATH değişkeninin doğru olduğunu kontrol edin

### Problem: "npm install" hatası
**Çözüm:**
1. Komut satırını **yönetici olarak** açın
2. Proje klasörüne gidin: `cd C:\path\to\your\project`
3. `npm install` komutunu çalıştırın

### Problem: MySQL bağlantı hatası
**Çözüm:**
1. MySQL servisinin çalıştığını kontrol edin
2. `.env` dosyasındaki veritabanı bilgilerini kontrol edin
3. Şifreyi doğru girdiğinizden emin olun

### Problem: Port 3000 kullanımda
**Çözüm:**
1. `.env` dosyasında `PORT=3001` yapın
2. Website'e `http://localhost:3001` adresinden erişin

## 📱 Production Kurulumu

Sunucu için production kurulumu yapmak istiyorsanız:

### 1. PM2 ile Çalıştırma
```cmd
npm install -g pm2
pm2 start server.js --name "minecraft-website"
pm2 startup
pm2 save
```

### 2. Nginx Reverse Proxy (İsteğe bağlı)
Nginx kullanarak domain adınızı website'e yönlendirebilirsiniz.

## 📞 Destek

Sorun yaşıyorsanız:
1. `logs/` klasöründeki hata loglarını kontrol edin
2. README.md dosyasını okuyun
3. GitHub Issues'da sorun bildirin

## ✅ Kurulum Kontrol Listesi

- [ ] Node.js kuruldu ve çalışıyor
- [ ] MySQL kuruldu ve çalışıyor
- [ ] `install.bat` başarıyla çalıştırıldı
- [ ] `minecraft_server` veritabanı oluşturuldu
- [ ] `.env` dosyası düzenlendi
- [ ] Website `http://localhost:3000` adresinde açılıyor
- [ ] Kayıt olma/giriş yapma çalışıyor
- [ ] Market sayfası yükleniyor

Tüm maddeler tamamlandıysa kurulum başarılı! 🎉

## 🎮 AuthMe Plugin Entegrasyonu

Minecraft sunucunuzda AuthMe plugin'i kullanıyorsanız:

1. AuthMe config.yml dosyasını düzenleyin:
```yaml
DataSource:
  backend: 'MYSQL'
  mySQLHost: 'localhost'
  mySQLPort: '3306'
  mySQLDatabase: 'minecraft_server'
  mySQLUsername: 'root'
  mySQLPassword: 'sizin_mysql_sifreniz'
  mySQLTablename: 'authme'
```

2. Website ile oyun arasında kullanıcılar senkronize olacak!

---

**MinecraftTR** ile Windows'ta mükemmel bir Minecraft sunucu website'i oluşturun! 🎮🇹🇷