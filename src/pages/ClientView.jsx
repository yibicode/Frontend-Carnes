import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { getCarneByCodigo } from '../api';

export default function ClientView() {
  const [searchCodigo, setSearchCodigo] = useState('');
  const [carne, setCarne] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCodigo.trim()) return;

    setLoading(true);
    setError('');
    setCarne(null);

    try {
      const data = await getCarneByCodigo(searchCodigo);
      setCarne(data);
    } catch (err) {
      setError('No se encontró ninguna carne con ese código.');
    } finally {
      setLoading(false);
    }
  };

  const renderMeatCard = (carne) => (
    <div key={carne.codigo} className="glass-card interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>{carne.nombre}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {carne.codigoLote && (
            <span className="meat-badge" style={{ backgroundColor: 'var(--accent-color)', color: 'white', border: '1px solid var(--accent-color)' }}>
              {carne.codigoLote}
            </span>
          )}
          <span className="meat-badge" style={{ backgroundColor: 'transparent', border: '1px solid var(--accent-color)' }}>
            {carne.codigo}
          </span>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
        <Package size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
        Corte: <strong>{carne.corteCarne}</strong>
      </p>
      
      <div className="grid grid-cols-2" style={{ gap: '0.75rem', fontSize: '0.875rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Origen</span>
          {carne.origen}
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Peso Disponible</span>
          {carne.peso} kg
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Envasado</span>
          {carne.fechaEnvasado}
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Vencimiento</span>
          {carne.fechaVencimiento}
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Humedad</span>
          {carne.humedadAlmacenamiento}%
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Temperatura</span>
          {carne.temperatura}°C
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Frescura</span>
          <span className="status-badge status-success">{carne.porcentajeFrescura}%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Consulta de Carne</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Ingresa el código de la carne para ver todos los detalles de origen, frescura y vencimiento.
        </p>
      </div>

      <div className="flex-center" style={{ marginBottom: '3rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ejemplo: CAR-001" 
            value={searchCodigo}
            onChange={(e) => setSearchCodigo(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            <Search size={18} /> Consultar
          </button>
        </form>
      </div>
      
      {error && <div className="error-message" style={{ maxWidth: '500px', margin: '0 auto 2rem auto', textAlign: 'center' }}>{error}</div>}

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        carne && (
          <div className="flex-center stagger-2">
            <div style={{ width: '100%', maxWidth: '600px' }}>
              {renderMeatCard(carne)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
