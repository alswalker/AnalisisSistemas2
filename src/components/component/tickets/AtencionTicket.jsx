import { useEffect, useState } from 'react';
import { Navbar } from "@/components/component/comNavbar";
import { TicketIcon, BookOpenIcon, BarsArrowUpIcon, WrenchIcon, ListBulletIcon, QuestionMarkCircleIcon
    ,UsersIcon, PresentationChartLineIcon, WrenchScrewdriverIcon, CurrencyDollarIcon, PaperClipIcon, ChatBubbleBottomCenterTextIcon
 } from '@heroicons/react/24/solid';
 import { useLocation } from 'react-router-dom';
import DetalleTicket from './DetalleTicket'; // Corregido a PascalCase
import AccionesTicket from './AccionesTicket'; // Corregido a PascalCase
import NuevaAccion from './NuevaAccion';
import Antecedentes from './AntecedentesCliente';
import EncuestaDetalle from './DetalleEncuesta';
import ReasignarTicket from './ReasignarTicket';
import NuevoMantenimiento from './NuevoMantenimiento';
import HistorialMantenimiento from './MantenimientosTicket';
import AsignarConocimiento from '@/components/component/tickets/AsignarConocimiento';
import Archivos from '@/components/component/tickets/ArchivosTicket';
import RevisionQA from '@/components/component/tickets/RevisionQA';
import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

