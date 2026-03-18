# English Vocab (Flashcard App)

Abonelik tabanli dil ogrenim uygulamalarina alternatif olarak gelistirdigim, tamamen kisisel kullanimim icin tasarladigim ucretsiz ve premium arayuze sahip React Native (Expo) kelime uygulamasi.

## Proje Amaci
Bu projeyi tamamen kendi kisisel Ingilizce ogrenim surecim icin gelistirdim. Piyasadaki dil ogrenim uygulamalarinin cogu en temel ozellikleri bile abonelik sistemleriyle sinirladigi icin, hicbir kisitlamasi olmayan, reklamsiz ve sadece ogrenmeye odaklanan kendi aracimi yapma ihtiyaci hissettim.

## One Cikan Ozellikler

- Genis Kelime Havuzu: Kendi kelime dagarcigim icin ozenle sectigim 2600'den fazla Ingilizce kelime.
- Coklu Seviye ve Kategoriler: Gunluk iletisimin (A2-B1) yani sira, ileri duzey is hayati (B2-C1) ve Yazilim/Teknoloji terimleri.
- Deep Sea Arayuzu: Koyu mavi renk paleti ve cam (glassmorphic) hissiyatina sahip, goz yormayan premium tasarim.
- Dokunsal Geri Bildirim (Haptic Feedback): Buton kullanimlarinda ve 3 boyutlu kart cevirme animasyonlarinda iOS native titresim motoru entegrasyonu.
- Offline-First Mimari: Herhangi bir sunucu baglantisi gerektirmez. Verileri JSON dosyasindan cekerek dogrudan cihaz hafizasinda (AsyncStorage) tutar ve uygulama tamamen cevrimdisi calisir.
- Akilli Karistirma (Fisher-Yates): Kelimelerin her defasinda rastgele sirayla gelmesini saglayarak siralama ezberini onler.

## Kullanilan Teknolojiler

- Framework: React Native (Expo SDK 54)
- Navigation: React Navigation (Native Stack)
- Storage: AsyncStorage
- Diger Kutuphaneler: expo-haptics, Animated API

## Kurulum (Developer)

Projeyi test etmek veya gelistirmek isterseniz:

```bash
git clone https://github.com/SAMETKUCUK1/english-flashcards-app.git
cd english-flashcards-app
npm install
npx expo start
```
