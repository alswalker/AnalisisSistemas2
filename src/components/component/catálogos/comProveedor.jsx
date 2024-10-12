"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import ModalProveedores from "@/components/component/catálogos/modProveedor";
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




export default function Proveedor() {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    PRV_ID: '',
    PRV_NOMBRE_COMERCIAL: '',
    PRV_RAZON_SOCIAL: '',
    PRV_DIRECCION: '',
    PRV_NIT: '',
    PRV_TELEFONO: '',
    PRV_CORREO: '',
    DEP_NOMBRE: '',
    MUN_NOMBRE: ''
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    consultaProveedores();
    fetchDepartamentos();
  }, []);

  
  useEffect(() => {
    sessionStorage.setItem('currentPath', '/proveedor');
  }, []);

  const consultaProveedores = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/proveedores`);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/departamento`);
      const data = await response.json();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  };

  const handleEditClick = async (provee) => {
    setEditRowId(provee.PRV_ID);

    // Cargar municipios del departamento seleccionado
    const depaId = provee.DEP_NOMBRE.split('-')[0]; // Asume que DEP_NOMBRE contiene el ID seguido por el nombre
    const response = await fetch(`${getIpApis()}/helpers/combos/municipio?depaid=${depaId}`);
    const data = await response.json();
    setMunicipios(data);

    setEditFormData({
      ...provee,
      DEP_NOMBRE: provee.DEP_NOMBRE,
      MUN_NOMBRE: provee.MUN_NOMBRE
    });
  };

  const handleDepartamentoChangeEdit = async (event) => {
    const depaId = event.target.value.split('-')[0];
    setEditFormData((prev) => ({ ...prev, DEP_NOMBRE: event.target.value }));

    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/municipio?depaid=${depaId}`);
      const data = await response.json();
      setMunicipios(data);
      setEditFormData((prev) => ({ ...prev, MUN_NOMBRE: '' })); // Resetear el municipio
    } catch (error) {
      console.error('Error al cargar municipios:', error);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = async () => {
    try {
      const { PRV_NOMBRE_COMERCIAL, PRV_RAZON_SOCIAL, PRV_DIRECCION, PRV_NIT, PRV_TELEFONO, PRV_CORREO } = editFormData;

      const proveedorData = {
        nombrecomercial: PRV_NOMBRE_COMERCIAL,
        razonsocial: PRV_RAZON_SOCIAL,
        direccion: PRV_DIRECCION,
        nit: PRV_NIT,
        telefono: PRV_TELEFONO,
        correo: PRV_CORREO,
        depaid: editFormData.DEP_NOMBRE.split('-')[0],
        muniid: editFormData.MUN_NOMBRE.split('-')[0],
        idProveedor: editFormData.PRV_ID
      };
      
      console.log(proveedorData)

      const response = await fetch(`${getIpApis()}/helpers/update/proveedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });

      if (response.ok) {
        Swal.fire('¡Registro actualizado correctamente!', '', 'success').then(() => {
          consultaProveedores();
          setEditRowId(null);
        });
      } else {
        throw new Error('Error al actualizar el registro');
      }
    } catch (error) {
      Swal.fire('Error al actualizar registro', error.message, 'error');
    }
  };

  
  const handleCancelClick = () => {
    setEditRowId(null);
  };
  
  const handleBaja = async (proveedorId) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_PROVEEDOR&columna=PRV_ID&id=${proveedorId}&estatus=0`, 
        { method: 'POST' }
      );
      
      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaProveedores();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el registro',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (proveedorId, nombre) => {
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
        handleBaja(proveedorId);
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaProveedores();
  };

  const handleSaveProveedor = () => {
    consultaProveedores();
    handleCloseModal();
  };

  const columnsProveedores = [
    
    {
        name: 'Acciones',
        cell: (row) => (
            <>
                {editRowId === row.PRV_ID ? (
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
                            onClick={() => deseaDarBaja(row.PRV_ID, row.PRV_NOMBRE_COMERCIAL)}
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
      selector: row => row.PRV_ID,
      sortable: true,
      width: '100px',
      wrap: true, // Ajuste automático del contenido

    },
    {
         name: 'Nombre Comercial',
        selector: row => row.PRV_NOMBRE_COMERCIAL, 
        sortable: true,
        width: '150px',
        wrap: true, // Ajuste automático del contenido

         cell: (row) => editRowId === row.PRV_ID ? (
            <input
                type="text"
                name="PRV_NOMBRE_COMERCIAL" 
                value={editFormData.PRV_NOMBRE_COMERCIAL} 
                onChange={handleEditFormChange}
                className="w-full p-2 rounded bg-[#003865] text-white"
                style={{ minHeight: '40px', resize: 'vertical' }}

            />
        ) : row.PRV_NOMBRE_COMERCIAL 
    },
    {
        name: 'Razón Social',
      selector: row => row.PRV_RAZON_SOCIAL, 
      sortable: true,
      width: '150px',
      wrap: true, // Ajuste automático del contenido

        cell: (row) => editRowId === row.PRV_ID ? (
          <input
              type="text"
              name="PRV_RAZON_SOCIAL" 
              value={editFormData.PRV_RAZON_SOCIAL} 
              onChange={handleEditFormChange}
              className="w-full p-2 rounded bg-[#003865] text-white"
              style={{ minHeight: '40px', resize: 'vertical' }}

          />
      ) : row.PRV_RAZON_SOCIAL 
  },
    {
      name: 'Dirección',
      selector: row => row.PRV_DIRECCION,
      sortable: true,
      width: '180px',
      wrap: true, // Ajuste automático del contenido

        cell: (row) => editRowId === row.PRV_ID ? (
        <input
          type="text"
          name="PRV_DIRECCION"
          value={editFormData.PRV_DIRECCION}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
          style={{ minHeight: '40px', resize: 'vertical' }}
        />
      ) : row.PRV_DIRECCION
    },
    {
      name: 'Departamento',
      selector: row => row.DEP_NOMBRE,
      sortable: true,
      width: '180px',
      wrap: true, // Ajuste automático del contenido
      cell: (row) => editRowId === row.PRV_ID ? (
        <select
          name="DEP_NOMBRE"
          value={editFormData.DEP_NOMBRE}
          onChange={handleDepartamentoChangeEdit}
          className="w-full p-2 rounded bg-[#003865] text-white"
        >
          <option value="">Selecciona un departamento</option>
          {departamentos.map(dep => (
            <option key={dep.DEP_ID} value={`${dep.DEP_ID}-${dep.DEP_NOMBRE}`}>
              {dep.DEP_NOMBRE}
            </option>
          ))}
        </select>
      ) : row.DEP_NOMBRE
    },
    {
      name: 'Municipio',
      selector: row => row.MUN_NOMBRE,
      sortable: true,
      width: '180px',
      wrap: true, // Ajuste automático del contenido
      cell: (row) => editRowId === row.PRV_ID ? (
        <select
          name="MUN_NOMBRE"
          value={editFormData.MUN_NOMBRE}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
        >
          <option value="">Selecciona un municipio</option>
          {municipios.map(muni => (
            <option key={muni.MUN_ID} value={`${muni.MUN_ID}-${muni.MUN_NOMBRE}`}>
              {muni.MUN_NOMBRE}
            </option>
          ))}
        </select>
      ) : row.MUN_NOMBRE
    },
    {
        name: 'Nit',
        selector: row => row.PRV_NIT,
        sortable: true,
        width: '110px',
        wrap: true, // Ajuste automático del contenido

        cell: (row) => editRowId === row.PRV_ID ? (
          <input
            type="text"
            name="PRV_NIT"
            value={editFormData.PRV_NIT}
            onChange={handleEditFormChange}
            className="w-full p-2 rounded bg-[#003865] text-white"
            style={{ minHeight: '40px', resize: 'vertical' }}

          />
        ) : row.PRV_NIT
      },
      {
        name: 'Telefono',
        selector: row => row.PRV_TELEFONO,
        sortable: true,
        width: '150px',
        wrap: true, // Ajuste automático del contenido

        cell: (row) => editRowId === row.PRV_ID ? (
          <input
            type="text"
            name="PRV_TELEFONO"
            value={editFormData.PRV_TELEFONO}
            onChange={handleEditFormChange}
            className="w-full p-2 rounded bg-[#003865] text-white"
            style={{ minHeight: '40px', resize: 'vertical' }}

          />
        ) : row.PRV_TELEFONO
      },
    
      {
        name: 'Correo',
        selector: row => row.PRV_CORREO, // Cambia el nombre del campo a cheques
        sortable: true,
        width: '230px',
        wrap: true, // Ajuste automático del contenido

        cell: (row) => editRowId === row.PRV_ID ? (
          <input
            type="text"
            name="PRV_CORREO"
            value={editFormData.PRV_CORREO}
            onChange={handleEditFormChange}
            className="w-full p-2 rounded bg-[#003865] text-white"
            style={{ minHeight: '40px', resize: 'vertical' }}

          />
        ) : row.PRV_CORREO
    },
    
  ];

const filteredItems = proveedores.filter(
    item => (typeof item.PRV_ID === 'string' && item.PRV_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_NOMBRE_COMERCIAL === 'string' && item.PRV_NOMBRE_COMERCIAL.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_RAZON_SOCIAL === 'string' && item.PRV_RAZON_SOCIAL.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_DIRECCION === 'string' && item.PRV_DIRECCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_NIT === 'string' && item.PRV_NIT.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_TELEFONO === 'string' && item.PRV_TELEFONO.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.PRV_CORREO === 'string' && item.PRV_CORREO.toLowerCase()?.includes(filterText.toLowerCase()))
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
    link.setAttribute('download', 'proveedores.csv');
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
              Catálogo Proveedores
            </p>
            <hr className="w-full mb-4 border-black border-1" />
          </header>
            <section className="flex justify-center">
            <div className="w-5/6">

                <div className="flex justify-end mb-4">
                  <ModalProveedores 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveProveedor} /> 
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
                  columns={columnsProveedores}
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
