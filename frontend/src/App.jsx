import { useMemo, useState } from 'react';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage';
import DashboardPage from './pages/DashboardPage';
import AppraisalsPage from './pages/AppraisalsPage';
import VentasPage from './pages/VentasPage';
import InventarioPage from './pages/InventarioPage';
import MiCuentaPage from './pages/MiCuentaPage';
import MainLayout from './components/layout/MainLayout';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  });

  const [vistaActiva, setVistaActiva] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setVistaActiva('dashboard');
  };

  const esAdmin = usuario?.rol === 'administrador';

  const vistasPermitidas = useMemo(() => {
    if (!usuario) return [];

    if (esAdmin) {
      return ['dashboard', 'avaluos', 'ventas', 'inventario', 'usuarios', 'mi-cuenta'];
    }

    return ['dashboard', 'avaluos', 'mi-cuenta'];
  }, [usuario, esAdmin]);

  const cambiarVista = (vista) => {
    if (!vistasPermitidas.includes(vista)) return;
    setVistaActiva(vista);
  };

  const obtenerTituloVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return 'Dashboard';
      case 'avaluos':
        return 'Avalúos';
      case 'ventas':
        return 'Ventas';
      case 'inventario':
        return 'Inventario';
      case 'usuarios':
        return 'Usuarios';
      case 'mi-cuenta':
        return 'Mi cuenta';
      default:
        return 'Carvanta';
    }
  };

  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <DashboardPage />;
      case 'avaluos':
        return <AppraisalsPage usuario={usuario} />;
      case 'ventas':
        return esAdmin ? <VentasPage /> : <DashboardPage />;
      case 'inventario':
        return esAdmin ? <InventarioPage /> : <DashboardPage />;
      case 'usuarios':
        return esAdmin ? (
          <UsuariosPage onLogout={handleLogout} usuario={usuario} />
        ) : (
          <DashboardPage />
        );
      case 'mi-cuenta':
        return <MiCuentaPage usuario={usuario} />;
      default:
        return <DashboardPage />;
    }
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
      tituloVista={obtenerTituloVista()}
    >
      {renderVista()}
    </MainLayout>
  );
}

export default App;