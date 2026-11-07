/* Kyvora.id admin prototype: browser-local storage until Supabase is connected. */
(() => {
  const KEY = 'kyvora_products_v1';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#product-form');
  const list = $('#admin-product-list');
  const imageInput = $('#product-image');
  let products = readProducts();
  let pendingImage = '';
  let editingImage = '';

  function readProducts() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }
  function writeProducts() {
    try {
      localStorage.setItem(KEY, JSON.stringify(products));
      return true;
    } catch (error) {
      $('#form-message').textContent = 'Penyimpanan browser penuh. Coba gunakan foto yang lebih kecil.';
      return false;
    }
  }
  const rupiah = (value) => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value)||0);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function updateStats() {
    $('#total-products').textContent = products.length;
    $('#available-products').textContent = products.filter(p => p.status === 'available').length;
  }
  function render() {
    const query = ($('#admin-search').value || '').trim().toLowerCase();
    const visible = products.filter(p => [p.name,p.game,p.description].join(' ').toLowerCase().includes(query));
    updateStats();
    if (!visible.length) {
      list.innerHTML = '<div class="admin-empty">' + (products.length ? 'Produk tidak ditemukan.' : 'Belum ada produk. Tambahkan produk pertama melalui formulir.') + '</div>';
      return;
    }
    list.innerHTML = visible.map(p => '<article class="admin-product-row" data-id="' + safe(p.id) + '">' +
      (p.imageUrl ? '<img class="admin-product-thumb" src="' + safe(p.imageUrl) + '" alt="">' : '<div class="admin-product-thumb admin-thumb-placeholder">K</div>') +
      '<div class="admin-product-details"><strong>' + safe(p.name) + '</strong><span>' + safe(p.game) + '</span><b>' + rupiah(p.price) + '</b></div>' +
      '<span class="stock-pill ' + (p.status === 'available' ? 'is-available' : 'is-sold') + '">' + (p.status === 'available' ? 'Tersedia' : 'Terjual') + '</span>' +
      '<div class="admin-row-actions"><button type="button" data-action="edit" data-id="' + safe(p.id) + '">Edit</button><button type="button" data-action="delete" data-id="' + safe(p.id) + '">Hapus</button></div></article>').join('');
  }
  function showPreview(src) {
    $('#preview-image').src = src;
    $('#image-preview').hidden = !src;
  }
  function resetForm() {
    form.reset();
    $('#product-id').value = '';
    $('#form-heading').textContent = 'Tambah produk';
    $('#save-product').innerHTML = 'Simpan produk <span>↗</span>';
    $('#form-message').textContent = '';
    pendingImage = '';
    editingImage = '';
    imageInput.value = '';
    showPreview('');
  }
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Pilih file JPG, PNG, atau WebP.'));
      if (file.size > 8 * 1024 * 1024) return reject(new Error('Ukuran foto maksimal 8 MB sebelum kompresi.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Foto gagal dibaca.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Foto tidak dapat dibuka.'));
        img.onload = () => {
          const scale = Math.min(1, 1200 / Math.max(img.width,img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/webp',0.78));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  imageInput.addEventListener('change', async () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    $('#form-message').textContent = 'Memproses foto...';
    try {
      pendingImage = await compressImage(file);
      showPreview(pendingImage);
      $('#form-message').textContent = 'Foto siap digunakan.';
    } catch (error) {
      imageInput.value = '';
      $('#form-message').textContent = error.message;
    }
  });
  $('#remove-image').addEventListener('click', () => {
    pendingImage = '';
    editingImage = '';
    imageInput.value = '';
    showPreview('');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('#product-id').value;
    const previous = products.find(p => p.id === id);
    const product = {
      id: id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      name: $('#product-name').value.trim(),
      game: $('#product-game').value.trim(),
      price: Number($('#product-price').value),
      description: $('#product-description').value.trim(),
      status: $('#product-status').value,
      imageUrl: pendingImage || editingImage || '',
      createdAt: previous?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!product.name || !product.game || !Number.isFinite(product.price) || product.price < 0) {
      $('#form-message').textContent = 'Lengkapi nama, game, dan harga dengan benar.';
      return;
    }
    const old = products;
    products = previous ? products.map(p => p.id === id ? product : p) : [product,...products];
    if (!writeProducts()) { products = old; return; }
    $('#form-message').textContent = previous ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.';
    resetForm();
    render();
  });
  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const product = products.find(p => p.id === button.dataset.id);
    if (!product) return;
    if (button.dataset.action === 'edit') {
      $('#product-id').value = product.id;
      $('#product-name').value = product.name;
      $('#product-game').value = product.game;
      $('#product-price').value = product.price;
      $('#product-description').value = product.description || '';
      $('#product-status').value = product.status || 'available';
      pendingImage = '';
      editingImage = product.imageUrl || '';
      imageInput.value = '';
      showPreview(editingImage);
      $('#form-heading').textContent = 'Edit produk';
      $('#save-product').innerHTML = 'Simpan perubahan <span>↗</span>';
      $('#form-message').textContent = 'Sedang mengedit: ' + product.name;
      window.scrollTo({top:0,behavior:'smooth'});
    }
    if (button.dataset.action === 'delete' && window.confirm('Hapus produk "' + product.name + '"?')) {
      const old = products;
      products = products.filter(p => p.id !== product.id);
      if (!writeProducts()) { products = old; return; }
      render();
    }
  });
  $('#reset-form').addEventListener('click', resetForm);
  $('#admin-search').addEventListener('input', render);
  $('#export-products').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(products,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kyvora-products-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });
  render();
})();