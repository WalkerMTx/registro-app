import React, { useState, useEffect } from 'react';
import { Save, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendToGoogleSheets, getFromGoogleSheets } from '../services/googleSheets';

const Services = () => {
  const [formData, setFormData] = useState({
    serviceName: '',
    price: '',
    client: '',
    technician: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceList, setServiceList] = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      const data = await getFromGoogleSheets('Lista de Servicios');
      if (data && data.length > 0) {
        const servNames = data.slice(1).map(row => row[0]);
        setServiceList(servNames.filter(name => name));
      }
    };
    loadServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceName) {
      toast.error('Selecciona un tipo de servicio.');
      return;
    }
    setIsSubmitting(true);
    const result = await sendToGoogleSheets('Servicios Realizados', formData);
    setIsSubmitting(false);

    if (result) {
      toast.success(`Servicio "${formData.serviceName}" registrado.`);
      setFormData({ serviceName: '', price: '', client: '', technician: '', notes: '' });
    } else {
      toast.error('Error al guardar el servicio.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🛠️ Registrar Servicio</h1>
        <p>Registra los servicios prestados a tus clientes.</p>
      </div>

      <div className="glass-card p-6" style={{ maxWidth: '620px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Tipo de Servicio</label>
            {serviceList.length > 0 ? (
              <select
                value={formData.serviceName}
                onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                required
              >
                <option value="">— Selecciona un servicio —</option>
                {serviceList.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Ej. Mantenimiento, Reparación"
                value={formData.serviceName}
                onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                required
              />
            )}
          </div>

          <div className="flex gap-4 form-row">
            <div className="w-full">
              <label>Precio Cobrado (S/)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="w-full">
              <label>Cliente</label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={formData.client}
                onChange={e => setFormData({ ...formData, client: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label>Técnico / Encargado</label>
            <input
              type="text"
              placeholder="¿Quién realizó el servicio?"
              value={formData.technician}
              onChange={e => setFormData({ ...formData, technician: e.target.value })}
            />
          </div>

          <div>
            <label>Descripción del trabajo</label>
            <textarea
              rows="3"
              placeholder="Detalla lo que se realizó..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : <><Save size={16} /> Registrar Servicio</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Services;
