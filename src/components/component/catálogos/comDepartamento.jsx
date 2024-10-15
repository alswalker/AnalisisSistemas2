"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Navbar } from "@/components/component/comNavbar";
import ModalDepartamento from "@/components/component/catálogos/modDepartamento";
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
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

export default function Departamento() {
  const { user } = useAuth();
  const [departamentos, setDepartamentos] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    DEP_ID: '',
    DEP_NOMBRE: '',
    DEP_JEFE: '',
    DEP_CTD_EMP: '',
    ESTATUS: ''
  });

  useEffect(() => {
    consultaDepartamentos();
  }, []);

  useEffect(() => {
    // Guardar la ruta actual en sessionStorage
    sessionStorage.setItem('currentPath', '/departamento');
  }, []);


  const consultaDepartamentos = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/departamentos`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error fetching departamentos:', error);
      setDepartamentos([]);
    }
  };

  const handleEditClick = (departamento) => {
    setEditRowId(departamento.DEP_ID);
    setEditFormData({ ...departamento });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = async () => {
    try {
      const { DEP_NOMBRE, DEP_JEFE, DEP_CTD_EMP } = editFormData;

      if (!DEP_NOMBRE || !DEP_JEFE || !DEP_CTD_EMP) {
        Swal.fire({
          icon: 'error',
          title: 'Campos obligatorios',
          text: 'Por favor completa todos los campos.'
        });
        return;
      }

      const url = `${getIpApis()}/helpers/update/departamentos`;
      const data = {
        Nombre: DEP_NOMBRE,
        Jefe: DEP_JEFE,
        CantidadEmpleados: DEP_CTD_EMP,
        idDepartamento: editFormData.DEP_ID
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro actualizado correctamente!',
        }).then(function () {
          consultaDepartamentos();
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

  const handleBaja = async (idDepartamento) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_DEPARTAMENTO&columna=DEP_ID&id=${idDepartamento}&estatus=0`,
        { method: 'POST' }
      );

      Swal.fire({
        icon: 'success',
        title: '¡Registro dado de baja correctamente!'
      }).then(() => {
        consultaDepartamentos();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el registro',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (idDepartamento, nombre) => {
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
        handleBaja(idDepartamento);
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaDepartamentos();
  };

  const handleSaveDepartamento = () => {
    handleCloseModal();
    consultaDepartamentos();
  };

  const columnsDepartamentos = [
    {
      name: 'Acciones',
      cell: (row) => (
        <>
          {editRowId === row.DEP_ID ? (
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
                onClick={() => deseaDarBaja(row.DEP_ID, row.DEP_NOMBRE)}
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
      selector: row => row.DEP_ID,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Nombre del Departamento',
      selector: row => row.DEP_NOMBRE,
      sortable: true,
      width: '300px',
      cell: (row) => editRowId === row.DEP_ID ? (
        <input
          type="text"
          name="DEP_NOMBRE"
          value={editFormData.DEP_NOMBRE}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
        />
      ) : row.DEP_NOMBRE
    },
    {
      name: 'Jefe de Departamento',
      selector: row => row.DEP_JEFE,
      sortable: true,
      width: '250px',
      cell: (row) => editRowId === row.DEP_ID ? (
        <input
          type="text"
          name="DEP_JEFE"
          value={editFormData.DEP_JEFE}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
        />
      ) : row.DEP_JEFE
    },
    {
      name: 'Cantidad de Empleados',
      selector: row => row.DEP_CTD_EMP,
      sortable: true,
      width: '150px',
      cell: (row) => editRowId === row.DEP_ID ? (
        <input
          type="number"
          name="DEP_CTD_EMP"
          value={editFormData.DEP_CTD_EMP}
          onChange={handleEditFormChange}
          className="w-full p-2 rounded bg-[#003865] text-white"
        />
      ) : row.DEP_CTD_EMP
    },
  ];

  const filteredItems = departamentos.filter(
    item =>
      (typeof item.DEP_ID === 'string' && item.DEP_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
      (typeof item.DEP_NOMBRE === 'string' && item.DEP_NOMBRE.toLowerCase()?.includes(filterText.toLowerCase())) ||
      (typeof item.DEP_JEFE === 'string' && item.DEP_JEFE.toLowerCase()?.includes(filterText.toLowerCase())) ||
      (typeof item.DEP_CTD_EMP === 'string' && item.DEP_CTD_EMP.toLowerCase()?.includes(filterText.toLowerCase()))


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
    link.setAttribute('download', 'departamentos.csv');
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
          Catálogo de Departamentos
        </p>
        <hr className="w-full mb-4 border-black border-1" />
      </header>
      <section className="flex justify-center">
        <div className="w-5/6">
          <div className="flex justify-end mb-4">
            <ModalDepartamento
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveDepartamento}
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
            columns={columnsDepartamentos}
            data={filteredItems}
            pagination
            highlightOnHover
            striped
            paginationPerPage={20}
            noDataComponent="No hay registros para mostrar"
            paginationComponentOptions={{
              rowsPerPageText: 'Registros por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false,
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
