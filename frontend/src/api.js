// Dev (npm run dev): lewat proxy Vite. Produksi (dist di Apache): relatif ke /produk/api/
// Untuk APK: set VITE_API_BASE ke alamat absolut, mis. http://192.168.1.10/produk/api/products.php
const BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? '/api/products.php' : '../../api/products.php');

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    body = null;
  }
  if (!res.ok) {
    const err = new Error((body && body.message) || 'Terjadi kesalahan');
    err.status = res.status;
    err.errors = (body && body.errors) || {};
    throw err;
  }
  return body;
}

export const listProducts = () => request(BASE);

export const createProduct = (data) =>
  request(BASE, { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id, data) =>
  request(`${BASE}?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProduct = (id) =>
  request(`${BASE}?id=${id}`, { method: 'DELETE' });
