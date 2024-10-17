"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import { useAuth } from '@/components/AuthContext';
import { ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';


export default function DetalleProceso() {
  const { user } = useAuth();
  const [detalleenproceso, setDetalleEnProceso] = useState([]);
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate(); // Define useNavigate aquí


  useEffect(() => {
    consultaEnProceso();
  }, [user]);

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/detalleenproceso');
  }, []);

  const consultaEnProceso = async () => {
    if (!user) {
      console.error('Usuario no disponible');
      setDetallePendientes([]);
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/enprocesodetail/tickets?usuario=${user.Username}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    //   console.log(user.Username)
    //   console.log(data)
        setDetalleEnProceso(data);
    } catch (error) {
      console.error('Error fetching detalleenproceso:', error);
      setDetalleEnProceso([]); // En caso de error, asegurarse de que proveedores es un array vacío
    }
  };

  const handleAtenderClick = (row) => {
    const ticketNumber = row.TICKET;
    navigate(`/atencionticket?ticket=${ticketNumber}`);
    window.location.reload();
  };

  const columnsDetalleEnProceso = [
    {
        name: 'Revisar',
        cell: (row) => (
          <button
            className="bg-[#003865] text-white py-1 px-3 rounded"
            onClick={() => handleAtenderClick(row)}
            title="Revisar"
          >
            <CheckCircleIcon   className="h-5 w-5" />
          </button>
        ),
        width: '110px'
    },
    {
      name: 'Ticket',
      selector: row => row.TICKET,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Prioridad',
      selector: row => row.PRIORIDAD,
      sortable: true,
      width: '120px',
      wrap: true,
    },
    {
      name: 'Incidente',
      selector: row => row.TITULO,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
        name: 'Estado',
        selector: row => row.EST_ESTATUS,
        sortable: true,
        width: '150px',
        wrap: true,
      },
    {
      name: 'Fecha Creación',
      selector: row => row.CREACION,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Fecha Límite',
      selector: row => row.LIMITE,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Cliente',
      selector: row => row.CLIENTE,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Técnico',
      selector: row => row.TECNICO,
      sortable: true,
      width: '150px',
      wrap: true,
    }
    
  ];

  const filteredItems = detalleenproceso.filter(
    item => (typeof item.TICKET === 'string' && item.TICKET.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.PRIORIDAD === 'string' && item.PRIORIDAD.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.TITULO === 'string' && item.TITULO.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.CREACION === 'string' && item.CREACION.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.LIMITE === 'string' && item.LIMITE.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.CLIENTE === 'string' && item.CLIENTE.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.TECNICO === 'string' && item.TECNICO.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.EST_ESTATUS === 'string' && item.EST_ESTATUS.toLowerCase().includes(filterText.toLowerCase()))
  );

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'detalle_pendientes.csv');
    link.click();
  };

  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
    setIsNavbarVisible(!isNavbarVisible);
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
              Detalle de Tickets En Proceso
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
                columns={columnsDetalleEnProceso}
                data={filteredItems}
                pagination
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
