"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import {ArrowDownTrayIcon} from '@heroicons/react/24/solid';

export default function MantenimientosTicket({ ticketNumber }) {
  const [mantenimiento, setMantenimiento] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    consultaMantenimiento(ticketNumber);
  }, []);

  const consultaMantenimiento = async (ticketNumber) => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/mantenimiento?ticket=${ticketNumber}`);
      const data = await response.json();
      setMantenimiento(data);
    } catch (error) {
      console.error('Error fetching mantenimiento:', error);
    }
  };

  const filteredItems = mantenimiento.filter(
      item => (typeof item.MNT_ID === 'string' && item.MNT_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.EQUIPO === 'string' && item.EQUIPO.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.MNT_CTD_REPUESTOS === 'string' && item.MNT_CTD_REPUESTOS.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.MNT_DESCRIPCION === 'string' && item.MNT_DESCRIPCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
              (typeof item.MTN_MONTO_TOTAL === 'string' && item.MTN_MONTO_TOTAL.toLowerCase()?.includes(filterText.toLowerCase()))
  );

  const columnsMantenimiento = [
    {
      name: 'Id',
      selector: row => row.MNT_ID,
      sortable: true,
      width: '120px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Repuesto',
      selector: row => row.EQUIPO,
      sortable: true,
      width: '220px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Descripción',
      selector: row => row.MNT_DESCRIPCION,
      sortable: true,
      width: '200px',
      wrap: true, // Ajuste automático del contenido
    },
    {
        name: 'Cantidad',
        selector: row => row.MNT_CTD_REPUESTOS,
        sortable: true,
        width: '150px',
        wrap: true, // Ajuste automático del contenido
    },
    {
        name: 'Total',
        selector: row => row.MTN_MONTO_TOTAL,
        sortable: true,
        width: '100px',
        wrap: true, // Ajuste automático del contenido
      },
  ];

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repuestos_${ticketNumber}.csv`);
    link.click();
  };

    return (
      <main className="flex flex-1 p-4 md:p-10">
        <div className="flex-1 p-4 space-y-8">

        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865]">Listado de mantenimientos del ticket: { ticketNumber }</h4>
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
                  columns={columnsMantenimiento}
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
  