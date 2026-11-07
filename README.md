# Kyvora.id

Website storefront and temporary admin prototype for the Kyvora.id game-account shop.

## Main pages

- `index.html` — public storefront and account catalog.
- `faq.html` — customer FAQ.
- `testimonials.html` — public customer testimonials.
- `admin.html` — admin dashboard.
- `admin-catalog.html` — add, edit, delete, and manage game-account listings.
- `admin-testimonials.html` — add, edit, delete, and manage customer testimonials.

## Admin prototype features

- Hamburger navigation between Dashboard, Kelola katalog, Kelola testimoni, and Lihat website.
- Catalog and testimonial records support up to 20 photos per item.
- Image crop controls include 9:16, 16:9, 1:1, and 3:4 ratios, zoom, and horizontal/vertical positioning.
- Product data and compressed photos are temporarily stored in browser LocalStorage under `kyvora_products_v1`.
- Testimonial data and compressed photos are temporarily stored under `kyvora_testimonials_v1`.
- JSON backup export is available on both management pages.

## Important temporary-mode limitations

LocalStorage is browser- and device-specific. Admin changes are not synchronized to other devices or public visitors. The testimonial page can only read the data stored in the same browser until Supabase is connected. There is no secure admin authentication yet. Do not use this as the live production data system.

Supabase Database, Storage, and authenticated admin access will be connected after the frontend/admin workflow is completed. Never expose a Supabase service-role key in frontend code.

## Deployment

Enable GitHub Pages for this repository using the `main` branch and `/(root)` as the publishing source:

`https://leovbr.github.io/Kyvora.id/`
