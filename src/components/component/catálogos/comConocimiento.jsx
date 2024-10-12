"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import ModalPrioridades from "@/components/component/catálogos/modPrioridad";
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import { useAuth } from '@/components/AuthContext';
import {
  DocumentCheckIcon  ,
  MinusCircleIcon,
  PencilIcon,
  XCircleIcon ,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';


export default function Prioridades() {
  const { user } = useAuth();
  const [conocimiento, setConocimiento] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [editRowId, setEditRowId] = useState(null);

  useEffect(() => {
    consultaConocimiento();
  }, []);
  

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/catconocimiento');
  }, []);

  const consultaConocimiento = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/conocimiento`);
      const data = await response.json();
      setConocimiento(data);
    } catch (error) {
      console.error('Error fetching conocimiento:', error);
    }
  };
  
  const handleCancelClick = () => {
    setEditRowId(null);
  };
  
  const handleBaja = async (idPrioridad) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_CONOCIMIENTO&columna=CON_ID&id=${idPrioridad}&estatus=0`, 
        { method: 'POST' }
      );
      
      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaConocimiento();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el registro',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (idPrioridad, nombre) => {
    Swal.fire({
      title: `¿Desea dar de baja el registro? ${nombre}`,
      icon: "warning",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Dar de baja",
      showCancelButton: true,
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        handleBaja(idPrioridad);
      }
    });
  };



  const columnsPrioridades = [
    
    {
        name: 'Acciones',
        cell: (row) => (
            <>
                {editRowId === row.CON_ID ? (
                    <>
                        <button
                            className="bg-green-700 text-white py-1 px-3 rounded mr-2 flex items-center"
                            onClick={handleUpdateClick}
                            title="Actualizar" // Tooltip para el botón de actualizar
                        >
                            <DocumentCheckIcon   className="h-5 w-5" />
                            {/* Guardar */}
                        </button>
                        <button
                            className="bg-red-700 text-white py-1 px-3 rounded flex items-center"
                            onClick={handleCancelClick}
                            title="Dar de Baja"
                        >
                            <XCircleIcon  className="h-5 w-5" />
                            {/* Cancelar */}
                        </button>
                    </>
                ) : (
                    <>
                        {/* <button
                            className="bg-[#003865] text-white py-1 px-3 rounded mr-2"
                            onClick={() => handleEditClick(row)}
                            title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button> */}
                        <button
                            className="bg-red-700 text-white py-1 px-3 rounded"
                            onClick={() => deseaDarBaja(row.CON_ID, row.CON_TITULO)}
                            title="Dar de Baja"
                        >
                            <MinusCircleIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
            </>
        ),
        width: '100px'
    },
    {
      name: 'Id',
      selector: row => row.CON_ID,
      sortable: true,
      width: '100px',
      wrap: true, // Ajuste automático del contenido

    },
    {
        name: 'Título',
        selector: row => row.CON_TITULO,
        sortable: true,
        width: '200px',
        wrap: true, // Ajuste automático del contenido
      },
      {
          name: 'Problema',
          selector: row => row.CON_DESCRIPCION,
          sortable: true,
          width: '400px',
          wrap: true, // Ajuste automático del contenido
      },
      {
        name: 'Estatus',
        selector: row => row.ESTATUS,
        sortable: true,
        width: '200px',
        wrap: true, // Ajuste automático del contenido
    },
    
  ];

  const filteredItems = conocimiento.filter(
    item => (typeof item.CON_ID === 'string' && item.CON_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CON_VISITAS === 'string' && item.CON_VISITAS.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CON_TITULO === 'string' && item.CON_TITULO.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CON_DESCRIPCION === 'string' && item.CON_DESCRIPCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CON_SOLUCION === 'string' && item.CON_SOLUCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CATEGORIA === 'string' && item.CATEGORIA.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.FECHA_CREACION === 'string' && item.FECHA_CREACION.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.ESTATUS === 'string' && item.ESTATUS.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.AUTOR === 'string' && item.AUTOR.toLowerCase()?.includes(filterText.toLowerCase()))

 );

  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
    setIsNavbarVisible(!isNavbarVisible);
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalogoconocimiento.csv`);
    link.click();
  };

  
  return (
    <>
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
      <div id="wrapper" className="flex flex-col min-h-screen">
        <div className={`flex-1 p-6 transition-transform duration-300 ${isNavbarVisible ? 'ml-64' : 'ml-0'}`}>
        <header className="flex flex-col justify-between mb-6">
            <p className="text-black font-semibold text-left py-6">
              Catálogo Base de Conocimientos
            </p>
            <hr className="w-full mb-4 border-black border-1" />
          </header>
            <section className="flex justify-center">
            <div className="w-5/6">

                <div className="flex justify-end mb-4">
                     <button
                  onClick={exportToCSV}
                  className="bg-yellow-500 text-black py-2 px-4 rounded ml-4 flex items-center"
                  title="Exportar CSV"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                </div>
                <div className="flex justify-between mb-4">
                  <input
                    type="text"
                    className="w-full p-2 rounded input_field"
                    placeholder="Buscar..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                  />
                </div>
                <DataTable
                  className="custom-datatable"
                  columns={columnsPrioridades}
                  data={filteredItems}
                  pagination
                  // theme="custom"
                  highlightOnHover
                  striped
                  paginationPerPage={20} // 20 filas por defecto
                  noDataComponent="No hay registros para mostrar" 
                  paginationComponentOptions={{
                    rowsPerPageText: 'Registros por página:',
                    rangeSeparatorText: 'de',
                    noRowsPerPage: false, // en true para ocultar el boton de cuantos registros x pagina
                    selectAllRowsItem: true,
                    selectAllRowsItemText: 'Todos',
                  }}
                />
              </div>
            </section>
          </div>
        </div>
        <footer className={`text-black text-center py-6 ${isNavbarVisible ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        <p>&copy; {new Date().getFullYear()} Helpers. Todos los derechos reservados.</p>
      </footer>
    </>
  );

}
