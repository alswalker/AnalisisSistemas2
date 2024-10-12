"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { getIpApis } from '../configip';
import Papa from 'papaparse'; // Importa papaparse
import {ArrowDownTrayIcon , EyeIcon, BookOpenIcon} from '@heroicons/react/24/solid';


export default function ConsultaConocimiento({ setSelectedRecord, setActiveComponent }) {
    const [conocimiento, setConocimiento] = useState([]);
    const [filterText, setFilterText] = useState('');

    const actualizaVisita = async (conId) => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/update/visitascon?id=${conId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ CON_ID: conId }), // Envía el CON_ID en el cuerpo de la solicitud
            });

            if (response.ok) {
                console.log('Se actualizó visita:', conId);
            } else {
                console.error('Error en la respuesta de la API');
            }
        } catch (error) {
            console.error('Error al enviar CON_ID a la API:', error);
        }
    };

    const handleConsultClick = (record) => {
        setSelectedRecord(record); // Guarda el registro seleccionado
        setActiveComponent('detalle'); // Cambia al componente de detalle
        actualizaVisita(record.CON_ID); // Envía el CON_ID a la API
    };

    useEffect(() => {
        consultaConocimiento();
      }, []);

      const consultaConocimiento = async () => {
        try {
          const response = await fetch(`${getIpApis()}/helpers/read/conocimiento`);
          const data = await response.json();
          setConocimiento(data);
        } catch (error) {
          console.error('Error fetching conocimiento:', error);
        }
      };
    
      const filteredItems = conocimiento.filter(
          item => (typeof item.CON_ID === 'string' && item.CON_ID.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.CON_VISITAS === 'string' && item.CON_VISITAS.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.CON_TITULO === 'string' && item.CON_TITULO.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.CON_DESCRIPCION === 'string' && item.CON_DESCRIPCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.CON_SOLUCION === 'string' && item.CON_SOLUCION.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.CATEGORIA === 'string' && item.CATEGORIA.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.FECHA_CREACION === 'string' && item.FECHA_CREACION.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.ESTATUS === 'string' && item.ESTATUS.toLowerCase()?.includes(filterText.toLowerCase())) ||
                  (typeof item.AUTOR === 'string' && item.AUTOR.toLowerCase()?.includes(filterText.toLowerCase()))
    
      );
    
      const columnsConocimiento = [

        {
            name: 'Visitas',
            selector: row => (
                <div className="flex items-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    {row.CON_VISITAS}
                </div>
            ),
            sortable: true,
            width: '100px',
            wrap: true,
        },
        {
          name: 'Título',
          selector: row => row.CON_TITULO,
          sortable: true,
          width: '200px',
          wrap: true, // Ajuste automático del contenido
        },
        {
            name: 'Problema',
            selector: row => row.CON_DESCRIPCION,
            sortable: true,
            width: '400px',
            wrap: true, // Ajuste automático del contenido
        },
        {
            name: 'Visitar',
            cell: row => (
                <button
                    className="bg-[#003865] text-white py-2 px-6 rounded-md hover:bg-[#002845] transition duration-300"
                    onClick={() => handleConsultClick(row)} // Llama al manejador
                    title="Visitar"
                >
                    <BookOpenIcon className="w-5 h-5" />
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
      ];
    
      const exportToCSV = () => {
        const csv = Papa.unparse(filteredItems);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `conocimientobase.csv`);
        link.click();
      };


    return (
      <main className="flex flex-1 p-4 md:p-10">
        <div className="flex-1 p-4 space-y-8">
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
                  columns={columnsConocimiento}
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
  