"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import {ArrowDownTrayIcon} from '@heroicons/react/24/solid';

export default function AccionesTicket({ ticketNumber }) {
  const [encuesta, setEncuesta] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    consultaEncuesta(ticketNumber);
  }, []);

  const consultaEncuesta = async (ticketNumber) => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/encuestaticket?ticket=${ticketNumber}`);
      const data = await response.json();
      setEncuesta(data);
    } catch (error) {
      console.error('Error fetching encuesta:', error);
    }
  };

  const filteredItems = encuesta.filter(
      item => (typeof item.TICKET === 'string' && item.TICKET.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.FECHA === 'string' && item.FECHA.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.TECNICO === 'string' && item.TECNICO.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.ATENCION === 'string' && item.ATENCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.TIEMPO === 'string' && item.TIEMPO.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.SOLUCION === 'string' && item.SOLUCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.COMENTARIO === 'string' && item.COMENTARIO.toLowerCase()?.includes(filterText.toLowerCase())) 
  );

  const columnsEncuesta = [
    // {
    //   name: 'Ticket',
    //   selector: row => row.TICKET,
    //   sortable: true,
    //   width: '200px',
    //   wrap: true, // Ajuste automático del contenido
    // },
    {
      name: 'Técnico',
      selector: row => row.TECNICO,
      sortable: true,
      width: '150px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Fecha',
      selector: row => row.FECHA,
      sortable: true,
      width: '150px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Atención brindada',
      selector: row => row.ATENCION,
      sortable: true,
      width: '170px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Tiempo de atención',
      selector: row => row.TIEMPO,
      sortable: true,
      width: '170px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Solución brindada',
      selector: row => row.SOLUCION,
      sortable: true,
      width: '170px',
      wrap: true, // Ajuste automático del contenido
    },
    {
        name: 'Comentario',
        selector: row => row.COMENTARIO,
        sortable: true,
        width: '200px',
        wrap: true, // Ajuste automático del contenido
      },
  ];

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `encuesta_${ticketNumber}.csv`);
    link.click();
  };


    return (
      <main className="flex flex-1 p-4 md:p-10">
        <div className="flex-1 p-4 space-y-8">

        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865]">Encuesta del ticket: { ticketNumber }</h4>
        </div>
        <hr className="w-full mb-4 border-black border-1" />
        <section className="flex justify-center">
            <div className="w-5/6">
                <div className="flex justify-end mb-4">
                </div>
                <div className="flex justify-between mb-4">
                  <input
                    type="text"
                    className="w-full p-2 rounded input_field"
                    placeholder="Buscar..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                  />
                  <button
                                onClick={exportToCSV}
                                className="bg-yellow-500 text-black py-2 px-4 rounded ml-4 flex items-center"
                                title="Exportar CSV"
                            >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                </div>
                <DataTable
                  className="custom-datatable"
                  columns={columnsEncuesta}
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
      </main>
    );
  }
  