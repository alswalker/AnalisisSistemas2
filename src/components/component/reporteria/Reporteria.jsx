"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import {CircleStackIcon, WrenchIcon, PlusIcon} from '@heroicons/react/24/solid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/component/comNavbar";
import Generar from './GenerarReporte';
import Mantenimiento from './Mantenimiento';
import Nuevo from './AgregarReporte';
import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

export default function Reporteria() {
  const [activeComponent, setActiveComponent] = useState('generar'); // Controla qué componente mostrar
  const [selectedRecord, setSelectedRecord] = useState(null); // Estado para el registro seleccionado
  const rolactual = sessionStorage.getItem('rolusuario');

  useEffect(() => {
    sessionStorage.setItem('currentPath', '/reporteria');
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
            <CardTitle>Reportería</CardTitle>
            <CardDescription>Módulo Generador de Reportes | Helpers</CardDescription>
        </CardHeader>
            <button
              className="flex flex-col items-center justify-center px-4"
              title="Consultar todo"
              onClick={() => {
                setActiveComponent('generar'); 
                window.location.reload(); // Recarga la página
              }}
            >
              <CircleStackIcon className="w-8 h-8 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Reportes</span>
            </button>
            <button
              className="flex flex-col items-center justify-center px-4"
              title="Mantenimiento"
              onClick={() => setActiveComponent('mant')} 
            >
              <WrenchIcon className="w-8 h-8 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Mantenimiento</span>
            </button>
            <button
              className="flex flex-col items-center justify-center px-4"
              title="Mantenimiento"
              onClick={() => setActiveComponent('new')} 
            >
              <PlusIcon className="w-8 h-8 fill-[#003865]" />
              <span className="text-center text-xs mt-1">Nuevo Reporte</span>
            </button>
        
          </nav>
        </header>

        <hr className="w-full mt-2 border-black border-1" />
        {activeComponent === 'generar' && <Generar />}
        {activeComponent === 'mant' && <Mantenimiento />}
        {activeComponent === 'new' && <Nuevo />}

      </div>
 
      
    </div>
  );
}
  