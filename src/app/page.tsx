"use client"; // Asegura que este componente es un Client Component
import { HashRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/component/comNavbar';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { useEffect, useState, FC } from 'react';
import Home from '@/components/component/comLogin';
import Dashboard from '@/components/component/comDashboard';
import Proveedor from '@/components/component/catálogos/comProveedor';
import Prioridad from '@/components/component/catálogos/comPrioridad';
import Conocimiento from '@/components/component/catálogos/comConocimiento';
import Especialidad from '@/components/component/catálogos/comEspecialidad';
import Rol from '@/components/component/catálogos/comRoles';
import DetallePendientes from '@/components/component/tickets/DetallePendientes';
import DetalleEnProceso from '@/components/component/tickets/DetalleProceso';
import Equipos from '@/components/component/catálogos/comEquipo';
import AtencionTicket from '@/components/component/tickets/AtencionTicket';
import ConocimientoConsulta from '@/components/component/baseconocimiento/BaseConocimiento';
import Usuarios from '@/components/component/catálogos/Usuarios';
import Reporteria from '@/components/component/reporteria/Reporteria';

// Define un tipo para los props del ProtectedRoute
interface ProtectedRouteProps {
  component: FC;
}

function App() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarVisible(prev => !prev);
  };

  return (
    <Router>
      <AuthProvider>
        {isNavbarVisible && <Navbar toggleNavbar={toggleNavbar} isCollapsed={false} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute component={Dashboard} />}
          />
          <Route
            path="/proveedor"
            element={<ProtectedRoute component={Proveedor} />}
          />
          <Route
            path="/prioridad"
            element={<ProtectedRoute component={Prioridad} />}
          />
          <Route
            path="/rol"
            element={<ProtectedRoute component={Rol} />}
          />
          <Route
            path="/catconocimiento"
            element={<ProtectedRoute component={Conocimiento} />}
          />
          <Route
            path="/especialidad"
            element={<ProtectedRoute component={Especialidad} />}
          />
          <Route
            path="/detallependientes"
            element={<ProtectedRoute component={DetallePendientes} />}
          />
          <Route
            path="/detalleenproceso"
            element={<ProtectedRoute component={DetalleEnProceso} />}
          />
          <Route
            path="/equipo"
            element={<ProtectedRoute component={Equipos} />}
          />
          <Route
            path="/atencionticket"
            element={<ProtectedRoute component={AtencionTicket} />}
          />
          <Route
            path="/conocimiento"
            element={<ProtectedRoute component={ConocimientoConsulta} />}
          />
          <Route
            path="/usuario"
            element={<ProtectedRoute component={Usuarios} />}
          />
          <Route
            path="/reporteria"
            element={<ProtectedRoute component={Reporteria} />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { user, isLoading } = useAuth(); // Asegúrate de que 'isLoading' esté en tu AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') { // Asegúrate de estar en el cliente
      if (!user && !isLoading) {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Component /> : null;
};

export default App;
