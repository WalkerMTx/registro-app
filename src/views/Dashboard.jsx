import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { getFromGoogleSheets } from '../services/googleSheets';

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
    const fetchStats = async () => {
      setLoading(true);
      const invData = await getFromGoogleSheets('Stock de Productos');
      const salesData = await getFromGoogleSheets('Registro de Ventas');
      
      let products = 0;
      let totalStock = 0;
      let lowStockItems = [];
      if (invData && invData.length > 2) {
        const pList = invData.slice(2).filter(r => r[2]);
        products = pList.length;
        totalStock = pList.reduce((acc, curr) => acc + (Number(curr[4]) || 0), 0);
        lowStockItems = pList
          .filter(r => Number(r[4]) <= 5 && Number(r[4]) >= 0)
          .map(r => ({ name: r[2], stock: Number(r[4]) || 0 }))
          .slice(0, 5);
      }

      let sales = 0;
      let pendingCount = 0;
      if (salesData && salesData.length > 2) {
        const salesList = salesData.slice(2).filter(r => r[1] || r[2]);
        sales = salesList.length;
        pendingCount = salesList.filter(r => r[6] === 'PENDIENTE').length;
      }

      setStats({
        productsCount: products,
        salesCount: sales,
        totalStock: totalStock,
        pendingCount: pendingCount,
        lowStockItems: lowStockItems
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Productos',
      value: stats.productsCount,
      icon: <Package size={24} />,
      color: 'primary',
      bgColor: 'var(--primary-bg)',
      iconColor: 'var(--primary-light)'
    },
    {
      label: 'Ventas Totales',
      value: stats.salesCount,
      icon: <ShoppingCart size={24} />,
      color: 'success',
      bgColor: 'var(--success-bg)',
      iconColor: 'var(--success-light)'
    },
    {
      label: 'Stock Total',
      value: stats.totalStock,
      icon: <TrendingUp size={24} />,
      color: 'warning',
      bgColor: 'var(--warning-bg)',
      iconColor: 'var(--warning-light)'
    },
    {
      label: 'Pagos Pendientes',
      value: stats.pendingCount,
      icon: <DollarSign size={24} />,
      color: 'accent',
      bgColor: 'var(--accent-bg)',
      iconColor: 'var(--accent)'
    }
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Cargando datos desde Google Sheets...</p>
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
        <h1>📊 Dashboard</h1>
        <p>Resumen en tiempo real de tu negocio.</p>
      </div>

      {/* Stat Cards */}
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

      {/* Low Stock Alert */}
      {stats.lowStockItems.length > 0 && (
        <div className="glass-card p-6" style={{ borderColor: 'rgba(245, 158, 11, 0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{ fontSize: '1rem', color: 'var(--warning)' }}>Stock Bajo</h2>
            <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{stats.lowStockItems.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {stats.lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between" style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
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
