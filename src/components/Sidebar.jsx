import React, { useState } from 'react';
import { Package, ShoppingCart, Scissors, Menu, LayoutDashboard, ClipboardList, X, Zap } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Stock de Productos', icon: <Package size={20} /> },
    { id: 'sales', label: 'Ventas', icon: <ShoppingCart size={20} /> },
    { id: 'servicesList', label: 'Lista de Servicios', icon: <ClipboardList size={20} /> },
    { id: 'services', label: 'Reg. Servicios', icon: <Scissors size={20} /> },
  ];

  const handleNavigate = (id) => {
    setActiveView(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 150,
        padding: '0.75rem 1rem',
        background: 'rgba(5, 8, 16, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-2">
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <Zap size={18} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Registro App</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div className={`glass-panel sidebar ${isOpen ? 'open' : ''}`} style={{
        width: '260px',
        height: 'calc(100vh - 2rem)',
        margin: '1rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0.75rem',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3" style={{ padding: '0 0.75rem', marginBottom: '2rem' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Registro</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Panel de Control</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <span style={{ 
            fontSize: '0.68rem', 
            color: 'var(--text-muted)', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            padding: '0 0.75rem',
            marginBottom: '0.5rem'
          }}>
            Menú Principal
          </span>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                padding: '0.65rem 0.75rem',
                textAlign: 'left',
                borderRadius: '10px',
                background: activeView === item.id
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.1))'
                  : 'transparent',
                color: activeView === item.id ? '#fff' : 'var(--text-muted)',
                border: activeView === item.id 
                  ? '1px solid rgba(99, 102, 241, 0.3)' 
                  : '1px solid transparent',
                boxShadow: activeView === item.id 
                  ? '0 2px 8px var(--primary-glow)' 
                  : 'none',
                fontWeight: activeView === item.id ? 600 : 500,
                fontSize: '0.88rem',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ 
                opacity: activeView === item.id ? 1 : 0.6,
                transition: 'var(--transition)'
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            © 2026 · Registro App
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
