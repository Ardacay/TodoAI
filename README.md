# TodoAI - Yapay Zeka Destekli Akıllı Görev Yönetimi

TodoAI, günlük görevlerinizi organize etmenize yardımcı olan, yapay zeka destekli modern bir görev yönetim uygulamasıdır. Kullanıcı dostu arayüzü ve akıllı analiz özellikleri ile üretkenliğinizi artırmayı hedefler.

## 🚀 Özellikler

- **Kullanıcı Kimlik Doğrulama:** Güvenli kayıt ve giriş sistemi (JWT & Bcrypt).
- **Akıllı Görev Yönetimi:**
  - Görev ekleme, düzenleme, silme ve tamamlama.
  - Öncelik seviyeleri, süre ve son tarih belirleme.
- **Görev Bağımlılıkları:** Bir görevi tamamlamak için diğer görevlerin bitmesini zorunlu kılan bağımlılık sistemi.
- **Yapay Zeka Analizi:** Google Gemini entegrasyonu ile görevlerinizi analiz eder, riskleri belirler ve önceliklendirme önerileri sunar.
- **Modern Arayüz:** Tailwind CSS ile tasarlanmış responsive ve şık dark mode arayüzü.

## 🛠 Kullanılan Teknolojiler

### Frontend
- **React (Vite):** Hızlı ve modern UI geliştirme.
- **Tailwind CSS:** Responsive ve özelleştirilebilir stiller.
- **Axios:** HTTP istekleri yönetimi.

### Backend
- **Node.js & Express:** Hızlı ve ölçeklenebilir sunucu yapısı.
- **SQLite:** Hafif ve pratik veritabanı çözümü.
- **JWT (JSON Web Tokens):** Güvenli kimlik doğrulama.
- **Google Generative AI SDK:** Yapay zeka analizleri için.

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/Ardacay/TodoAI.git
cd TodoAI
```

### 2. Bağımlılıkları Yükleyin
Ana dizindeyken hem client hem de server bağımlılıklarını yükleyin:

```bash
cd client
npm install
cd ../server
npm install
cd ..
```

### 3. Çevre Değişkenlerini Ayarlayın
`server` klasörü içinde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
PORT=5000
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
SECRET_KEY=your_jwt_secret_key
```

> Not: `GOOGLE_API_KEY` için [Google AI Studio](https://aistudio.google.com/)'dan bir anahtar almanız gerekmektedir.

### 4. Uygulamayı Başlatın
Ana dizinde aşağıdaki komutu çalıştırarak hem sunucuyu hem de istemciyi aynı anda başlatabilirsiniz:

```bash
npm run dev
```

Alternatif olarak ayrı ayrı başlatmak için:
- Server: `cd server && node index.js`
- Client: `cd client && npm run dev`

## 📷 Ekran Görüntüleri
_(Buraya uygulama ekran görüntüleri eklenebilir)_

## 🤝 Katkıda Bulunma
Katkılarınızı bekliyoruz! Lütfen bir pull request açmadan önce bir issue oluşturarak değişiklikleri tartışın.

## 📄 Lisans
Bu proje [ISC](LICENSE) lisansı ile lisanslanmıştır.
