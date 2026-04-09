import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Inventory from './views/Inventory';
import Sales from './views/Sales';
import Services from './views/Services';
import ServicesList from './views/ServicesList';
import Dashboard from './views/Dashboard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex w-full" style={{ minHeight: '100vh' }}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="main-content w-full" style={{ 
        padding: '1rem 1.5rem 1rem 0.5rem',
        marginTop: '0'
      }}>
        {/* Mobile spacer for fixed header */}
        <div className="mobile-header" style={{ display: 'none', height: '60px' }} />
        
        <div className="glass-panel w-full p-6" style={{ 
          minHeight: 'calc(100vh - 2rem)', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div className="animate-in" key={activeView}>
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'inventory' && <Inventory />}
            {activeView === 'sales' && <Sales />}
            {activeView === 'servicesList' && <ServicesList />}
            {activeView === 'services' && <Services />}
          </div>
        </div>
      </main>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f1f5f9',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '0.88rem',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} 
      />
    </div>
  );
}

export default App;
