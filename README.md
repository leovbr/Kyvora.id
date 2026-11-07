# Kyvora.id

Website storefront for the Kyvora game-account shop.

## Current structure

```
.
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/storefront.js
└── README.md
```

## Current status

- Responsive storefront foundation
- Hero, catalog, benefits, FAQ, and footer sections
- Catalog search, availability filter, and sorting UI
- No fabricated inventory: the catalog remains empty until real products are supplied
- No production database or admin credentials are embedded in the frontend

## Next production steps

1. Confirm the shop's WhatsApp contact and game categories.
2. Connect the production Supabase project (public URL and anon key only; never expose service-role keys).
3. Create and apply the database schema, access policies, and storage bucket.
4. Build admin authentication and product/stock management.
5. Connect the public catalog to Supabase and add product detail / WhatsApp checkout flow.
6. Test mobile, desktop, access control, and deployment.

## Deployment

Enable GitHub Pages for this repository using the `main` branch and `/(root)` as the publishing source. The site will then be available at:

`https://leovbr.github.io/Kyvora.id/`

The separate portfolio demo should be created from a copy after the production site is complete. Its LocalStorage data must remain isolated from production.
