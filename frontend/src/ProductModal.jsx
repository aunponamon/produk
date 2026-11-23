import React, { useEffect, useRef, useState } from 'react';

const EMPTY = { kode: '', nama: '', kategori: '', harga: '', stok: '' };

export default function ProductModal({ open, product, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);
  const lastProduct = useRef(product);
  if (open) lastProduct.current = product;

  const shown = open ? product : lastProduct.current;
  const isEdit = Boolean(shown && shown.id);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      return undefined;
    }
    if (!render) return undefined;
    setClosing(true);
    const t = setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              kode: product.kode ?? '',
              nama: product.nama ?? '',
              kategori: product.kategori ?? '',
              harga: product.harga ?? '',
              stok: product.stok ?? '',
            }
          : EMPTY
      );
      setErrors({});
      setServerError('');
      setSaving(false);
    }
  }, [open, product]);

  if (!render) return null;

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.kode.trim()) er.kode = 'Kode wajib diisi';
    if (!form.nama.trim()) er.nama = 'Nama wajib diisi';
    if (form.harga === '' || Number(form.harga) < 0 || Number.isNaN(Number(form.harga)))
      er.harga = 'Harga harus angka >= 0';
    if (form.stok === '' || !Number.isInteger(Number(form.stok)) || Number(form.stok) < 0)
      er.stok = 'Stok harus bilangan bulat >= 0';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) {
      setErrors(er);
      return;
    }
    setSaving(true);
    setServerError('');
    try {
      await onSave(
        {
          kode: form.kode.trim(),
          nama: form.nama.trim(),
          kategori: form.kategori.trim(),
          harga: Number(form.harga),
          stok: Number(form.stok),
        },
        isEdit ? product.id : null
      );
    } catch (err) {
      setErrors(err.errors || {});
      setServerError(err.message || 'Gagal menyimpan');
      setSaving(false);
    }
  };

  const field = (name, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={change}
        className={errors[name] ? 'invalid' : ''}
        {...extra}
      />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </div>
  );

  return (
    <div className={`modal-backdrop${closing ? ' closing' : ''}`} onMouseDown={onClose}>
      <div className={`modal${closing ? ' closing' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Ubah Produk' : 'Tambah Produk'}</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup">
            &times;
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body">
            {serverError && <div className="alert">{serverError}</div>}
            {field('kode', 'Kode Produk', 'text', { maxLength: 50, autoFocus: true })}
            {field('nama', 'Nama Produk', 'text', { maxLength: 150 })}
            {field('kategori', 'Kategori', 'text', { maxLength: 100 })}
            <div className="row">
              {field('harga', 'Harga (Rp)', 'number', { min: 0, step: '0.01' })}
              {field('stok', 'Stok', 'number', { min: 0, step: '1' })}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
