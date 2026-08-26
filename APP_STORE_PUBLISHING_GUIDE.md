# 📱 MealOptimiza: App Store & Google Play Publishing Master Manual

This manual provides the step-by-step instructions for publishing **MealOptimiza** to the **Apple App Store** and **Google Play Store**.

---

## 1. 📋 Prerequisites & Developer Accounts

| Platform | Developer Portal | Cost | Approval Time |
| :--- | :--- | :--- | :--- |
| **Apple iOS** | [developer.apple.com](https://developer.apple.com) | $99 / year | 24–48 hours |
| **Google Play** | [play.google.com/console](https://play.google.com/console) | $25 one-time | 24–72 hours |

---

## 2. 📦 Native Capacitor Project Build

The repository is pre-configured with `capacitor.config.json` targeting App ID `com.mealoptimiza.app`.

### Build & Sync Commands:

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Native iOS and Android platforms (one-time)
npx cap add ios
npx cap add android

# 3. Copy web assets and sync plugins
npx cap sync
```

---

## 3. 🍎 Apple App Store Submission (iOS)

### Step 3.1: Open in Xcode
```bash
npx cap open ios
```

### Step 3.2: Configure Signing & Capabilities
1. In Xcode, select the **App** project target.
2. Go to **Signing & Capabilities** tab:
   - **Team**: Select your Apple Developer Team.
   - **Bundle Identifier**: `com.mealoptimiza.app`
3. Add Capabilities:
   - **Push Notifications** (for post-meal glucose walk nudges).
   - **Camera Usage Description** in `Info.plist`:
     `NSCameraUsageDescription`: *"MealOptimiza uses your camera to scan African meals, calculate portion sizes, and log barcode nutrition."*
   - **Photo Library Usage Description** in `Info.plist`:
     `NSPhotoLibraryUsageDescription`: *"MealOptimiza accesses photos to analyze meal images and attach clinical lab documents."*

### Step 3.3: Archive & Upload to TestFlight
1. Select **Product > Scheme > Any iOS Device (arm64)**.
2. Click **Product > Archive**.
3. Once archived, click **Distribute App > App Store Connect > Upload**.
4. Within 15 minutes, your build will appear on **App Store Connect > TestFlight**.

---

## 4. 🤖 Google Play Store Submission (Android)

### Step 4.1: Open in Android Studio
```bash
npx cap open android
```

### Step 4.2: Generate Signed Android App Bundle (`.aab`)
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)**.
3. Create or select your release Keystore (`release-key.jks`).
4. Select `release` build variant and click **Finish**.
5. The generated `.aab` file will be in `android/app/release/app-release.aab`.

### Step 4.3: Upload to Google Play Console
1. Go to **Google Play Console > Your App > Production / Internal Testing**.
2. Create a new release and drag-and-drop `app-release.aab`.

---

## 5. 🎨 Store Visual Assets & Dimensions

### App Icon:
- **1024 × 1024 px** (PNG, 24-bit RGB, no transparency, square corners).

### Required Screenshots:
- **iOS 6.7" Display** (iPhone 16 Pro Max / 15 Pro Max): `1290 × 2796 px` (Minimum 3 screenshots).
- **iOS 6.5" Display** (iPhone 11 Pro Max / XS Max): `1242 × 2688 px` (Minimum 3 screenshots).
- **Android Phone**: Minimum `1080 × 2400 px` (Minimum 4 screenshots).

---

## 6. 📝 App Store Metadata & ASO (App Store Optimization)

### App Title:
`MealOptimiza: African Food AI`

### Subtitle (iOS - max 30 chars):
`Blood Sugar, Jollof & Health`

### Keywords (iOS - max 100 chars):
`nutrition,diabetes,african food,blood sugar,jollof,nigerian food,fufu,hypertension,calories,diet`

### Category:
- **Primary**: Health & Fitness
- **Secondary**: Medical

### Promotional Text:
*The first AI metabolic assistant built specifically for African & diaspora cuisine. Scan jollof, swallow, and soups to protect your blood sugar and blood pressure.*

### Privacy Policy URL:
`https://mealoptimiza.com/privacy`

### Terms of Service URL:
`https://mealoptimiza.com/terms`

---

## 7. ⚖️ Apple Review Notes & Test Account

When submitting for App Store Review, provide reviewer credentials in **App Review Information**:
- **Demo Username**: `reviewer@mealoptimiza.com`
- **Demo Password**: `DemoReviewer2026!`
- **Review Notes**:
  *"MealOptimiza provides nutritional insights and metabolic health education tailored to African and diaspora diets. It includes a clinical disclaimer on first launch and allows users to export doctor health summaries (PDF) for their physicians."*
