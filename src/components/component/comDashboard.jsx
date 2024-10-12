import { useEffect, useState } from 'react';
import { Navbar } from "@/components/component/comNavbar";
import TicketCards from "@/components/component/TicketCards";
import { CardPastelTickets, BarChartServiciosRecurrentes } from './comGraphs'; // Importa el componente de la gráfica
import { useAuth } from '@/components/AuthContext';
import { PlusIcon, AdjustmentsHorizontalIcon , MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/solid';
import ModalTicketCrea from '@/components/component/tickets/ModalTicketCrea'; 
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import Swal from 'sweetalert2';

const DateTimeDisplay = () => {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentDateTime = new Date().toLocaleString();
      setDateTime(currentDateTime);
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(intervalId); // Limpia el intervalo en el desmontaje
  }, []);

  return (
    <p className="text-black">Bandeja hoy {dateTime}</p>
  );
};

export default function Dashboard() {
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const navigate = useNavigate(); 
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTicket = () => {
    handleCloseModal();
  };

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
    setIsNavbarVisible(!isNavbarVisible);
  };

  const handleInputChange = (e) => {
    setTicketNumber(e.target.value);
  };

  const performSearch = () => {
    if (ticketNumber.trim() === '') {
      Swal.fire({
        icon: 'info',
        title: 'Búsqueda Ticket',
        text: 'Por favor, ingresa un número de ticket'
      });
      return;
    }

    if (!/^\d+$/.test(ticketNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Búsqueda Ticket',
        text: 'El número de ticket debe ser un número entero'
      });
      return;
    }

    // Redirigir a la página de atención del ticket
    navigate(`/atencionticket?ticket=${ticketNumber}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleSearchClick = () => {
    performSearch();
  };

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/dashboard');
  }, []);

  return (
    <div id="wrapper" className="flex flex-col min-h-screen">
      <Navbar isCollapsed={isNavbarVisible} toggleNavbar={toggleNavbar} />
      <button
          onClick={toggleNavbar}
          className={`fixed top-1 left-15 z-50 focus:outline-none 
            ${isNavbarCollapsed ? 'text-white-on-dark' : 'text-white-on-dark'} 
            mix-blend-difference`}
          aria-label={isNavbarCollapsed ? 'Mostrar Navbar' : 'Ocultar Navbar'}
          title={isNavbarCollapsed ? 'Mostrar Navbar' : 'Ocultar Navbar'}
      >
        <AdjustmentsHorizontalIcon className="w-8 h-8 mb-5 ml-5" />
      </button>

      <div className="flex flex-1 justify-center">
        <main className={`flex-1 p-6 transition-transform duration-300 max-w-5xl ${isNavbarVisible ? 'ml-64' : 'ml-0'}`}>
          <header className="flex flex-col justify-between items-start mb-6 w-full py-4">
            <div className="flex justify-between w-full items-center">
              <h1 className="text-xl font-semibold header-text">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar ticket..."
                    value={ticketNumber}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress} // Detectar Enter
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <SearchIcon
                    className="absolute right-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
                    onClick={handleSearchClick} // Detectar clic en el icono
                  />
                </div>
                <div className="relative">
                  <ModalTicketCrea 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTicket} 
                    />     
                </div>
              </div>
            </div>
            <hr className="w-full mt-2 border-black border-1" />
            <div className="text-sm header-text mt-4">
              <DateTimeDisplay />
            </div>
          </header>
          <TicketCards />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <CardPastelTickets title="Tickets por Departamento" />
            <BarChartServiciosRecurrentes title="Tickets por tipo de Incidente" />
          </div>

        </main>
      </div>
      <footer className={`text-black text-center py-6 ${isNavbarVisible ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <p>&copy; {new Date().getFullYear()} Helpers. Todos los derechos reservados.</p>
      </footer>     
    </div>
  );
}
