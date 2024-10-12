import { useEffect, useState } from 'react';
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';
import { UserGroupIcon, EnvelopeOpenIcon, CursorArrowRaysIcon } from '@heroicons/react/24/solid';
import NuevoConocimiento from '@/components/component/baseconocimiento/NuevoConocimiento';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '@/components/AuthContext';

export default function AsignarConocimiento({ ticketNumber }) {
  const [tecnico, setTecnico] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [mostrarCombo, setMostrarCombo] = useState(false);
  const [mostrarComponente, setMostrarComponente] = useState(false);
  const [activeComponent, setActiveComponent] = useState('ticket'); // Controla qué componente mostrar
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null); 
  const [loading, setLoading] = useState(false); // Estado de carga


  const comboTecnicos = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/tecnicosconocimiento`);
      const data = await response.json();
      setTecnicos(data);
    } catch (error) {
      console.error('Error al cargar los técnicos:', error);
    }
  };

  const consultaTickets = async (ticketNumber) => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/tickets?ticket=${ticketNumber}`, {
        cache: 'no-cache' // Controla el caching del fetch
      });      const data = await response.json();
      setTicketData(data[0]); 
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    comboTecnicos();
    if (ticketNumber) {
        setTicketData(null); // Limpia el estado antes de la nueva consulta
        consultaTickets(ticketNumber);
      }
  }, []);

  const handleTecnicoChange = (e) => {
    setTecnico(e.target.value);
  };

  const handleDelegar = () => {
    setMostrarCombo(!mostrarCombo);
  };

  const handleTrabajarPorMiCuenta = () => {
    setMostrarComponente(!mostrarComponente);
  };

  const handleEnviar = async () => {
    if (!tecnico) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona un técnico.',
      });
      return;
    }

    setLoading(true); // Cambiar el estado de carga a true (cursor cargando)

    try {
      await fetch(`${getIpApis()}/helpers/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Para: tecnico,
          Asunto: 'ACTUALIZAR BASE DE CONOCIMIENTO',
          Ticket: ticketNumber,
          Tipo: 'FAQS',
          Titulo: ticketData.TITULO,
          Descripcion: `FAVOR DE ACTUALIZAR BASE DE CONOCIMIENTO COLOCANDO TICKET COMO REFERENCIA ATT. ${ticketData.TECNICO}`,
        }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Técnico Notificado',
      }).then(function () {
        navigate('/dashboard');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: error.message,
      });
    } finally {
      setLoading(false); // Restaurar el cursor al terminar la operación
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h4 className="font-bold text-[#003865] text-lg">Actualizar Base de Conocimiento</h4>
      <hr className="w-full mb-4 border-black border-1" />

      <div className="flex justify-center space-x-4">
        <button 
          onClick={handleDelegar} 
          className="bg-[#003865] text-white p-2 rounded-full"
          title="Delegar a otro técnico"
        >
          <UserGroupIcon className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={handleTrabajarPorMiCuenta} 
          className="bg-[#003865] text-white p-2 rounded-full"
          title="Agregar por mi cuenta"
        >
          <CursorArrowRaysIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {mostrarCombo && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Técnicos disponibles
          </label>
          <select
            value={tecnico}
            onChange={handleTecnicoChange}
            className="w-full p-1 border rounded-md text-sm mb-4"
          >
            <option value="">Seleccionar un técnico</option>
            {tecnicos.length === 0 ? (
              <option value="" disabled>No hay técnicos disponibles</option>
            ) : (
              tecnicos.map((tec, index) => (
                <option key={index} value={tec.USR_CORREO}>
                  {tec.TECNICO}
                </option>
              ))
            )}
          </select>
          <div className={`${loading ? 'cursor-wait' : 'cursor-default'}`}> 
            {/* Aplicar clase de cursor según el estado de carga */}
            <button
                onClick={handleEnviar}
                className="bg-[#003865] text-white py-2 px-4 rounded flex items-center justify-center"
                disabled={loading} // Deshabilitar el botón mientras está cargando
                title="Enviar Petición"
            >
                {loading ? (
                <span>Enviando...</span> // Texto mostrado mientras carga
                ) : (
                <>
                    <EnvelopeOpenIcon className="w-5 h-5" />
                </>
                )}
            </button>
                    </div>
                </div>
            )}

      {mostrarComponente && <NuevoConocimiento />}
    </div>
  );
}
