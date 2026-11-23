import React, { useCallback, useEffect, useMemo, useState } from 'react';
import $ from 'jquery';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import ProductModal from './ProductModal.jsx';
import { listProducts, createProduct, updateProduct, deleteProduct } from './api.js';

window.$ = window.jQuery = $;
DataTable.use(DT);

const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function App() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await listProducts());
    } catch (e) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = useCallback(
    (id) => {
      const p = rows.find((r) => Number(r.id) === Number(id));
      if (p) {
        setEditing(p);
        setModalOpen(true);
      }
    },
    [rows]
  );

  const handleDelete = useCallback(
    async (id) => {
      const p = rows.find((r) => Number(r.id) === Number(id));
      if (!p) return;
      if (!window.confirm(`Hapus produk "${p.nama}"?`)) return;
      try {
        await deleteProduct(id);
        setToast('Produk dihapus');
        await load();
      } catch (e) {
        setError(e.message || 'Gagal menghapus');
      }
    },
    [rows, load]
  );

  const handleSave = async (data, id) => {
    if (id) {
      await updateProduct(id, data);
      setToast('Produk diperbarui');
    } else {
      await createProduct(data);
      setToast('Produk ditambahkan');
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  };

  const columns = useMemo(
    () => [
      { title: 'No', data: null, orderable: false, searchable: false, render: (d, t, r, meta) => meta.row + 1 },
      { title: 'Kode', data: 'kode', render: (d) => esc(d) },
      { title: 'Nama Produk', data: 'nama', render: (d) => esc(d) },
      { title: 'Kategori', data: 'kategori', render: (d) => esc(d) },
      {
        title: 'Harga',
        data: 'harga',
        className: 'dt-right',
        render: (d, type) => (type === 'display' ? rupiah(d) : d),
      },
      { title: 'Stok', data: 'stok', className: 'dt-right' },
      {
        title: 'Aksi',
        data: 'id',
        orderable: false,
        searchable: false,
        className: 'dt-center',
        render: (id) =>
          `<button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${id}">Ubah</button> ` +
          `<button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${id}">Hapus</button>`,
      },
    ],
    []
  );

  const onTableClick = (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (btn.getAttribute('data-action') === 'edit') openEdit(id);
    else if (btn.getAttribute('data-action') === 'delete') handleDelete(id);
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1>Data Produk</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Tambah Produk
        </button>
      </header>

      {error && <div className="alert">{error}</div>}
      {toast && <div className="toast">{toast}</div>}

      <div className="card" onClick={onTableClick}>
        {loading ? (
          <p className="muted">Memuat data...</p>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            className="display"
            options={{
              pageLength: 10,
              order: [[1, 'asc']],
              language: {
                search: 'Cari:',
                lengthMenu: 'Tampilkan _MENU_ data',
                info: 'Menampilkan _START_ - _END_ dari _TOTAL_ data',
                infoEmpty: 'Tidak ada data',
                zeroRecords: 'Data tidak ditemukan',
                emptyTable: 'Belum ada produk',
                paginate: { first: 'Â«', last: 'Â»', next: 'â€º', previous: 'â€¹' },
              },
            }}
          />
        )}
      </div>

      <ProductModal
        open={modalOpen}
        product={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
