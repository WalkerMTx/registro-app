import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpCircle, Search, X, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFromGoogleSheets, sendToGoogleSheets } from '../services/googleSheets';

const Inventory = () => {
  const [products, setProducts] = useState(() => {
    const cached = localStorage.getItem('cache_Inventory');
    return cached ? JSON.parse(cached) : [];
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(products.length === 0);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockData, setRestockData] = useState({ product: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      if (products.length === 0) setLoading(true);
      const data = await getFromGoogleSheets('Stock de Productos');
      if (data && data.length > 2) {
        const formattedData = data.slice(2)
          .filter(row => row[2])
          .map(row => ({
            name: row[2],
            stock: row[4],
            price: row[3]
          }));
        setProducts(formattedData);
        localStorage.setItem('cache_Inventory', JSON.stringify(formattedData));
      }
      setLoading(false);
    };
    loadInventory();
  }, []);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await sendToGoogleSheets('Ingreso de Stock', restockData);
    setIsSubmitting(false);

    if (result) {
      toast.success(`+${restockData.quantity} unidades de ${restockData.product}`);
      // Optimistic update
      setProducts(prev => prev.map(p => 
        p.name === restockData.product 
          ? { ...p, stock: Number(p.stock) + Number(restockData.quantity) }
          : p
      ));
      setShowRestockModal(false);
      setRestockData({ product: '', quantity: 1 });
    } else {
      toast.error('Error al guardar el ingreso.');
    }
  };

  const openRestockModal = (productName) => {
    setRestockData({ product: productName, quantity: 1 });
    setShowRestockModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStockColor = (stock) => {
    const n = Number(stock);
    if (n <= 0) return 'var(--danger)';
    if (n <= 5) return 'var(--warning)';
    return 'var(--success)';
  };

  const getStockBadge = (stock) => {
    const n = Number(stock);
    if (n <= 0) return 'badge-danger';
    if (n <= 5) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>📦 Stock de Productos</h1>
          <p>Inventario sincronizado con Google Sheets.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        {/* Search */}
        <div className="flex gap-4 mb-4 items-center flex-wrap">
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="badge badge-info">{filteredProducts.length} productos</span>
        </div>

        {/* Loading Skeleton */}
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
              {filteredProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Package size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStockBadge(product.stock)}`}>
                      {product.stock !== "" && product.stock !== undefined ? product.stock : 0}
                      {Number(product.stock) <= 0 && ' · Agotado'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {product.price !== "" ? `S/ ${Number(product.price).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '0.4rem 0.6rem', color: 'var(--success)', fontSize: '0.82rem' }}
                      onClick={() => openRestockModal(product.name)}
                      title="Añadir stock"
                    >
                      <ArrowUpCircle size={16} />
                      <span>Ingresar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      <Package size={40} />
                      <p>No se encontraron productos.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL INGRESAR STOCK */}
      {showRestockModal && (
        <div className="overlay" onClick={() => setShowRestockModal(false)}>
          <div 
            className="glass-card modal-content p-6 flex-col gap-4" 
            style={{ width: '420px', maxWidth: '95vw', background: 'var(--bg-dark)', border: '1px solid var(--glass-border-hover)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={20} style={{ color: 'var(--success)' }} />
                <h2 style={{ fontSize: '1.15rem', color: 'var(--success)' }}>Ingresar Stock</h2>
              </div>
              <button
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowRestockModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="flex flex-col gap-4">
              <div>
                <label>Producto</label>
                <input type="text" value={restockData.product} disabled />
              </div>
              <div>
                <label>Cantidad a ingresar</label>
                <input
                  type="number"
                  min="1"
                  value={restockData.quantity}
                  onChange={e => setRestockData({ ...restockData, quantity: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-success mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Confirmar Ingreso'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
