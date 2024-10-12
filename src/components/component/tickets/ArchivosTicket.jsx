"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { getIpApis } from '../configip';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import SubirArchivo from './SubirArchivo';

export default function ArchivosTicket({ ticketNumber }) {
    const [archivos, setArchivos] = useState([]);
    const [filterText, setFilterText] = useState('');
  
    // Descargar archivo
    const handleFileDownload = async (id, nombre) => {
      try {
        const response = await fetch(`${getIpApis()}/helpers/download/archivo?id=${id}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nombre); // Nombre de archivo
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error('Error descargando archivo:', error);
      }
    };
  
    // Consulta inicial para obtener archivos del ticket
    useEffect(() => {
      consultaTicket(ticketNumber);
    }, []);
  
    const consultaTicket = async (ticketNumber) => {
      try {
        const response = await fetch(`${getIpApis()}/helpers/read/archivos?ticket=${ticketNumber}`);
        const data = await response.json();
        setArchivos(data);
      } catch (error) {
        console.error('Error fetching archivos:', error);
      }
    };
  
    const filteredItems = archivos.filter(
      (item) =>
        (typeof item.ARC_ID === 'string' && item.ARC_ID.toLowerCase().includes(filterText.toLowerCase())) ||
        (typeof item.ARC_NOMBRE === 'string' && item.ARC_NOMBRE.toLowerCase().includes(filterText.toLowerCase()))
    );
  
    const columnsArchivos = [
      {
        name: 'Id',
        selector: (row) => row.ARC_ID,
        sortable: true,
        width: '120px',
      },
      {
        name: 'Archivo',
        selector: (row) => row.ARC_NOMBRE,
        sortable: true,
        width: '650px',
      },
      {
        name: 'Acciones',
        cell: (row) => (
          <button
            onClick={() => handleFileDownload(row.ARC_ID, row.ARC_NOMBRE)}
            className="bg-[#003865] text-white py-1 px-3 rounded"
            title="Descargar"
          >
            <ArrowDownTrayIcon className="w-5 h-5"/>
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ];
  
    return (
      <main className="flex flex-1 p-4 md:p-10">
        <div className="flex-1 p-4 space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#003865]">Archivos adjuntos del ticket: {ticketNumber}</h4>
          </div>
          <hr className="w-full mb-4 border-black border-1" />
          <section className="flex justify-center">
            <div className="w-5/6">
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  className="w-full p-2 rounded input_field"
                  placeholder="Buscar..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
  
              <div className="flex items-center justify-center mb-4">
                
                <h4 className="font-bold text-[#003865]">Adjuntar Archivo :</h4>
                              {/* Incluir el componente FileUpload */}
                <SubirArchivo 
                  ticketNumber={ticketNumber} 
                  onUploadComplete={() => consultaTicket(ticketNumber)} // Refrescar lista después de subir
                />
              </div>
            
  
              <DataTable
                className="custom-datatable"
                columns={columnsArchivos}
                data={filteredItems}
                pagination
                highlightOnHover
                striped
                paginationPerPage={20} // 20 filas por defecto
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
      </main>
    );
  }