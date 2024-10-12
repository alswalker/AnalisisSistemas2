"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import ModalEquipos from "@/components/component/catálogos/modEquipo";
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import { useAuth } from '@/components/AuthContext';
import {
    CheckIcon,
    MinusCircleIcon,
    PencilIcon,
    XCircleIcon ,
    ArrowDownTrayIcon,
    DocumentCheckIcon 
  } from '@heroicons/react/24/solid';
  import {AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';


export default function Equipo() {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    EQP_ID: '',
    PROVEEDOR: '',
    EQP_EQUIPO: '',
    EQP_CATEGORIA: '',
    EQP_PRECIO_UNITARIO: ''
  });

  const [proveedorcombo, setproveedorcombo] = useState([]);

    useEffect(() => {
    consultaEquipos();
    comboProveedor();
  }, []);


  const comboProveedor = async () => {
    try {
        const response = await fetch(`${getIpApis()}/helpers/combos/proveedores`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Fetched proveedorcombo:', data); // Log para depuración
        setproveedorcombo(data);
    } catch (error) {
        console.error('Error fetching prioridadcombo:', error);
        setproveedorcombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
    }
};

  useEffect(() => {
    sessionStorage.setItem('currentPath', '/equipo');
  }, []);

  const consultaEquipos = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/equipos`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEquipos(data);
    } catch (error) {
      console.error('Error fetching equipos:', error);
      setEquipos([]); // En caso de error, asegurarse de que equipos es un array vacío
    }
  };

  const handleEditClick = (equipo) => {
    // Busca el proveedor por nombre comercial
    const proveedorSeleccionado = proveedorcombo.find(prv => prv.PRV_NOMBRE_COMERCIAL === equipo.PROVEEDOR);
  
    setEditRowId(equipo.EQP_ID);
    setEditFormData({
      ...equipo,
      PROVEEDOR: proveedorSeleccionado ? proveedorSeleccionado.PRV_NOMBRE_COMERCIAL : equipo.PROVEEDOR
    });
  };
  

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = async () => {
    try {
     const Equipo = editFormData.EQP_EQUIPO;
     const Categoria = editFormData.EQP_CATEGORIA;
     const PrecioUnitario = editFormData.EQP_PRECIO_UNITARIO;

     
     const prvParts = editFormData.PROVEEDOR.split('-'); // Dividir el estado en número y texto
     const provID = prvParts[0].trim(); // Obtener solo el número del estado
    
      const camposVacios = [];
      if (!Equipo) camposVacios.push('Nombre Equipo');
      if (!Categoria) camposVacios.push('Categoría');
      if (!PrecioUnitario) camposVacios.push('Precio Unitario');

      if (camposVacios.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Campos obligatorios',
          text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
        });
        return;
      }

      const url = `${getIpApis()}/helpers/update/equipos`;
      const equipoData = {
        idProveedor : provID,
        Equipo: Equipo,
        Categoria: Categoria,
        PrecioUnitario: PrecioUnitario,
        idEquipo: editFormData.EQP_ID
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipoData)
      });

    // console.log(equipoData)

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro actualizado correctamente!',
        }).then(function () {
          consultaEquipos();
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

  const handleBaja = async (equipoId) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_EQUIPO&columna=EQP_ID&id=${equipoId}&estatus=0`, 
        { method: 'POST' }
      );
      
      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaEquipos();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el registro',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (equipoId, nombre) => {
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
        handleBaja(equipoId);
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaEquipos();
  };

  const handleSaveEquipo = () => {
    consultaEquipos();
    handleCloseModal();
  };

  const columnsEquipos = [
    {
      name: 'Acciones',
      cell: (row) => (
        <>
          {editRowId === row.EQP_ID ? (
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
               title="Cancelar" // Tooltip para el botón de cancelar
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
                            onClick={() => deseaDarBaja(row.EQP_ID, row.EQP_EQUIPO)}
                            title="Dar de Baja"
                        >
                            <MinusCircleIcon className="h-5 w-5" />
                        </button>
                    </>
          )}
        </>
      ),
      width: '120px'
    },
    {
      name: 'Id',
      selector: row => row.EQP_ID,
      sortable: true,
      width: '100px',
      wrap: true, // Ajuste automático del contenido

    },
    {
      name: 'Nombre',
      selector: row => row.EQP_EQUIPO,
      sortable: true,
      width: '250px',
      wrap: true, // Ajuste automático del contenido

      cell: (row) => editRowId === row.EQP_ID ? (
        <input
          type="text"
          name="EQP_EQUIPO"
          value={editFormData.EQP_EQUIPO}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
          style={{ minHeight: '40px', resize: 'vertical' }}

        />
      ) : row.EQP_EQUIPO
    },
    {
        name: 'Proveedor',
        selector: row => row.PROVEEDOR,
        sortable: true,
        width: '200px',
        wrap: true, // Ajuste automático del contenido
      
        cell: (row) => editRowId === row.EQP_ID ? (
          <div className="grid grid-cols-4 items-center gap-4">
            <select
              id="provID"
              value={editFormData.PROVEEDOR}
              onChange={(e) => setEditFormData({ ...editFormData, PROVEEDOR: e.target.value })}
              name="PROVEEDOR"
              className="col-span-4 w-full p-2 rounded bg-[#003865] text-white"
            >
              <option value="">Seleccionar proveedor</option>
              {proveedorcombo.map(prv => (
                <option key={prv.PRV_ID} value={prv.PRV_NOMBRE_COMERCIAL}>
                  {prv.PRV_NOMBRE_COMERCIAL}
                </option>
              ))}
            </select>
          </div>
        ) : (
          row.PROVEEDOR
        )
      },
    {
      name: 'Categoria',
      selector: row => row.EQP_CATEGORIA,
      sortable: true,
      width: '110px',
      wrap: true, // Ajuste automático del contenido

      cell: (row) => editRowId === row.EQP_ID ? (
        <input
          type="text"
          name="EQP_CATEGORIA"
          value={editFormData.EQP_CATEGORIA}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
          style={{ minHeight: '40px', resize: 'vertical' }}

        />
      ) : row.EQP_CATEGORIA
    },
    {
      name: 'Precio Unitario',
      selector: row => row.EQP_PRECIO_UNITARIO,
      sortable: true,
      width: '150px',
      wrap: true, // Ajuste automático del contenido

      cell: (row) => editRowId === row.EQP_ID ? (
        <input
          type="text"
          name="EQP_PRECIO_UNITARIO"
          value={editFormData.EQP_PRECIO_UNITARIO}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
          style={{ minHeight: '40px', resize: 'vertical' }}
        />
      ) : row.EQP_PRECIO_UNITARIO
    },
  ];

  const filteredItems = equipos.filter(
    item => (typeof item.EQP_ID === 'string' && item.EQP_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PROVEEDOR === 'string' && item.PROVEEDOR.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.EQP_EQUIPO === 'string' && item.EQP_EQUIPO.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.EQP_CATEGORIA === 'string' && item.EQP_CATEGORIA.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.EQP_PRECIO_UNITARIO === 'string' && item.EQP_PRECIO_UNITARIO.toLowerCase()?.includes(filterText.toLowerCase()))
);

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredItems);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'equipos.csv');
    tempLink.click();
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
                Catálogo Equipos
              </p>
              <hr className="w-full mb-4 border-black border-1" />
            </header>
              <section className="flex justify-center">
              <div className="w-5/6">
  
                  <div className="flex justify-end mb-4">
                    <ModalEquipos 
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      onSave={handleSaveEquipo} /> 
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
                    columns={columnsEquipos}
                    data={filteredItems}
                    pagination
                    // theme="custom"
                    highlightOnHover
                    striped
                    noDataComponent="No hay registros para mostrar" 
                    paginationPerPage={20} // 20 filas por defecto
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
