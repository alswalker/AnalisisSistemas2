"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Para redirigir
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

export default function AntecedentesCliente({ ticketNumber }) {
  const [antecedentes, setAntecedente] = useState([]);
  const [filterText, setFilterText] = useState('');
  const router = useRouter(); // Hook de Next.js para redirección
  const navigate = useNavigate(); 

  useEffect(() => {
    consultaAntecedentes(ticketNumber);
  }, [ticketNumber]);

  const consultaAntecedentes = async (ticketNumber) => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/ticketantecedentes?ticket=${ticketNumber}`);
      const data = await response.json();
      setAntecedente(data);
    } catch (error) {
      console.error('Error fetching antecedentes:', error);
    }
  };

  const handleTicketClick = (ticketNumber) => {
    // Redirigir a la página de atención del ticket
    navigate(`/atencionticket?ticket=${ticketNumber}`);
    window.location.reload();
  };

  const filteredItems = antecedentes.filter(
    item => (typeof item.TICKET === 'string' && item.TICKET.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.FECHA_CREA === 'string' && item.FECHA_CREA.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.TECNICO === 'string' && item.TECNICO.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.CLIENTE === 'string' && item.CLIENTE.toLowerCase()?.includes(filterText.toLowerCase())) ||
            (typeof item.DESCRIPCION === 'string' && item.DESCRIPCION.toLowerCase()?.includes(filterText.toLowerCase()))
  );

  const columnsAntecedentes = [
    {
      name: 'Ticket',
      selector: row => (
        <a
          href="#"
          onClick={() => handleTicketClick(row.TICKET)}
          className="text-blue-600 hover:underline"
        >
          {row.TICKET}
        </a>
      ),
      sortable: true,
      width: '150px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Fecha / Hora',
      selector: row => row.FECHA_CREA,
      sortable: true,
      width: '200px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Técnico',
      selector: row => row.TECNICO,
      sortable: true,
      width: '200px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Cliente',
      selector: row => row.CLIENTE,
      sortable: true,
      width: '200px',
      wrap: true, // Ajuste automático del contenido
    },
    {
      name: 'Descripción',
      selector: row => row.DESCRIPCION,
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
    const clientName = antecedentes.length > 0 ? antecedentes[0].CLIENTE : 'desconocido';
    link.setAttribute('download', `antecedentes_${clientName}.csv`);
    link.click();
  };

  const clientName = antecedentes.length > 0 ? antecedentes[0].CLIENTE : 'desconocido';

  return (
    <main className="flex flex-1 p-4 md:p-10">
      <div className="flex-1 p-4 space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865]">Historial de tickets del cliente: {clientName}</h4>
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
              columns={columnsAntecedentes}
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
    </main>
  );
}
