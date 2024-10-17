import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from "@/components/ui/collapsible";
import { 
  BanknoteIcon, BookIcon, CheckIcon, ChevronDownIcon, CreditCardIcon,
  CurrencyIcon, HomeIcon, LogOutIcon, MergeIcon, MoveIcon, ShoppingCartIcon,
  WalletIcon, WorkflowIcon, BellIcon, LayoutDashboardIcon, MailIcon, MenuIcon,
  PhoneIcon, SettingsIcon, TicketIcon, UserIcon, FileQuestionIcon, FolderIcon
} from '@/components/component/comIcons';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { PlusIcon, MagnifyingGlassIcon as SearchIcon, UserGroupIcon} from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';


import { BellAlertIcon, TableCellsIcon, FolderOpenIcon} from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon} from '@heroicons/react/24/outline';

import Image from "next/image";
import logo from "../../app/icons/helpdesk.png";
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState } from 'react';
import { getIpApis } from '@/components/component/configip';

interface NavbarProps {
  isCollapsed: boolean;
  toggleNavbar: () => void;
}

// Define un tipo para el usuario
interface User {
  Username: string;
}

const fetchTicketData = async (endpoint: string, username: string, setData: (data: any) => void) => {
  try {
    const response = await fetch(`${getIpApis()}${endpoint}?idUsuario=${username}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setData([{ descripcion: 'Error', total: 0 }]);
  }
};

export function Navbar({ isCollapsed, toggleNavbar }: NavbarProps) {
  const { user, logout } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [rolUsuario, setRolUsuario] = useState<string>('');
  const [pendingTickets, setPendingTickets] = useState([{ total: 0 }]);
  const [inProgressTickets, setInProgressTickets] = useState([{ total: 0 }]);
  const [ticketNumber, setTicketNumber] = useState(''); // Nueva barra de búsqueda
  const navigate = useNavigate(); // Redireccionar a otra página
  const usuario = sessionStorage.getItem('user');

  // Verifica si existe el valor y luego parsea el JSON para obtener el Username
  let username = '';
  
  if (usuario) {
    const usuarioObj = JSON.parse(usuario);  // Parsear el JSON a un objeto
    username = usuarioObj.Username;  // Obtener el valor de Username
  }
 

  useEffect(() => {
    if (!user) {
      window.location.hash = '/';
    } else {
      consultaDatosUsuario(); // Combina las consultas en una sola función
      fetchTicketData('/helpers/pendientes/tickets', username, setPendingTickets);
      fetchTicketData('/helpers/enproceso/tickets', username, setInProgressTickets);
// console.log(username)
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    navigate(`/atencionticket?ticket=${ticketNumber}`);
    window.location.reload();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };


  const consultaDatosUsuario = async () => {
    if (!user || !username) return;

    try {
      // Consulta el nombre del usuario
      const nombreResponse = await fetch(`${getIpApis()}/helpers/login/nombreusuarios?usuario=${username}`, { method: 'GET' });

      if (!nombreResponse.ok) {
        throw new Error(`HTTP error! status: ${nombreResponse.status}`);
      }
      const nombreData = await nombreResponse.json();

      if (Array.isArray(nombreData) && nombreData.length > 0) {
        setNombreUsuario(nombreData[0].NOMBRE); 
      } else {
        setNombreUsuario(''); 
      }

      // Consulta el rol del usuario
      const rolResponse = await fetch(`${getIpApis()}/helpers/login/rolusuario?usuario=${username}`, { method: 'GET' });

      if (!rolResponse.ok) {
        throw new Error(`HTTP error! status: ${rolResponse.status}`);
      }
      const rolData = await rolResponse.json();

      if (Array.isArray(rolData) && rolData.length > 0) {
        setRolUsuario(rolData[0].ROL); 
        sessionStorage.setItem('rolusuario', rolData[0].ROL);
      } else {
        setRolUsuario(''); 
      }
      
    } catch (error) {
      console.error('Error fetching usuario data:', error);
      setNombreUsuario('');
      setRolUsuario('');
    }
  };

  const totalTickets = pendingTickets[0].total + inProgressTickets[0].total; // Sumar tickets


  return (
    <aside className={`fixed top-0 left-0 w-64 h-full bg-[#003865] overflow-y-auto transition-all duration-300 ${isCollapsed ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6">
        
        <div className="flex flex-col items-center mb-6 mt-16">
          <div className="relative mb-4">
            <Image 
              src={logo}
              alt="logo"
              width={120}
              height={120}
              className="object-contain" 
            />
            <div className="flex items-center justify-center">
              <span className="text-sm text-white-on-dark">Bienvenido/a: </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            {user && (
              <div className="text-sm text-white-on-dark">
                <span className="block text-center break-words">{nombreUsuario || username}</span>
              </div>
            )}
          </div>
          {/* Nueva sección para mostrar el rol del usuario */}
          <div className="mt-auto p-4">
              <p className="text-xs text-white-on-dark text-center">Tipo de usuario: {rolUsuario}</p>
            </div>
        </div>
         {/* Barra de búsqueda */}
         <div className="flex items-center justify-center mb-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar ticket..."
              value={ticketNumber}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} // Detectar Enter
              className="px-4 py-2 w-full border border-gray-300 rounded-md"
            />
            <SearchIcon
              className="absolute right-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
              onClick={performSearch} // Detectar clic en el icono
            />
          </div>
        </div>
        {/* Fin de la barra de búsqueda */}
        <nav className="space-y-2">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-white-on-dark rounded-md bg-gray-700">
            <HomeIcon className="h-5 w-5" />
            <span className="ml-3 text-white-on-dark">Inicio</span>
          </Link>
          <Collapsible>
          <CollapsibleTrigger className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                <TicketIcon className="h-5 w-5" />
                <span className="ml-3 text-white-on-dark">Tickets</span>
                {totalTickets > 0 && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                    {totalTickets}
                  </span>
                )}
                <ChevronDownIcon className="ml-auto h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-2">

               <Link to="/detallependientes" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                 <BellAlertIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Pendientes</span>
                  <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-1 text-xs">{pendingTickets[0].total}</span>
                </Link>
               <Link to="/detalleenproceso" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                 <FolderOpenIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">En Proceso</span>
                  <span className="ml-auto bg-green-500 text-white rounded-full px-2 py-1 text-xs">{inProgressTickets[0].total}</span>

               </Link>
          </CollapsibleContent>
          </Collapsible>

          {/* Mostrar el menú de catálogos solo si el rol es Administrador */}
          {rolUsuario === 'Administrador' && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                <BookIcon className="h-5 w-5" />
                <span className="ml-3 text-white-on-dark">Catálogos</span>
                <ChevronDownIcon className="ml-auto h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-2">
                <Link to="/especialidad" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Especialidad</span>
                </Link>
                <Link to="/equipo" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Equipo</span>
                </Link>
                <Link to="/departamento" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Deptos</span>
                </Link>
                <Link to="/rol" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Rol</span>
                </Link>
                <Link to="/proveedor" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Proveedor</span>
                </Link>
                <Link to="/prioridad" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Prioridad</span>
                </Link>
                <Link to="/tipoaccion" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">Tipo Acción</span>
                </Link>
                <Link to="/catconocimiento" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
                  <TableCellsIcon className="h-5 w-5" />
                  <span className="ml-3 text-white-on-dark">FAQS</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
            
          )}
          {rolUsuario === 'Administrador' && (

           <Link to="/usuario" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
            <UserGroupIcon className="h-6 w-6" />
            <span className="ml-3 text-white-on-dark">Usuarios</span>
          </Link>
          )}
          <Link to="/conocimiento" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
            <QuestionMarkCircleIcon className="h-6 w-6" />
            <span className="ml-3 text-white-on-dark">Base de Conocimiento</span>
          </Link>
          <Link to="/reporteria" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700">
            <TableCellsIcon className="h-6 w-6" />
            <span className="ml-3 text-white-on-dark">Reportes</span>
          </Link>
          <Link to="/" className="flex items-center px-3 py-2 text-white-on-dark rounded-md hover:bg-gray-700" onClick={logout}>
            <LogOutIcon className="h-5 w-5" />
            <span className="ml-3 text-white-on-dark">Cerrar Sesión</span>
          </Link>
        </nav>
        
      </div>
    </aside>
  );
}
