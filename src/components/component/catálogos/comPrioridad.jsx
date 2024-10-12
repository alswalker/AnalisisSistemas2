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
  const [prioridades, setPrioridades] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    PRI_ID: '',
    PRI_PRIORIDAD: ''
  });


  useEffect(() => {
    consultaPrioridades();
  }, []);
  

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/prioridad');
  }, []);

  const consultaPrioridades = async () => {
      try {
          const response = await fetch(`${getIpApis()}/helpers/read/prioridades`, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setPrioridades(data);
      } catch (error) {
          console.error('Error fetching prioridades:', error);
          setPrioridades([]);
      }
  };  
  

 const handleEditClick = (priori) => {
    setEditRowId(priori.PRI_ID);
    setEditFormData({ ...priori });
};

const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
};

const handleUpdateClick = async () => {
    try {
        const prioridad = editFormData.PRI_PRIORIDAD;
       

        const camposVacios = [];

        if (!prioridad) camposVacios.push('Prioridad');
        // if (!direccion) camposVacios.push('Dirección');
        // if (!nit) camposVacios.push('NIT');
        // if (!telefono) camposVacios.push('Teléfono');
        // if (!correo) camposVacios.push('Correo');

        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }

      

        const url = `${getIpApis()}/helpers/update/prioridades`;
        const prioridadData = {
            prioridad: prioridad,
            idPrioridad: editFormData.PRI_ID
        };

        // console.log(prioridadData)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prioridadData)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro actualizado correctamente!',
            }).then(function () {
                consultaPrioridades();
                setEditRowId(null);
            });
        } else {
            throw new Error('Error al actualizar el registro');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al actualizar registro',
            text: error.message,
        });
    }
  };

  
  const handleCancelClick = () => {
    setEditRowId(null);
  };
  
  const handleBaja = async (idPrioridad) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_PRIORIDAD&columna=PRI_ID&id=${idPrioridad}&estatus=0`, 
        { method: 'POST' }
      );
      
      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaPrioridades();
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaPrioridades();
  };

  const handleSavePrioridad = () => {
    handleCloseModal();
    consultaPrioridades();
  };

  const columnsPrioridades = [
    
    {
        name: 'Acciones',
        cell: (row) => (
            <>
                {editRowId === row.PRI_ID ? (
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
                        <button
                            className="bg-[#003865] text-white py-1 px-3 rounded mr-2"
                            onClick={() => handleEditClick(row)}
                            title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            className="bg-red-700 text-white py-1 px-3 rounded"
                            onClick={() => deseaDarBaja(row.PRI_ID, row.PRI_PRIORIDAD)}
                            title="Dar de Baja"
                        >
                            <MinusCircleIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
            </>
        ),
        width: '210px'
    },
    {
      name: 'Id',
      selector: row => row.PRI_ID,
      sortable: true,
      width: '100px',
      wrap: true, // Ajuste automático del contenido

    },
    {
         name: 'Prioridad',
        selector: row => row.PRI_PRIORIDAD, 
        sortable: true,
        width: '150px',
        wrap: true, // Ajuste automático del contenido

         cell: (row) => editRowId === row.PRI_ID ? (
            <input
                type="text"
                name="PRI_PRIORIDAD" 
                value={editFormData.PRI_PRIORIDAD} 
                onChange={handleEditFormChange}
                className="w-full p-2 rounded bg-[#003865] text-white"
                style={{ minHeight: '40px', resize: 'vertical' }}

            />
        ) : row.PRI_PRIORIDAD 
    }
    
  ];

const filteredItems = prioridades.filter(
    item => (typeof item.PRI_ID === 'string' && item.PRI_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRI_PRIORIDAD === 'string' && item.PRI_PRIORIDAD.toLowerCase()?.includes(filterText.toLowerCase()))
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
    link.setAttribute('download', 'prioridades.csv');
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
              Catálogo Prioridades
            </p>
            <hr className="w-full mb-4 border-black border-1" />
          </header>
            <section className="flex justify-center">
            <div className="w-5/6">

                <div className="flex justify-end mb-4">
                  <ModalPrioridades 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSavePrioridad} /> 
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
