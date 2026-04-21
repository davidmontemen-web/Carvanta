import { useMemo, useState } from 'react';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import {
  VIEW_KEYS,
  getAllowedViews,
  getViewTitle,
  getViewComponent
} from './config/appViews.jsx';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  const [vistaActiva, setVistaActiva] = useState(VIEW_KEYS.DASHBOARD);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setVistaActiva(VIEW_KEYS.DASHBOARD);
  };

  const esAdmin = usuario?.rol === 'administrador';

  const vistasPermitidas = useMemo(() => getAllowedViews(usuario), [usuario]);

  const cambiarVista = (vista) => {
    if (!vistasPermitidas.includes(vista)) return;
    setVistaActiva(vista);
  };

  if (!usuario) {
    return <LoginPage onLogin={setUsuario} />;
  }

  return (
    <MainLayout
      usuario={usuario}
      onLogout={handleLogout}
      vistaActiva={vistaActiva}
      onCambiarVista={cambiarVista}
      tituloVista={getViewTitle(vistaActiva)}
    >
      {getViewComponent({
        viewKey: vistaActiva,
        esAdmin,
        usuario,
        onLogout: handleLogout
      })}
    </MainLayout>
  );
}

export default App;