import { useState, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { getCarnes, getCarneByCodigo, registerCarne, getCarnesByLote } from '../api';

export default function Dashboard() {
  const [carnes, setCarnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for search
  const [searchCodigo, setSearchCodigo] = useState('');
  const [searchedCarne, setSearchedCarne] = useState(null);
  
  const [searchLote, setSearchLote] = useState('');
  const [searchedLoteCarnes, setSearchedLoteCarnes] = useState([]);

  // States for register
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    cantidad: 1,
    nombre: '',
    origen: '',
    peso: '',
    fechaEnvasado: '',
    corteCarne: ''
  });

  const loadCarnes = async () => {
    try {
      setLoading(true);
      const data = await getCarnes();
      setCarnes(data);
    } catch (err) {
      // If 403, might be a role issue, but we allowed both to read.
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarnes();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCodigo) {
      setSearchedCarne(null);
      return;
    }
    setError('');
    try {
      const data = await getCarneByCodigo(searchCodigo);
      setSearchedCarne(data);
    } catch (err) {
      setError('Carne no encontrada con ese código.');
      setSearchedCarne(null);
    }
  };

  const handleSearchLote = async (e) => {
    e.preventDefault();
    if (!searchLote) {
      setSearchedLoteCarnes([]);
      return;
    }
    setError('');
    try {
      const data = await getCarnesByLote(searchLote);
      if (data && data.length > 0) {
        setSearchedLoteCarnes(data);
      } else {
        setError('No se encontraron carnes para ese lote.');
        setSearchedLoteCarnes([]);
      }
    } catch (err) {
      setError('Error al consultar lote.');
      setSearchedLoteCarnes([]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const pesoVal = parseFloat(formData.peso);

    if (pesoVal <= 0) {
      setError('El peso debe ser mayor a 0.');
      return;
    }

    const limitDate = new Date();
    limitDate.setMonth(limitDate.getMonth() - 2);

    // Ajustar a medianoche para evitar problemas de zona horaria
    limitDate.setHours(0, 0, 0, 0);

    const envDate = new Date(formData.fechaEnvasado);
    envDate.setHours(0,0,0,0);

    if (envDate < limitDate) {
      setError('La fecha de envasado no puede tener una antigüedad mayor a 2 meses.');
      return;
    }

    try {
      const payload = {
        ...formData,
        peso: parseFloat(formData.peso),
        cantidad: parseInt(formData.cantidad, 10),
      };
      await registerCarne(payload);
      alert(`Se registraron ${formData.cantidad} carnes exitosamente!`);
      setIsRegistering(false);
      setFormData({
        cantidad: 1, nombre: '', origen: '', peso: '',
        fechaEnvasado: '', corteCarne: ''
      });
      loadCarnes();
    } catch (err) {
      setError(err.message || 'Error al registrar. ¿Tienes permisos de ADMIN?');
    }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split('T')[0];
  };
  const minDateStr = getMinDate();

  const renderMeatCard = (carne) => (
    <div key={carne.codigo} className="glass-card interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{carne.nombre}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {carne.codigoLote && (
            <span className="meat-badge" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
              {carne.codigoLote}
            </span>
          )}
          <span className="meat-badge">{carne.codigo}</span>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <Package size={14} style={{ display: 'inline', marginRight: '4px' }}/> 
        Corte: {carne.corteCarne}
      </p>
      <div className="grid grid-cols-2" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
        <div><strong>Origen:</strong> {carne.origen}</div>
        <div><strong>Peso:</strong> {carne.peso} kg</div>
        <div><strong>Proveedor:</strong> {carne.proveedor}</div>
        <div><strong>Envasado:</strong> {carne.fechaEnvasado}</div>
        <div><strong>Vence:</strong> {carne.fechaVencimiento}</div>
        <div><strong>Humedad:</strong> {carne.humedadAlmacenamiento}%</div>
        <div><strong>Temperatura:</strong> {carne.temperatura}°C</div>
        <div style={{ gridColumn: 'span 2' }}><strong>Frescura:</strong> <span className="status-badge status-success">{carne.porcentajeFrescura}%</span></div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dashboard Principal</h2>
        <button className="btn-primary" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Volver' : <><Plus size={18} /> Nueva Carne</>}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isRegistering ? (
        <div className="glass-card animate-fade-in">
          <h3>Registrar Nueva Carne</h3>
          <form onSubmit={handleRegister} className="grid grid-cols-2" style={{ gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Cantidad a registrar</label>
              <input type="number" min="1" className="form-input" required 
                value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input type="text" className="form-input" required 
                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Corte de Carne</label>
              <input type="text" className="form-input" required 
                value={formData.corteCarne} onChange={e => setFormData({...formData, corteCarne: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Origen</label>
              <input type="text" className="form-input" required 
                value={formData.origen} onChange={e => setFormData({...formData, origen: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Peso (kg) *</label>
              <input type="number" step="0.01" min="0.01" className="form-input" required 
                value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Envasado</label>
              <input type="date" min={minDateStr} className="form-input" required 
                value={formData.fechaEnvasado} onChange={e => setFormData({...formData, fechaEnvasado: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Guardar Carne
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="glass-card stagger-1" style={{ marginBottom: '2rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <h3 style={{ margin: 0 }}>Consultar por Código</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. CAR-001" 
                    value={searchCodigo}
                    onChange={(e) => setSearchCodigo(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary">
                    <Search size={18} /> Buscar
                  </button>
                </div>
              </form>

              <form onSubmit={handleSearchLote} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <h3 style={{ margin: 0 }}>Consultar por Lote</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. LOTE-0001" 
                    value={searchLote}
                    onChange={(e) => setSearchLote(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary">
                    <Search size={18} /> Buscar
                  </button>
                </div>
              </form>
            </div>
            
            {searchedCarne && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Resultado (Código)
                </h3>
                {renderMeatCard(searchedCarne)}
              </div>
            )}

            {searchedLoteCarnes.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Resultados del Lote
                </h3>
                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                  {searchedLoteCarnes.map(renderMeatCard)}
                </div>
              </div>
            )}
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Inventario Completo</h3>
          {loading ? (
            <div className="flex-center" style={{ padding: '2rem' }}>Cargando...</div>
          ) : (
            <div className="grid grid-cols-3 stagger-2">
              {carnes.length > 0 ? (
                carnes.map(renderMeatCard)
              ) : (
                <p style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay carnes registradas.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
