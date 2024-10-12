import { useState, useEffect } from 'react';
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';
import { WrenchIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom'; 

export default function NuevoMantenimiento({ ticketNumber }) {
  const [descripcion, setDescripcion] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [precioMinimo, setPrecioMinimo] = useState('');
  const [precioMaximo, setPrecioMaximo] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const navigate = useNavigate();


  // Nuevos estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [equiposPorPagina, setEquiposPorPagina] = useState(5);

  const maxCaracteres = 300;

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch(`${getIpApis()}/helpers/combos/equipos`);
        if (!response.ok) {
          throw new Error('Error al cargar los equipos');
        }
        const data = await response.json();
        const equiposFormateados = data.map(equipo => ({
          id: equipo.ID,
          nombre: equipo.EQUIPO,
          categoria: equipo.CATEGORIA,
          precio: equipo.PRECIO
        }));
        setEquipos(equiposFormateados);
        setEquiposFiltrados(equiposFormateados);
      } catch (error) {
        console.error('Error al cargar los equipos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los equipos. Por favor, intenta de nuevo más tarde.',
        });
      }
    };

    fetchEquipos();
  }, []);

  useEffect(() => {
    const filtrarEquipos = () => {
      return equipos.filter(equipo => 
        equipo.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        (categoriaFiltro === '' || equipo.categoria === categoriaFiltro) &&
        (precioMinimo === '' || equipo.precio >= parseFloat(precioMinimo)) &&
        (precioMaximo === '' || equipo.precio <= parseFloat(precioMaximo))
      );
    };

    setEquiposFiltrados(filtrarEquipos());
    setPaginaActual(1); // Resetear a la primera página cuando se aplican filtros
  }, [busqueda, categoriaFiltro, precioMinimo, precioMaximo, equipos]);

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const caracteresRestantes = maxCaracteres - descripcion.length;

  const seleccionarEquipo = (equipo) => {
    setEquipoSeleccionado(equipo);
  };

  const total = equipoSeleccionado ? equipoSeleccionado.precio * cantidad : 0;

  const validarFormulario = () => {
    const errores = [];

    if (!equipoSeleccionado) {
      errores.push('Debes seleccionar un equipo.');
    }

    if (cantidad <= 0) {
      errores.push('La cantidad debe ser mayor que cero.');
    }

    if (descripcion.trim() === '') {
      errores.push('La descripción no puede estar vacía.');
    }

    return errores;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errores = validarFormulario();

    if (errores.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        html: errores.map(error => `- ${error}`).join('<br>'),
      });
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/insert/mantenimiento`;

      const mantenimientoData = {
        ticket: ticketNumber,
        descripcion: descripcion,
        ctdrepuestos: cantidad,
        montototal: total,
        equipo: equipoSeleccionado.id,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mantenimientoData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Mantenimiento agregado correctamente!',
        }).then(function () {
          // Limpiar el formulario
          setDescripcion('');
          setEquipoSeleccionado(null);
          setCantidad(1);
          setBusqueda('');
          // window.location.reload();
          navigate('/histmant');
        });
      } else {
        throw new Error('Error al guardar el mantenimiento');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar mantenimiento',
        text: error.message,
      });
    }
  };

  const categorias = [...new Set(equipos.map(equipo => equipo.categoria))];

  const indexOfLastEquipo = paginaActual * equiposPorPagina;
  const indexOfFirstEquipo = indexOfLastEquipo - equiposPorPagina;
  const equiposPaginados = equiposFiltrados.slice(indexOfFirstEquipo, indexOfLastEquipo);

  const totalPaginas = Math.ceil(equiposFiltrados.length / equiposPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="w-full mb-6"> 
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865] text-lg">
            Mantenimiento para el ticket: {ticketNumber}
          </h4>
        </div>
        <hr className="w-full mt-2 border-black border-1" />
      </div>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="busquedaEquipo" className="block text-gray-700 font-medium mb-1 text-sm">
                Buscar por nombre
              </label>
              <div className="relative">
                <input
                  id="busquedaEquipo"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm pr-8"
                  placeholder="Buscar equipo..."
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="categoriaFiltro" className="block text-gray-700 font-medium mb-1 text-sm">
                Filtrar por categoría
              </label>
              <select
                id="categoriaFiltro"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Rango de precio
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={precioMinimo}
                  onChange={(e) => setPrecioMinimo(e.target.value)}
                  className="w-1/2 p-2 border rounded-md text-sm"
                  placeholder="Mín"
                />
                <input
                  type="number"
                  value={precioMaximo}
                  onChange={(e) => setPrecioMaximo(e.target.value)}
                  className="w-1/2 p-2 border rounded-md text-sm"
                  placeholder="Máx"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Repuesto</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {equiposPaginados.map((equipo) => (
                  <tr key={equipo.id} className={equipoSeleccionado && equipoSeleccionado.id === equipo.id ? 'bg-blue-100' : ''}>
                    <td className="py-2 px-4 text-sm">{equipo.nombre}</td>
                    <td className="py-2 px-4 text-sm">{equipo.categoria}</td>
                    <td className="py-2 px-4 text-sm">Q{equipo.precio.toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm">
                      <button
                        type="button"
                        onClick={() => seleccionarEquipo(equipo)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Mostrar</span>
              <select
                value={equiposPorPagina}
                onChange={(e) => setEquiposPorPagina(Number(e.target.value))}
                className="border rounded-md text-sm p-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-gray-700">por página</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-1 border rounded-md disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="p-1 border rounded-md disabled:opacity-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {equipoSeleccionado && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h5 className="font-semibold mb-2">Equipo seleccionado:</h5>
              <p className="text-sm"><span className="font-medium">Nombre:</span> {equipoSeleccionado.nombre}</p>
              <p className="text-sm"><span className="font-medium">Categoría:</span> {equipoSeleccionado.categoria}</p>
              <p className="text-sm"><span className="font-medium">Precio unitario:</span> Q{equipoSeleccionado.precio.toFixed(2)}</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cantidad" className="block text-gray-700 font-medium mb-1 text-sm">
                Cantidad
              </label>
              <input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value)))}
                className="w-full p-2 border rounded-md text-sm"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-gray-700 font-medium mb-1 text-sm">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="w-full p-2 border rounded-md text-sm"
                rows={4}
                maxLength={maxCaracteres}
                value={descripcion}
                onChange={handleDescripcionChange}
                placeholder="Escribe la descripción del mantenimiento..."
              ></textarea>
              <div className="text-right text-gray-500 text-xs">
                Caracteres disponibles: {caracteresRestantes}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-2xl font-bold">Total: Q{total.toFixed(2)}</p>
            <button
              type="submit"
              className="bg-[#003865] text-white py-2 px-6 rounded-md flex items-center space-x-2 hover:bg-[#002845] transition duration-300"
              title="Agregar Mantenimiento"
            >
              <WrenchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}