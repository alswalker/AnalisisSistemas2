"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import ModalTipoAccion from "@/components/component/catálogos/modTipoAccion";
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Papa from 'papaparse';
import { useAuth } from '@/components/AuthContext';
import {
  DocumentCheckIcon,
  MinusCircleIcon,
  PencilIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

export default function TipoAccion() {
  const { user } = useAuth();
  const [tiposAccion, setTiposAccion] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    TAC_ID: '',
    TAC_TIPO_ACCION: '',
    ESTATUS: 1
  });

  useEffect(() => {
    consultaTipoAccion();
  }, []);

  const consultaTipoAccion = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/tipoaccion`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTiposAccion(data);
    } catch (error) {
      console.error('Error fetching tipos de acción:', error);
      setTiposAccion([]);
    }
  };

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/tipoaccion');
  }, []);

  const handleEditClick = (tipoAccion) => {
    setEditRowId(tipoAccion.TAC_ID);
    setEditFormData({ ...tipoAccion });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = async () => {
    try {
      const { TAC_TIPO_ACCION } = editFormData;
      const camposVacios = [];

      if (!TAC_TIPO_ACCION) camposVacios.push('Tipo de Acción');

      if (camposVacios.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Campos obligatorios',
          text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
        });
        return;
      }

      const url = `${getIpApis()}/helpers/update/tipoaccion`;
      const tipoAccionData = {
        TipoAccion: TAC_TIPO_ACCION,
        idTipoAccion: editFormData.TAC_ID
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tipoAccionData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro actualizado correctamente!',
        }).then(() => {
          consultaTipoAccion();
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

  const handleBaja = async (idTipoAccion) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_TIPO_ACCION&columna=TAC_ID&id=${idTipoAccion}&estatus=0`,
        { method: 'POST' }
      );

      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaTipoAccion();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el registro',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (idTipoAccion, nombre) => {
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
        handleBaja(idTipoAccion);
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaTipoAccion();
  };

  const handleSaveTipoAccion = () => {
    handleCloseModal();
    consultaTipoAccion();
  };

  const columnsTipoAccion = [
    {
      name: 'Acciones',
      cell: (row) => (
        <>
          {editRowId === row.TAC_ID ? (
            <>
              <button
                className="bg-green-700 text-white py-1 px-3 rounded mr-2 flex items-center"
                onClick={handleUpdateClick}
                title="Actualizar"
              >
                <DocumentCheckIcon className="h-5 w-5" />
              </button>
              <button
                className="bg-red-700 text-white py-1 px-3 rounded flex items-center"
                onClick={handleCancelClick}
                title="Cancelar"
              >
                <XCircleIcon className="h-5 w-5" />
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
                onClick={() => deseaDarBaja(row.TAC_ID, row.TAC_TIPO_ACCION)}
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
      selector: row => row.TAC_ID,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Tipo de Acción',
      selector: row => row.TAC_TIPO_ACCION,
      sortable: true,
      width: '250px',
      cell: (row) => editRowId === row.TAC_ID ? (
        <input
          type="text"
          name="TAC_TIPO_ACCION"
          value={editFormData.TAC_TIPO_ACCION}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
        />
      ) : row.TAC_TIPO_ACCION
    }
  ];

  const filteredItems = tiposAccion.filter(
    item => (typeof item.TAC_ID === 'string' && item.TAC_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.TAC_TIPO_ACCION === 'string' && item.TAC_TIPO_ACCION.toLowerCase()?.includes(filterText.toLowerCase()))
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
    link.setAttribute('download', 'tipoaccion.csv');
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
            Catálogo Tipo de Acción
          </p>
          <hr className="w-full mb-4 border-black border-1" />
        </header>
        <section className="flex justify-center">
          <div className="w-5/6">
            <div className="flex justify-end mb-4">
              <ModalTipoAccion 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTipoAccion}
              />
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
              columns={columnsTipoAccion}
              data={filteredItems}
              pagination
              highlightOnHover
              striped
              paginationPerPage={20}
              noDataComponent="No hay registros para mostrar"
              paginationComponentOptions={{
                rowsPerPageText: 'Registros por página:',
                rangeSeparatorText: 'de',
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
