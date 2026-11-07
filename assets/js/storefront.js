/* Kyvora storefront. Production catalog integration will be connected after the Supabase project and client inventory are confirmed. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const grid = $('#product-grid');
  const search = $('#search-input');
  const sort = $('#sort-select');
  const filters = $('#filters');
  const count = $('#result-count');
  const menu = $('.menu-toggle');
  const header = $('.site-header');

  // Intentionally empty: no sample inventory is presented as real stock.
  let products = [];
  let activeFilter = 'all';

  const rupiah = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(Number(value) || 0);

  function render() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = products.filter((item) => {
      const searchable = [item.name, item.game, item.description, item.code].join(' ').toLowerCase();
      const matchesQuery = searchable.includes(query);
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'available' && item.status === 'available');
      return matchesQuery && matchesFilter;
    });

    if (sort?.value === 'low') visible.sort((a,b) => a.price - b.price);
    if (sort?.value === 'high') visible.sort((a,b) => b.price - a.price);
    if (sort?.value === 'newest') visible.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    count.textContent = String(visible.length).padStart(2, '0');
    if (!visible.length) {
      grid.innerHTML = '<div class="empty-state"><span>✦</span><h3>Katalog sedang disiapkan</h3><p>Belum ada akun yang cocok atau produk belum ditambahkan oleh admin.</p></div>';
      return;
    }

    grid.innerHTML = visible.map((item) => {
      const image = item.imageUrl
        ? '<img src="' + escapeHTML(item.imageUrl) + '" alt="' + escapeHTML(item.name) + '" loading="lazy">'
        : '<div class="product-image">KYVORA.ID / ACCOUNT</div>';
      return '<article class="product-card">' + image +
        '<div class="product-info"><h3>' + escapeHTML(item.name) + '</h3>' +
        '<p>' + escapeHTML(item.game || 'Game account') + ' · ' + escapeHTML(item.description || '') + '</p>' +
        '<div class="product-price">' + rupiah(item.price) + '</div></div></article>';
    }).join('');
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[char]);
  }

  search?.addEventListener('input', render);
  sort?.addEventListener('change', render);
  filters?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    filters.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('nav-open', !expanded);
  });
  document.querySelectorAll('.desktop-nav a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('nav-open');
    menu?.setAttribute('aria-expanded', 'false');
  }));
  $('#year').textContent = new Date().getFullYear();
  render();
})();