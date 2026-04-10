import React, { useState, useEffect } from 'react';
import { Save, Search, CheckCircle, ShoppingCart, Receipt, X, DollarSign, Smartphone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeProducts, subscribeSales, addSale, confirmPayment } from '../services/firestoreService';

const Sales = () => {
  const [formData, setFormData] = useState({
    product: '',
    quantity: 1,
    client: '',
    status: 'PAGO',
    paymentMethod: 'YAPE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]); // { id, name, ... }
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historySearch, setHistorySearch] = useState('');

  // Modal de cobro
  const [showPayModal, setShowPayModal] = useState(false);
  const [payModalData, setPayModalData] = useState(null);
  const [payMethod, setPayMethod] = useState('YAPE');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  useEffect(() => {
    // Escuchar productos en tiempo real
    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
    });

    // Escuchar ventas en tiempo real
    const unsubSales = subscribeSales((data) => {
      setSalesHistory(data);
      setLoadingHistory(false);
    });

    return () => { unsubProducts(); unsubSales(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product) { toast.error('Selecciona un producto.'); return; }
    if (!formData.client.trim()) { toast.error('Escribe el nombre del cliente.'); return; }

    setIsSubmitting(true);
    try {
      // Buscar el ID del producto para restar stock
      const productDoc = products.find(p => p.name === formData.product);
      await addSale(formData, productDoc?.id);
      toast.success(`Venta de ${formData.product} registrada.`);
      setFormData({ product: '', quantity: 1, client: '', status: 'PAGO', paymentMethod: 'YAPE' });
    } catch (err) {
      toast.error('Error al guardar la venta.');
    }
    setIsSubmitting(false);
  };

  // Abrir modal de confirmación de pago
  const openPayModal = (sale) => {
    setPayModalData(sale);
    setPayMethod('YAPE');
    setShowPayModal(true);
  };

  // Confirmar el pago
  const handleConfirmPayment = async () => {
    if (!payModalData) return;
    setIsProcessingPay(true);
    try {
      await confirmPayment(payModalData.id, payMethod);
      toast.success(`¡Pago de ${payModalData.client} confirmado con ${payMethod}!`);
      setShowPayModal(false);
      setPayModalData(null);
    } catch (err) {
      toast.error('Error al confirmar el pago.');
    }
    setIsProcessingPay(false);
  };

  const filteredHistory = salesHistory.filter(sale =>
    sale.product?.toLowerCase().includes(historySearch.toLowerCase()) ||
    sale.client?.toLowerCase().includes(historySearch.toLowerCase())
  );

  const pendingCount = salesHistory.filter(s => s.status === 'PENDIENTE').length;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1>💰 Registrar Venta</h1>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>⚡ Tiempo Real</span>
        </div>
        <p>Registra ventas sincronizadas con Firebase.</p>
      </div>

      {/* Form */}
      <div className="glass-card p-6" style={{ maxWidth: '620px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Cliente</label>
            <input type="text" placeholder="Ej. Salvador Mariño" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} required />
          </div>
          <div>
            <label>Producto / Bebida</label>
            <select value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} required>
              <option value="">— Selecciona un producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.stock} und.)</option>
              ))}
            </select>
          </div>
          <div>
            <label>Cantidad</label>
            <input type="number" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} required />
          </div>
          <div className="flex gap-4 form-row">
            <div className="w-full">
              <label>Estado de deuda</label>
              <select value={formData.status} onChange={e => {
                const s = e.target.value;
                setFormData({ ...formData, status: s, paymentMethod: s === 'PENDIENTE' ? '' : (formData.paymentMethod || 'YAPE') });
              }}>
                <option value="PAGO">PAGO</option>
                <option value="PENDIENTE">PENDIENTE</option>
              </select>
            </div>
            <div className="w-full" style={{ opacity: formData.status === 'PENDIENTE' ? 0.4 : 1, transition: 'var(--transition)' }}>
              <label>Método de pago</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} disabled={formData.status === 'PENDIENTE'}>
                {formData.status === 'PENDIENTE' && <option value="">— Sin pago —</option>}
                <option value="YAPE">YAPE</option>
                <option value="EFECTIVO">EFECTIVO</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-success mt-4" disabled={isSubmitting}>
            {isSubmitting ? <>Guardando...</> : <><Save size={16} /> Guardar Venta</>}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="flex items-center justify-between mt-6 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Receipt size={20} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h2>Historial de Ventas</h2>
            <p className="text-muted" style={{ fontSize: '0.82rem' }}>
              {salesHistory.length} ventas
              {pendingCount > 0 && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>· {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>}
            </p>
          </div>
        </div>
        <div className="search-wrapper" style={{ width: '240px', minWidth: '180px' }}>
          <Search size={16} />
          <input type="text" placeholder="Buscar..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        {loadingHistory ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4" style={{ padding: '0.6rem' }}>
                <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                <div className="skeleton" style={{ width: '100px', height: '14px' }} />
                <div className="skeleton" style={{ width: '120px', height: '14px' }} />
                <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '99px' }} />
              </div>
            ))}
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Estado</th><th>Método</th></tr>
            </thead>
            <tbody>
              {filteredHistory.slice(0, 30).map((sale) => (
                <tr key={sale.id}>
                  <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                    {sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{sale.client}</td>
                  <td style={{ fontWeight: 500 }}>{sale.product}</td>
                  <td><span className="badge badge-info">{sale.quantity}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${sale.status === 'PAGO' ? 'badge-success' : 'badge-danger'}`}>{sale.status}</span>
                      {sale.status === 'PENDIENTE' && (
                        <button onClick={() => openPayModal(sale)} title="Confirmar Pago" style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))',
                          color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px',
                          padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                          fontSize: '0.75rem', fontWeight: 700, transition: 'var(--transition)'
                        }}>
                          <DollarSign size={13} /> Cobrar
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.78rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                      background: sale.method === 'YAPE' ? 'rgba(139, 92, 246, 0.1)' : sale.method === 'EFECTIVO' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                      color: sale.method === 'YAPE' ? '#a78bfa' : sale.method === 'EFECTIVO' ? '#fbbf24' : 'var(--text-muted)', fontWeight: 500
                    }}>
                      {sale.method || '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {salesHistory.length === 0 && (
                <tr><td colSpan="6"><div className="empty-state"><ShoppingCart size={40} /><p>No hay ventas registradas aún.</p></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CONFIRMAR PAGO */}
      {showPayModal && payModalData && (
        <div className="overlay" onClick={() => setShowPayModal(false)}>
          <div className="glass-card modal-content p-6" style={{ width: '420px', maxWidth: '95vw', background: 'var(--bg-dark)', border: '1px solid var(--glass-border-hover)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div style={{ width: '42px', height: '42px', background: 'var(--success-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <DollarSign size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', marginBottom: '2px' }}>Confirmar Pago</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Marca esta venta como pagada</p>
                </div>
              </div>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Cliente</span><span style={{ fontWeight: 600 }}>{payModalData.client}</span></div>
              <div className="flex justify-between mb-2"><span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Producto</span><span style={{ fontWeight: 600 }}>{payModalData.product}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Cantidad</span><span className="badge badge-info">{payModalData.quantity}</span></div>
            </div>
            <label style={{ marginBottom: '0.75rem' }}>¿Con qué método pagó?</label>
            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => setPayMethod('YAPE')} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)',
                background: payMethod === 'YAPE' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(167, 139, 250, 0.1))' : 'rgba(0,0,0,0.2)',
                border: payMethod === 'YAPE' ? '2px solid rgba(139, 92, 246, 0.5)' : '2px solid rgba(255,255,255,0.06)',
                color: payMethod === 'YAPE' ? '#a78bfa' : 'var(--text-muted)', boxShadow: payMethod === 'YAPE' ? '0 4px 15px rgba(139, 92, 246, 0.2)' : 'none'
              }}><Smartphone size={24} /><span style={{ fontWeight: 700, fontSize: '0.88rem' }}>YAPE</span></button>
              <button type="button" onClick={() => setPayMethod('EFECTIVO')} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)',
                background: payMethod === 'EFECTIVO' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.1))' : 'rgba(0,0,0,0.2)',
                border: payMethod === 'EFECTIVO' ? '2px solid rgba(245, 158, 11, 0.5)' : '2px solid rgba(255,255,255,0.06)',
                color: payMethod === 'EFECTIVO' ? '#fbbf24' : 'var(--text-muted)', boxShadow: payMethod === 'EFECTIVO' ? '0 4px 15px rgba(245, 158, 11, 0.2)' : 'none'
              }}><Banknote size={24} /><span style={{ fontWeight: 700, fontSize: '0.88rem' }}>EFECTIVO</span></button>
            </div>
            <button className="btn btn-success w-full" onClick={handleConfirmPayment} disabled={isProcessingPay} style={{ padding: '0.85rem', fontSize: '0.95rem' }}>
              {isProcessingPay ? 'Procesando...' : <><CheckCircle size={18} /> Confirmar Pago con {payMethod}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
