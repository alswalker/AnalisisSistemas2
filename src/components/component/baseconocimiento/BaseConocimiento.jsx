"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import {CircleStackIcon, BookOpenIcon} from '@heroicons/react/24/solid';
import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/component/comNavbar";
import NuevoConocimiento from './NuevoConocimiento';
import ConsultaConocimiento from './ConsultaConocimiento'
import DetalleConocimiento from './DetalleConocimiento';

export default function ConocimientoConsulta() {
  const [activeComponent, setActiveComponent] = useState('consulta'); // Controla qué componente mostrar
  const [selectedRecord, setSelectedRecord] = useState(null); // Estado para el registro seleccionado
  const rolactual = sessionStorage.getItem('rolusuario');

  useEffect(() => {
    sessionStorage.setItem('currentPath', '/conocimiento');
  }, []);


  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
    setIsNavbarVisible(!isNavbarVisible);
  };


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
          <CardHeader>
            <CardTitle>Base de Conocimiento</CardTitle>
            <CardDescription>Problemas comunes y sus soluciones</CardDescription>
        </CardHeader>
            <button
              className="flex flex-col items-center justify-center px-4"
              title="Consultar todo"
              onClick={() => setActiveComponent('consulta')} 
            >
              <CircleStackIcon className="w-8 h-8 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Listado</span>
            </button>

            {(rolactual === 'Técnico' || rolactual === 'Administrador') && (
                <>
                <span className="border-l border-black h-8 mx-2"></span>
                <button
                  className="flex flex-col items-center justify-center px-4"
                  title="Agregar nueva solución"
                  onClick={() => setActiveComponent('nuevoconocimiento')} 
                >
                  <BookOpenIcon className="w-8 h-8 fill-[#003865]" />
                  <span className="text-center text-xs mt-1">Agregar</span>
                </button>
                </>
            )}
          </nav>
        </header>

        <hr className="w-full mt-2 border-black border-1" />
         {/* Renderizado condicional de componentes */}
         {activeComponent === 'consulta' && (
          <ConsultaConocimiento 
            setSelectedRecord={setSelectedRecord} // Paso de la función para seleccionar el registro
            setActiveComponent={setActiveComponent} // Paso de la función para cambiar de componente
          />
        )}
        {activeComponent === 'nuevoconocimiento' && <NuevoConocimiento />}
        {activeComponent === 'detalle' && (
          <DetalleConocimiento 
            selectedRecord={selectedRecord} // Paso del registro seleccionado
            setActiveComponent={setActiveComponent} // Volver a la consulta
          />
        )}
      </div>

      <footer className={`text-black text-center py-6 ${isNavbarVisible ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <p>&copy; {new Date().getFullYear()} Helpers. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
  