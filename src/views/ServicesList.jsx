import React, { useState, useEffect } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { subscribeServicesList } from '../services/firestoreService';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeServicesList((data) => {
      setServices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredServices = services.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>📑 Catálogo de Servicios</h1>
        <p>Lista dinámica de servicios disponibles.</p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <div className="flex gap-4 mb-4 items-center flex-wrap">
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} />
            <input type="text" placeholder="Buscar servicio..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="badge badge-info">{filteredServices.length} servicios</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4" style={{ padding: '0.6rem' }}>
                <div className="skeleton" style={{ width: '150px', height: '14px' }} />
                <div className="skeleton" style={{ width: '80px', height: '14px' }} />
              </div>
            ))}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td style={{ fontWeight: 600 }}>{service.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{service.price ? `S/ ${Number(service.price).toFixed(2)}` : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{service.notes || ''}</td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan="3"><div className="empty-state"><ClipboardList size={40} /><p>No hay servicios registrados aún. Agrega servicios desde Firebase Console.</p></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ServicesList;
