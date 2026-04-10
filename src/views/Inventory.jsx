import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Search, X, Package, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeProducts, addStock, addProduct } from '../services/firestoreService';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockData, setRestockData] = useState({ productId: '', productName: '', quantity: 1 });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Escuchar cambios en tiempo real
    const unsub = subscribeProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addStock(restockData.productId, restockData.quantity);
      toast.success(`+${restockData.quantity} unidades de ${restockData.productName}`);
      setShowRestockModal(false);
      setRestockData({ productId: '', productName: '', quantity: 1 });
    } catch (err) {
      toast.error('Error al ingresar stock.');
    }
    setIsSubmitting(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      toast.error('Escribe un nombre de producto.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addProduct(newProduct);
      toast.success(`"${newProduct.name}" agregado al inventario.`);
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', stock: '' });
    } catch (err) {
      toast.error('Error al agregar producto.');
    }
    setIsSubmitting(false);
  };

  const openRestockModal = (product) => {
    setRestockData({ productId: product.id, productName: product.name, quantity: 1 });
    setShowRestockModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStockBadge = (stock) => {
    const n = Number(stock);
    if (n <= 0) return 'badge-danger';
    if (n <= 5) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1>📦 Stock de Productos</h1>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>⚡ Tiempo Real</span>
          </div>
          <p>Inventario sincronizado con Firebase.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <div className="flex gap-4 mb-4 items-center flex-wrap">
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} />
            <input type="text" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="badge badge-info">{filteredProducts.length} productos</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4" style={{ padding: '0.75rem 1rem' }}>
                <div className="skeleton" style={{ width: '180px', height: '16px' }} />
                <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '99px' }} />
                <div className="skeleton" style={{ width: '80px', height: '16px' }} />
              </div>
            ))}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Precio</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Package size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStockBadge(product.stock)}`}>
                      {product.stock ?? 0}
                      {Number(product.stock) <= 0 && ' · Agotado'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {product.price ? `S/ ${Number(product.price).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.4rem 0.6rem', color: 'var(--success)', fontSize: '0.82rem' }} onClick={() => openRestockModal(product)} title="Añadir stock">
                      <ArrowUpCircle size={16} /> <span>Ingresar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr><td colSpan="4"><div className="empty-state"><Package size={40} /><p>No se encontraron productos.</p></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL INGRESAR STOCK */}
      {showRestockModal && (
        <div className="overlay" onClick={() => setShowRestockModal(false)}>
          <div className="glass-card modal-content p-6 flex-col gap-4" style={{ width: '420px', maxWidth: '95vw', background: 'var(--bg-dark)', border: '1px solid var(--glass-border-hover)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={20} style={{ color: 'var(--success)' }} />
                <h2 style={{ fontSize: '1.15rem', color: 'var(--success)' }}>Ingresar Stock</h2>
              </div>
              <button style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowRestockModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleRestockSubmit} className="flex flex-col gap-4">
              <div><label>Producto</label><input type="text" value={restockData.productName} disabled /></div>
              <div><label>Cantidad a ingresar</label><input type="number" min="1" value={restockData.quantity} onChange={e => setRestockData({ ...restockData, quantity: e.target.value })} required autoFocus /></div>
              <button type="submit" className="btn btn-success mt-2 w-full" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Confirmar Ingreso'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR PRODUCTO */}
      {showAddModal && (
        <div className="overlay" onClick={() => setShowAddModal(false)}>
          <div className="glass-card modal-content p-6 flex-col gap-4" style={{ width: '420px', maxWidth: '95vw', background: 'var(--bg-dark)', border: '1px solid var(--glass-border-hover)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.15rem', color: 'var(--primary-light)' }}>Nuevo Producto</h2>
              </div>
              <button style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div><label>Nombre del Producto</label><input type="text" placeholder="Ej. San Mateo 600ml" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required autoFocus /></div>
              <div className="flex gap-4 form-row">
                <div className="w-full"><label>Precio (S/)</label><input type="number" min="0" step="0.01" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required /></div>
                <div className="w-full"><label>Stock Inicial</label><input type="number" min="0" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required /></div>
              </div>
              <button type="submit" className="btn btn-primary mt-2 w-full" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Agregar Producto'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
