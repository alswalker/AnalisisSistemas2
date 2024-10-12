import { useEffect, useState } from 'react';
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthContext';
import { UsersIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

export default function ReasignarTicket({ ticketNumber }) {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null); 
  const [descripcion, setDescripcion] = useState('');
  const [tecnicos, setTecnicos] = useState([]); 
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [ticketData, setTicketData] = useState(null); 

  const maxCaracteres = 2000;

  const comboTecnicos = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/tecnicos?ticket=${ticketNumber}`);
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
  }, [ticketNumber]);

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const caracteresRestantes = maxCaracteres - descripcion.length;

  const handleTecnicoChange = (e) => {
    const tecnicoId = e.target.value;
    const tecnico = tecnicos.find(tec => tec.USR_ID === parseInt(tecnicoId));
    setTecnicoSeleccionado(tecnico); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const camposVacios = [];

    if (!tecnicoSeleccionado) camposVacios.push('Técnico');
    if (!descripcion) camposVacios.push('Descripción');

    if (camposVacios.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
      });
      return;
    }

    Swal.fire({
      title: `¿Estás seguro de reasignar el ticket ${ticketNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reasignar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${getIpApis()}/helpers/update/reasginartecnico`;

          const reasignarData = {
            usuario: user.Username,
            llaveTicket: ticketNumber,
            tecnico: tecnicoSeleccionado.USR_ID,
            descripcion: descripcion,
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reasignarData),
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: '¡Ticket reasignado correctamente!',
            }).then(async () => {
              // 1. Obtener el correo del técnico seleccionado
              const tecnicoCorreo = tecnicoSeleccionado.USR_CORREO;

              // 2. Enviar correo al técnico
              await fetch(`${getIpApis()}/helpers/email/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  Para: tecnicoCorreo,
                  Asunto: 'REASIGNACION DE TICKET',
                  Ticket: ticketNumber,
                  Tipo: 'Regresa ticket',
                  Titulo: ticketData.TITULO,
                  Descripcion: `${descripcion}, Att. ${ticketData.TECNICO}`,
                }),
              });

              navigate('/dashboard');
            });
          } else {
            throw new Error('Error al reasignar el ticket');
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error al reasignar',
            text: error.message,
          });
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:max-w-md">
      <div className="w-full"> 
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865] text-lg">
            Reasignar técnico del ticket: {ticketNumber}
          </h4>
        </div>
        <hr className="w-full mb-4 border-black border-1" />
      </div>
      <form className="space-y-4 w-full" onSubmit={handleSubmit}>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Técnicos disponibles
            </label>
            <select
              value={tecnicoSeleccionado?.USR_ID || ''}
              onChange={handleTecnicoChange}
              className="w-full p-1 border rounded-md text-sm"
            >
              <option value="">Seleccionar un técnico</option>
              {tecnicos.length === 0 ? (
                  <option value="" disabled>No hay ningún técnico que aplique para reasignar</option>
              ) : (
                tecnicos.map((tec) => (
                  <option key={tec.USR_ID} value={tec.USR_ID}>
                    {tec.TECNICO}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Motivo de la reasignación
            </label>
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              rows="4"
              maxLength={maxCaracteres}
              value={descripcion}
              onChange={handleDescripcionChange}
              placeholder="Escribe la descripción de la acción..."
            ></textarea>
            <div className="text-right text-gray-500 text-xs">
              Caracteres disponibles: {caracteresRestantes}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#003865] text-white py-2 px-4 rounded"
              disabled={descripcion.length === 0}
              title="Reasignar"
            >
              <UsersIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
