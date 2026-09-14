// public/sw.js
const CACHE_NAME = 'version-1';
const urlsToCache = [ '/', '/offline' ];

// نصب سرویس‌ورکر و کش کردن فایل‌ها
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// اینترسپت کردن درخواست‌ها و پاسخ دادن از کش
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // اگر در کش پیدا شد، همان را برگردان، در غیر این صورت به شبکه برو
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});