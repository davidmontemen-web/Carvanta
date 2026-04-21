import DashboardPage from '../pages/DashboardPage';
import AppraisalsPage from '../pages/AppraisalsPage';
import VentasPage from '../pages/VentasPage';
import InventarioPage from '../pages/InventarioPage';
import UsuariosPage from '../pages/UsuariosPage';
import MiCuentaPage from '../pages/MiCuentaPage';

export const VIEW_KEYS = {
  DASHBOARD: 'dashboard',
  AVALUOS: 'avaluos',
  VENTAS: 'ventas',
  INVENTARIO: 'inventario',
  USUARIOS: 'usuarios',
  MI_CUENTA: 'mi-cuenta'
};

export const ADMIN_VIEWS = [
  VIEW_KEYS.DASHBOARD,
  VIEW_KEYS.AVALUOS,
  VIEW_KEYS.VENTAS,
  VIEW_KEYS.INVENTARIO,
  VIEW_KEYS.USUARIOS,
  VIEW_KEYS.MI_CUENTA
];

export const VALUADOR_VIEWS = [
  VIEW_KEYS.DASHBOARD,
  VIEW_KEYS.AVALUOS,
  VIEW_KEYS.MI_CUENTA
];

export const VIEW_TITLES = {
  [VIEW_KEYS.DASHBOARD]: 'Dashboard',
  [VIEW_KEYS.AVALUOS]: 'Avalúos',
  [VIEW_KEYS.VENTAS]: 'Ventas',
  [VIEW_KEYS.INVENTARIO]: 'Inventario',
  [VIEW_KEYS.USUARIOS]: 'Usuarios',
  [VIEW_KEYS.MI_CUENTA]: 'Mi cuenta'
};

export const getAllowedViews = (usuario) => {
  if (!usuario) return [];
  return usuario.rol === 'administrador' ? ADMIN_VIEWS : VALUADOR_VIEWS;
};

export const getViewTitle = (viewKey) => {
  return VIEW_TITLES[viewKey] || 'Carvanta';
};

export const getViewComponent = ({ viewKey, esAdmin, usuario, onLogout }) => {
  switch (viewKey) {
    case VIEW_KEYS.DASHBOARD:
      return <DashboardPage />;
    case VIEW_KEYS.AVALUOS:
      return <AppraisalsPage usuario={usuario} />;
    case VIEW_KEYS.VENTAS:
      return esAdmin ? <VentasPage /> : <DashboardPage />;
    case VIEW_KEYS.INVENTARIO:
      return esAdmin ? <InventarioPage /> : <DashboardPage />;
    case VIEW_KEYS.USUARIOS:
      return esAdmin ? <UsuariosPage onLogout={onLogout} usuario={usuario} /> : <DashboardPage />;
    case VIEW_KEYS.MI_CUENTA:
      return <MiCuentaPage usuario={usuario} />;
    default:
      return <DashboardPage />;
  }
};