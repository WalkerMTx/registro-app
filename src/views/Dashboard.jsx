import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { subscribeProducts, subscribeSales } from '../services/firestoreService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    salesCount: 0,
    totalStock: 0,
    pendingCount: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar productos en tiempo real
    const unsubProducts = subscribeProducts((products) => {
      const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
      const lowStockItems = products
        .filter(p => Number(p.stock) <= 5)
        .map(p => ({ name: p.name, stock: Number(p.stock) || 0 }))
        .slice(0, 5);

      setStats(prev => ({
        ...prev,
        productsCount: products.length,
        totalStock,
        lowStockItems
      }));
      setLoading(false);
    });

    // Escuchar ventas en tiempo real
    const unsubSales = subscribeSales((sales) => {
      setStats(prev => ({
        ...prev,
        salesCount: sales.length,
        pendingCount: sales.filter(s => s.status === 'PENDIENTE').length
      }));
    });

    return () => { unsubProducts(); unsubSales(); };
  }, []);

  const statCards = [
    { label: 'Productos', value: stats.productsCount, icon: <Package size={24} />, color: 'primary', bgColor: 'var(--primary-bg)', iconColor: 'var(--primary-light)' },
    { label: 'Ventas Totales', value: stats.salesCount, icon: <ShoppingCart size={24} />, color: 'success', bgColor: 'var(--success-bg)', iconColor: 'var(--success-light)' },
    { label: 'Stock Total', value: stats.totalStock, icon: <TrendingUp size={24} />, color: 'warning', bgColor: 'var(--warning-bg)', iconColor: 'var(--warning-light)' },
    { label: 'Pagos Pendientes', value: stats.pendingCount, icon: <DollarSign size={24} />, color: 'accent', bgColor: 'var(--accent-bg)', iconColor: 'var(--accent)' }
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Conectando con Firebase...</p>
        </div>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '40%', height: '28px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1>📊 Dashboard</h1>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>⚡ Tiempo Real</span>
        </div>
        <p>Resumen en tiempo real de tu negocio.</p>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((card, i) => (
          <div key={i} className={`glass-card stat-card ${card.color} p-6`}>
            <div className="stat-icon" style={{ background: card.bgColor, color: card.iconColor, marginBottom: '1rem' }}>
              {card.icon}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              {card.label}
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{card.value}</h2>
          </div>
        ))}
      </div>

      {stats.lowStockItems.length > 0 && (
        <div className="glass-card p-6" style={{ borderColor: 'rgba(245, 158, 11, 0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{ fontSize: '1rem', color: 'var(--warning)' }}>Stock Bajo</h2>
            <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{stats.lowStockItems.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {stats.lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: '0.6rem 0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{item.name}</span>
                <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                  {item.stock === 0 ? 'Agotado' : `${item.stock} und.`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
