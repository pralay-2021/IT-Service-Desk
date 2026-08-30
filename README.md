# IT Service Desk — Web App

একটি স্ট্যাটিক ওয়েব অ্যাপ (শুধু HTML/CSS/JS, কোনো সার্ভার লাগবে না) যা GitHub Pages থেকে চালানো যায় এবং সব ডেটা সরাসরি আপনার GitHub রিপোজিটরিতে JSON ফাইল হিসেবে সংরক্ষণ করে (GitHub Contents API ব্যবহার করে)।

## ফিচার
- লগইন স্ক্রিন (GitHub রিপোর সাথে সংযোগ)
- ড্যাশবোর্ড / মেইন মেনু
- **IT Product Entry** ফর্ম (Product ID, Date, Product Name, Category, Quantity, Location, Remarks)
- **IT Repairing Product Entry** ফর্ম (Ticket No, Date, Name, Device Name, Problem, Remarks)
- রেকর্ড লিস্ট (সার্চসহ) এবং **Excel (.xlsx) এক্সপোর্ট**
- সব ডেটা `data/products.json` ও `data/repairs.json` ফাইলে, আপনার GitHub রিপোতে কমিট আকারে জমা থাকে

## ধাপ ১ — GitHub রিপো তৈরি করুন
1. GitHub-এ একটি নতুন **repository** তৈরি করুন (public বা private, দুটোই চলবে)।
2. এই ফোল্ডারের সব ফাইল (`index.html`, `dashboard.html`, `product-entry.html`, `repair-entry.html`, `records.html`, `style.css`, `app.js`, `data/` ফোল্ডার) সেই রিপোতে আপলোড/পুশ করুন।

```bash
git init
git add .
git commit -m "Initial commit: IT Service Desk"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## ধাপ ২ — GitHub Pages চালু করুন
1. রিপোর **Settings → Pages** এ যান।
2. Source: **Deploy from a branch** → Branch: `main` → folder: `/ (root)` সিলেক্ট করে Save করুন।
3. কিছুক্ষণ পর একটি লিংক পাবেন, যেমন: `https://<your-username>.github.io/<your-repo>/` — এটাই আপনার লাইভ অ্যাপ।

## ধাপ ৩ — Personal Access Token (PAT) তৈরি করুন
ডেটা GitHub-এ সেভ করার জন্য একটি টোকেন লাগবে যাতে ওই রিপোতে লেখার (write) অনুমতি থাকে।

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. **Repository access:** শুধু আপনার এই রিপোটি সিলেক্ট করুন
3. **Permissions → Repository permissions → Contents:** সেট করুন **Read and write**
4. টোকেন Generate করে কপি করে রাখুন (এটি একবারই দেখানো হয়)

> ⚠️ টোকেন গোপন রাখুন — এটি ব্রাউজারের `localStorage`-এ থাকে এবং সরাসরি GitHub API-তে ব্যবহার হয়, অন্য কোথাও পাঠানো হয় না। শুধু বিশ্বস্ত/অফিসিয়াল ডিভাইস থেকে লগইন করুন।

## ধাপ ৪ — অ্যাপে লগইন করুন
1. আপনার GitHub Pages লিংক খুলুন।
2. ফর্মে দিন: আপনার নাম, GitHub username, রিপো নাম, branch (`main`), এবং টোকেন।
3. "সংযুক্ত করে লগইন করুন" চাপুন — সংযোগ ঠিক থাকলে ড্যাশবোর্ডে চলে যাবে।

## নোট
- একাধিক ব্যবহারকারী একই রিপো ব্যবহার করলে সবার এন্ট্রি একই `data/*.json` ফাইলে জমা হবে (প্রত্যেকের নিজস্ব টোকেন থাকবে)।
- প্রতিটি এন্ট্রি একটি আলাদা Git কমিট হিসেবে জমা হয়, তাই রিপোর কমিট হিস্ট্রি থেকেও সব পরিবর্তনের রেকর্ড (কে, কখন) দেখা যাবে।
- "IT Product Entry" ফর্মের ফিল্ডগুলো (Product ID, Category, Quantity, Location) ধরে নেওয়া হয়েছে — প্রয়োজনে সহজেই পরিবর্তন করা যাবে।