export default function AtencionTicket() {
    
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [activeComponent, setActiveComponent] = useState('ticket'); // Controla qué componente mostrar
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const ticketNumber = query.get('ticket'); // Obtiene el parámetro ticket de la URL
  const savedTicketNumber = sessionStorage.getItem('ticketNumber');
  const rolactual = sessionStorage.getItem('rolusuario');
  const [showMenu, setShowMenu] = useState(false);


  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
    setIsNavbarVisible(!isNavbarVisible);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu); // Alternar la visibilidad del menú
  };

  useEffect(() => {
    sessionStorage.setItem('currentPath', '/atencionticket');
  }, []);

  //guardo el ticket para que sea accesible en toda la sesión
  useEffect(() => {
    if (ticketNumber) {
      sessionStorage.setItem('ticketNumber', ticketNumber);
    }
  }, [ticketNumber]);


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
      
      <div className={`flex-1 p-6 transition-transform duration-300 ${isNavbarVisible ? 'ml-64' : 'ml-0'}`}>
        <header className="flex items-center h-16 px-4 shrink-0 md:px-6">
          <nav className="flex items-center gap-6 text-lg font-medium md:text-sm">
            <button
              className="flex flex-col items-center justify-center"
              title="Ir al ticket actual"
              onClick={() => setActiveComponent('ticket')} 
            >
              <TicketIcon className="w-5 h-5 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Ticket</span>
            </button>

            <span className="border-l border-black h-8 mx-2"></span>

            <button
              className="flex flex-col items-center justify-center"
              title="Revisar acciones del Ticket"
              onClick={() => setActiveComponent('actions')} 
            >
              <BookOpenIcon className="w-5 h-5 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Acciones</span>
            </button>

            <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}

                <button
                  className="flex flex-col items-center justify-center"
                  title="Agregar una nueva acción"
                  onClick={() => setActiveComponent('nuevaccion')}

                >
                  <BarsArrowUpIcon className="w-5 h-5 fill-[#003865]" />
                  <span className="text-center text-xs mt-1">Agregar Acción</span>
                </button>

                <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}

                <button
                    className="flex flex-col items-center justify-center"
                    title="Historial de tickets del cliente"
                    onClick={() => setActiveComponent('antecedentes')} 
                >
                    <ListBulletIcon className="w-5 h-5 fill-[#003865]" />
                    <span className="text-center text-xs mt-1">Historial Cliente</span>
                </button>

                <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}
                <button
                    className="flex flex-col items-center justify-center"
                    title="Historial de tickets del cliente"
                    onClick={() => setActiveComponent('archivos')} 
                >
                    <PaperClipIcon className="w-5 h-5 fill-[#003865]" />
                    <span className="text-center text-xs mt-1">Archivos</span>
                </button>

                {(rolactual === 'Técnico' || rolactual === 'Administrador' || rolactual === 'QA') && (
                  <>

                  <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}

                  <button
                      className="flex flex-col items-center justify-center"
                      title="Agregar nueva solución"
                      onClick={() => setActiveComponent('asiognarconocimiento')} 

                  >
                      <QuestionMarkCircleIcon className="w-5 h-5 fill-[#003865]" />
                      <span className="text-center text-xs mt-1">Base de Conocimiento</span>
                  </button>
                  </>
                )}

                <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}

                <div className="relative">
                  {/* Botón que activa el menú */}
                  <button
                    className="flex flex-col items-center justify-center"
                    title="Costos de mantenimiento"
                    onClick={toggleMenu}
                  >
                    <WrenchIcon className="w-5 h-5 fill-[#003865]" />
                    <span className="text-center text-xs mt-1">Mantenimiento</span>
                  </button>

                  {/* Menú desplegable */}
                  {showMenu && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2 w-48 z-10">
                      
                      {(rolactual === 'Técnico' || rolactual === 'Administrador') && (
                        <>
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-200 rounded"
                        onClick={() => {
                          setShowMenu(false);
                          setActiveComponent('nuevomant');
                        }}
                      >
                        {/* Nuevo Mantenimiento */}
                        <WrenchScrewdriverIcon className="w-5 h-5 mr-2 fill-[#003865]"/>
                        <span className="text-sm">Nuevo</span>
                      </button>
                      </>
                      )}
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-200 rounded"
                        onClick={() => {
                          setShowMenu(false);
                          setActiveComponent('histmant');
                        }}
                      >
                        {/* Ver Historial de Mantenimiento */}
                        <CurrencyDollarIcon className="w-5 h-5 mr-2 fill-[#003865]"/>
                        <span className="text-sm">Historial</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}

                <button
                  className="flex flex-col items-center justify-center"
                  title="Revisar la encuesta del ticket"
                  onClick={() => setActiveComponent('encuesta')} 

                >
                  <PresentationChartLineIcon className="w-5 h-5 fill-[#003865]" />
                  <span className="text-center text-xs mt-1">Encuesta</span>
                </button>          

              {(rolactual === 'Técnico' || rolactual === 'Administrador') && (
                <>
                  <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}
                  
                  <button
                    className="flex flex-col items-center justify-center"
                    title="Reasignar técnico"
                    onClick={() => setActiveComponent('reasignar')} 

                  >
                    <UsersIcon className="w-5 h-5 fill-[#003865]" />
                    <span className="text-center text-xs mt-1">Reasignar</span>
                  </button>
                </>
              )}
              {(rolactual === 'QA' || rolactual === 'Administrador') && (
                <>
                  <span className="border-l border-black h-8 mx-2"></span> {/* Línea separadora */}
                  
                  <button
                    className="flex flex-col items-center justify-center"
                    title="Revisión de Control de Calidad"
                    onClick={() => setActiveComponent('revisionqa')} 

                  >
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 fill-[#003865]" />
                    <span className="text-center text-xs mt-1">QA</span>
                  </button>
                </>
              )}
          </nav>
        </header>

        <hr className="w-full mt-2 border-black border-1" />
        {/* Renderizado condicional de componentes */}
        {activeComponent === 'ticket' && <DetalleTicket ticketNumber={savedTicketNumber} />}
        {activeComponent === 'actions' && <AccionesTicket ticketNumber={savedTicketNumber}/>}
        {activeComponent === 'nuevaccion' && <NuevaAccion ticketNumber={savedTicketNumber} />}
        {activeComponent === 'antecedentes' && <Antecedentes ticketNumber={savedTicketNumber} />}
        {activeComponent === 'encuesta' && <EncuestaDetalle ticketNumber={savedTicketNumber} />}
        {activeComponent === 'reasignar' && <ReasignarTicket ticketNumber={savedTicketNumber} />}
        {activeComponent === 'nuevomant' && <NuevoMantenimiento ticketNumber={savedTicketNumber} />}
        {activeComponent === 'histmant' && <HistorialMantenimiento ticketNumber={savedTicketNumber} />}
        {activeComponent === 'asiognarconocimiento' && <AsignarConocimiento ticketNumber={savedTicketNumber}/>}
        {activeComponent === 'archivos' && <Archivos ticketNumber={savedTicketNumber} />}
        {activeComponent === 'revisionqa' && <RevisionQA ticketNumber={savedTicketNumber} />}



      </div>

      <footer className={`text-black text-center py-6 ${isNavbarVisible ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <p>&copy; {new Date().getFullYear()} Helpers. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
