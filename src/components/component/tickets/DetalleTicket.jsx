import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { getIpApis } from '@/components/component/configip';
import ModalSolucion from "@/components/component/tickets/SolucionTicket";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 
import ModalEncuesta from '@/components/component/tickets/EncuestaTicket';
import { useAuth } from '@/components/AuthContext';


export default function DetalleTicket({ ticketNumber }) {
  const [ticketData, setTicketData] = useState(null); 
  const rolactual = sessionStorage.getItem('rolusuario');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const navigate = useNavigate();
  const { user  } = useAuth();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (ticketNumber) {
      setTicketData(null); // Limpia el estado antes de la nueva consulta
      consultaTickets(ticketNumber);
    }
  }, [ticketNumber]);

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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-500 text-white';
      case 'Media':
        return 'bg-yellow-500 text-white';
      case 'Baja':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  const getEstatus = (estado) => {
    switch (estado) {
      case 'Resuelto':
        return 'bg-[#003865] text-white';  
      case 'Cerrado':
        return 'bg-green-600 text-white'; 
      case 'Revisión Agente':
        return 'bg-yellow-600 text-white';  
      case 'Revisión Técnico':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    consultaTickets();
  };

  const handleSaveSolucion = () => {
    handleCloseModal();
    consultaTickets();
  };


  const handleRegresaAgente = async () => {
    setIsSending(true); // Cambiar el cursor a "cargando"

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción regresará el ticket al agente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const url = `${getIpApis()}/helpers/update/regresaagente?ticket=${ticketNumber}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Se regresó al agente'
          }).then(async () => {
            // 1. Obtener correos de la API
            const correoResponse = await fetch(`${getIpApis()}/helpers/mail/retornacorreos?ticket=${ticketNumber}`);
            const correos = await correoResponse.json();
            const clienteCorreo = correos[0]?.CLIENTE;

            // 2. Enviar correo al cliente
            await fetch(`${getIpApis()}/helpers/email/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                Para: clienteCorreo,
                Asunto: 'CORREGIR INFORMACIÓN DEL TICKET',
                Ticket: ticketNumber,
                Tipo: 'Regresa ticket',
                Titulo: ticketData.TITULO,
                Descripcion: 'TÉCNICO INDICA QUE DEBE CORREGIR INFORMACIÓN DEL TICKET, REVISAR ACCIONES.'
              })
            });
            setIsSending(false); // Cambiar el cursor a "normal"

            navigate('/dashboard');
          });
        } else {
          throw new Error('Error al regresar ticket');
        }
      } catch (error) {
        setIsSending(false); // Cambiar el cursor a "normal"

        Swal.fire({
          icon: 'error',
          title: 'Error al regresar ticket',
          text: error.message,
        });
      }
    } else {
      setIsSending(false); // Cambiar el cursor a "normal" si la acción es cancelada
    }
  }
  
  const handleRegresaTecnico = async () => {
    // Mostrar una confirmación antes de ejecutar la acción
    setIsSending(true); // Cambiar el cursor a "cargando"

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción regresará el ticket al técnico.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const url = `${getIpApis()}/helpers/update/regresatecnico?ticket=${ticketNumber}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Se regresó al técnico'
          }).then(async () => {
            // 1. Obtener correos de la API
            const correoResponse = await fetch(`${getIpApis()}/helpers/mail/retornacorreos?ticket=${ticketNumber}`);
            const correos = await correoResponse.json();
            const tecnicoCorreo = correos[0]?.TECNICO;

            // 2. Enviar correo al cliente
            await fetch(`${getIpApis()}/helpers/email/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                Para: tecnicoCorreo,
                Asunto: 'CORREGIR SOLUCIÓN / ACCIÓN DEL TICKET',
                Ticket: ticketNumber,
                Tipo: 'Regresa ticket',
                Titulo: ticketData.TITULO,
                Descripcion: 'AGENTE INDICA QUE DEBE CORREGIR LA SOLUCIÓN / ACCIÓN DADA AL TICKET, REVISAR ACCIONES.'
              })
            });
            setIsSending(false); // Cambiar el cursor a "normal"
            navigate('/dashboard');
          });
        } else {
          throw new Error('Error al regresar ticket');
        }
      } catch (error) {
        setIsSending(false); // Cambiar el cursor a "normal"

        Swal.fire({
          icon: 'error',
          title: 'Error al regresar ticket',
          text: error.message,
        });
      }
    } else {
      setIsSending(false); // Cambiar el cursor a "normal" si la acción es cancelada
    }
  }
    

  const formatDate = (date) => date ? date : "No disponible";
  const formatSolution = (solution) => solution ? solution : "No disponible";

  return (
    <main className={`flex flex-1 p-4 md:p-10 ${isSending ? 'cursor-wait' : 'cursor-default'}`}>
      <div className="flex-1 p-4 space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865]">No. de Ticket {ticketNumber}</h4>
        </div>
        <hr className="w-full mb-4 border-black border-1" />

        {ticketData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Título:</strong></p>
                  <p className="text-sm text-left">{ticketData.TITULO}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Fecha Creación:</strong></p>
                  <p className="text-sm text-right">{formatDate(ticketData.FECHA_CREACION)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Fecha Atención:</strong></p>
                  <p className="text-sm text-right">{formatDate(ticketData.FECHA_ATENCION)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Fecha Cierre:</strong></p>
                  <p className="text-sm text-right">{formatDate(ticketData.FECHA_CIERRE)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Fecha Límite:</strong></p>
                  <p className="text-sm text-right">{formatDate(ticketData.FECHA_LIMITE)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Cliente:</strong></p>
                  <p className="text-sm text-right">{ticketData.CLIENTE}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Departamento:</strong></p>
                  <p className="text-sm text-right">{ticketData.DEPARTAMENTO}</p>
                </div>
                <div className={`flex justify-between text-sm rounded ${getEstatus(ticketData.ESTATUS)}`}>
                  <p className="text-sm text-white"><strong>Estatus:</strong></p>
                  <p className="text-sm text-right">{ticketData.ESTATUS}</p>
                </div>
                <div className={`flex justify-between text-sm rounded ${getPriorityClass(ticketData.PRIORIDAD)}`}>
                  <p className="text-sm text-white"><strong>Prioridad:</strong></p>
                  <p className="text-sm text-right">{ticketData.PRIORIDAD}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Usuario Actual Asignado:</strong></p>
                  <p className="text-sm text-right">{ticketData.USUARIO_ACTUAL}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Técnico Asignado:</strong></p>
                  <p className="text-sm text-right">{ticketData.TECNICO}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-[#003865]"><strong>Tipo de Servicio:</strong></p>
                  <p className="text-sm text-right">{ticketData.SERVICIO}</p>
                </div>
                <p className="text-sm text-[#003865]">
                  <strong>Descripción:</strong>
                </p>
                <p className="text-sm text-[#003865]">
                  {ticketData.DESCRIPCION}
                </p>
                <p className="text-sm text-[#003865]">
                  <strong>Solución:</strong> 
                  <p className="text-sm text-[#003865]">
                  {formatSolution(ticketData.SOLUCION)}
                  </p>

                </p>
              </div>
            </div>
          </div>
        ) : (
          <p>Cargando datos del ticket...</p>
        )}

        {/* Validación si el ticketData existe y el estatus NO está Resuelto */}
      {ticketData && ticketData.ESTATUS !== 'Resuelto' && ticketData.USUARIO_ACTUAL === user.Username && (
        <>
          {/* Opciones para el rol Agente o Administrador */}
          {(rolactual === 'Agente' || rolactual === 'Administrador') && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-row items-center space-x-4"> {/* Cambiado flex-col a flex-row y space-y a space-x */}
              <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="ticketStatus"
                    value="corregir"
                    checked={selectedOption === "corregir"}
                    onChange={handleRadioChange}
                  />
                  <span>Regresar al técnico</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="ticketStatus"
                    value="solucionado"
                    checked={selectedOption === "solucionado"}
                    onChange={handleRadioChange}
                  />
                  <span>Cerrar Ticket</span>
                </label>
              </div>

              {/* Mostrar botón o modal según la selección */}
              {selectedOption === "corregir" && (
                <button
                  className="bg-[#003865] text-white py-2 px-4 rounded flex items-center justify-center"
                  onClick={handleRegresaTecnico}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Corregir
                </button>
              )}

              {selectedOption === "solucionado" && (
                <div className="relative">
                  <ModalEncuesta
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSolucion}
                    ticketNumber={ticketNumber} // Aquí estás pasando el ticketNumber al modal
                  />
              </div>
              )}
            </div>
          )}

          {/* Opciones para el rol Técnico */}
          {rolactual === 'Técnico' && ticketData.USUARIO_ACTUAL === user.Username && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-row items-center space-x-4"> {/* Cambiado flex-col a flex-row y space-y a space-x */}
              {/* Condición para ocultar la opción "Regresar al agente" si CLIENTE es igual a TECNICO */}
                {ticketData.CLIENTE !== ticketData.TECNICO && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ticketStatus"
                      value="corregir"
                      checked={selectedOption === "corregir"}
                      onChange={handleRadioChange}
                    />
                    <span>Regresar al agente</span>
                  </label>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="ticketStatus"
                    value="solucionado"
                    checked={selectedOption === "solucionado"}
                    onChange={handleRadioChange}
                  />
                  <span>Solucionar Ticket</span>
                </label>
              </div>

              {/* Botón o modal según la selección */}
              {selectedOption === "corregir" && ticketData.CLIENTE !== ticketData.TECNICO && (
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded flex items-center justify-center"
                  onClick={handleRegresaAgente}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Corregir
                </button>
              )}

              {selectedOption === "solucionado" && (
                <div className="relative">
                  <ModalSolucion
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSolucion}
                    ticketNumber={ticketNumber} // Aquí estás pasando el ticketNumber al modal
                    titulo={ticketData.TITULO}  // Pasa el título del ticket
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      </div>
    </main>
  );
}
