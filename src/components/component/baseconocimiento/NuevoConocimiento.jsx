import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, TicketIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import { useAuth } from '@/components/AuthContext';
import DataTable from 'react-data-table-component'; // Asegúrate de tener instalado react-data-table-component


export default function NuevoConocimiento() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [solucion, setSolucion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [refticket, setRefTicket] = useState(null); // Estado para guardar ticket de referencia
  const [showTable, setShowTable] = useState(false); // Estado para mostrar/ocultar la tabla
  const [tickets, setTickets] = useState([]); // Estado para almacenar los tickets de la API
  const navigate = useNavigate();
  const [serviciocombo, setserviciocombo] = useState([]);
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
      comboServicios();
  }, []);

  const comboServicios = async () => {
      try {
          const response = await fetch(`${getIpApis()}/helpers/combos/servicios`, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // console.log('Fetched serviciocombo:', data); // Log para depuración
          setserviciocombo(data);
      } catch (error) {
          console.error('Error fetching serviciocombo:', error);
          setserviciocombo([]); 
      }
  };

  // Función para obtener los tickets desde la API
  const obtenerTickets = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/ticketsconocimiento`);
      const data = await response.json();
      setTickets(data); // Guardamos los tickets en el estado
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const maxCaracteresTitulo = 100;
  const maxCaracteresDescripcion = 300;

  const handleTituloChange = (e) => setTitulo(e.target.value);
  const handleDescripcionChange = (e) => setDescripcion(e.target.value);
  const handleSolucionChange = (e) => setSolucion(e.target.value);

  const handleTicketSelect = (ticket) => {
    setTitulo(ticket.TITULO)
    setDescripcion(ticket.ERROR);
    setSolucion(ticket.SOLUCION);
    setCategoria(ticket.TIPO === 'Software' ? '2' : '1'); // Ajusta según tu lógica de IDs de categorías
    setRefTicket(ticket.TICKET);
    setShowTable(false); // Ocultamos la tabla
  };

  const caracteresRestantesTitulo = maxCaracteresTitulo - titulo.length;
  const caracteresRestantesDescripcion = maxCaracteresDescripcion - (descripcion.length || 0);
  const caracteresRestantesSolucion = maxCaracteresDescripcion - (solucion?.length || 0);

  const validarFormulario = () => {
    const errores = [];

    if (titulo.trim() === '') {
      errores.push('El título no puede estar vacío.');
    }

    if (descripcion.trim() === '') {
      errores.push('La descripción no puede estar vacía.');
    }

    if (solucion.trim() === '') {
      errores.push('La solución no puede estar vacía.');
    }

    if (categoria.trim() === '') {
      errores.push('La categoría no puede estar vacía.');
    }

    return errores;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!titulo || !descripcion || !solucion || !categoria) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
      });
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/insert/conocimiento`;
      const conocimientoData = {
        titulo,
        descripcion,
        categoriaid: categoria,
        solucion,
        autor: user.Username,
        refticket: refticket || null // Si no hay ticket de referencia, enviamos null
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conocimientoData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Conocimiento agregado correctamente!',
        }).then(() => window.location.reload());
      } else {
        throw new Error('Error al guardar el conocimiento');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar el conocimiento',
        text: error.message,
      });
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
      setShowTooltip(false);
  };

  const handleFocus = () => {
      setShowTooltip(false);
  };

  const filteredTickets = tickets.filter(
    ticket =>
      ticket.TICKET.toLowerCase().includes(filterText.toLowerCase()) ||
      ticket.TITULO.toLowerCase().includes(filterText.toLowerCase()) ||
      ticket.FECHA_CREACION.toLowerCase().includes(filterText.toLowerCase()) ||
      ticket.TIPO.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="w-full mb-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865] text-lg">Nuevo Conocimiento</h4>
        </div>
        <hr className="w-full mt-2 border-black border-1" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => { setShowTable(!showTable); obtenerTickets(); }} // Mostrar/ocultar tabla y obtener tickets
              className="bg-[#003865] text-white py-2 px-6 rounded-md hover:bg-[#002845] transition duration-300"
              title="Agregar Ticket de Referencia"
            >
              <TicketIcon className="w-5 h-5" /> 
            </button>
          </div>
          {showTable && (
            <div className="mb-4">
              <div className="flex justify-between mb-4">
                <input
                  type="text"
                  className="w-full p-2 rounded input_field"
                  placeholder="Buscar ticket, título, fecha o categoría..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <DataTable
                columns={[
                  { name: 'Ticket', selector: row => row.TICKET, wrap: true },
                  { name: 'Título', selector: row => row.TITULO, wrap: true },
                  { name: 'Fecha de Creación', selector: row => row.FECHA_CREACION, wrap: true },
                  { name: 'Categoria', selector: row => row.TIPO, wrap: true },
                  {
                    name: 'Acción',
                    cell: row => (
                      <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleTicketSelect(row)}>
                        Seleccionar
                      </button>
                    ),
                  },
                ]}
              data={filteredTickets}
              pagination
              highlightOnHover
              striped
              paginationPerPage={10} //
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
        )}
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-gray-700 font-medium mb-1 text-sm">Título</label>
            <input
              id="titulo"
              value={titulo}
              onChange={handleTituloChange}
              maxLength={maxCaracteresTitulo}
              placeholder="Ingrese el título del problema"
              className="w-full p-2 border rounded-md text-sm"
            />
            <div className="text-right text-gray-500 text-xs">
              Caracteres disponibles: {caracteresRestantesTitulo}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="categoria" className="block text-gray-700 font-medium mb-1 text-sm">Categoría</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              >
              <option value="">Selecciona la categoría</option>
                {serviciocombo.map((srv) => (
                <option key={srv.SRV_ID} value={srv.SRV_ID}>
                {srv.SRV_SERVICIO}
                </option>
              ))}
            </select>

              {/* Tooltip flotante */}
              {showTooltip && (
                                        <div className="absolute top-25 left-5 mr-6 p-2 w-64 bg-gray-200 text-sm rounded shadow-lg z-10 transform translate-x-full">
                                            <strong>Software:</strong> Incidentes relacionados con el funcionamiento o instalación de aplicaciones.<br/>
                                            <strong>Hardware:</strong> Incidentes relacionados con componentes físicos del equipo, como teclado, monitor, etc.
                                        </div>
                                    )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="descripcion" className="block text-gray-700 font-medium mb-1 text-sm">Problema</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={handleDescripcionChange}
                maxLength={maxCaracteresDescripcion}
                placeholder="Ingrese la descripción del problema"
                rows={4}
                className="w-full p-2 border rounded-md text-sm"
              />
              <div className="text-right text-gray-500 text-xs">
                Caracteres disponibles: {caracteresRestantesDescripcion}
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="solucion" className="block text-gray-700 font-medium mb-1 text-sm">Solución</label>
              <textarea
                id="solucion"
                value={solucion}
                onChange={handleSolucionChange}
                maxLength={maxCaracteresDescripcion}
                placeholder="Ingrese la solución del problema"
                rows={4}
                className="w-full p-2 border rounded-md text-sm"
              />
              <div className="text-right text-gray-500 text-xs">
                Caracteres disponibles: {caracteresRestantesSolucion}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-2)}
            className="border rounded-md py-2 px-4 text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#003865] text-white py-2 px-6 rounded-md hover:bg-[#002845] transition duration-300"
            title="Agregar"
          >
            <BookOpenIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
