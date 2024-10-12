import { useEffect, useState } from 'react';
import { getIpApis } from '@/components/component/configip';
import { useAuth } from '@/components/AuthContext';
import { FolderPlusIcon, CheckIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

export default function RevisionQA({ ticketNumber }) {
  const [accion, setAccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoAcciones, setTipoAcciones] = useState([]);
  const { user } = useAuth();
  const [accionAgregada, setAccionAgregada] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [solucion, setSolucion] = useState(null); // Valor de la solución (1 o 2)
  const navigate = useNavigate(); // Define useNavigate aquí

  const maxCaracteres = 2000;

  const comboTipoAccion = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/tipoaccionqa`);
      const data = await response.json();
      setTipoAcciones(data);
    } catch (error) {
      console.error('Error al cargar los tipos de acción:', error);
    }
  };

  useEffect(() => {
    comboTipoAccion();
  }, []);

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const caracteresRestantes = maxCaracteres - descripcion.length;

  const handleAccionChange = (e) => {
    setAccion(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const camposVacios = [];

    if (!accion) camposVacios.push('Tipo acción');
    if (!descripcion) camposVacios.push('Descripción');

    if (camposVacios.length > 0) {
      setErrorMsg(`Por favor completa todos los campos: ${camposVacios.join(', ')}.`);
      setAccionAgregada(false);
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/insert/nuevaccion`;

      const accionData = {
        usuario: user.Username,
        llaveTicket: ticketNumber,
        tipoaccion: accion,
        descripcion: descripcion,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accionData),
      });

      if (response.ok) {
        setAccionAgregada(true);
        setErrorMsg(null);
      } else {
        throw new Error('Error al guardar la acción');
      }
    } catch (error) {
      setErrorMsg('Error al guardar acción: ' + error.message);
      setAccionAgregada(false);
    }
  };

  // Maneja el cambio de los radio buttons
  const handleRadioChange = (e) => {
    setSolucion(parseInt(e.target.value));
  };

  // Función para manejar el click del botón "Revisión QA"
  const handleQAReview = async () => {
    if (!solucion) {
      // Alerta si no se selecciona ninguna opción
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona una opción (Reaperturar o Cerrar)',
      });
      return;
    }
  console.log(accion)
    // Validar que la opción seleccionada sea coherente con la acción realizada
    if ((solucion === 1 && accion !== '5') || (solucion === 2 && accion !== '6')) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La opción seleccionada no coincide con la acción realizada. Verifica tu selección.',
      });
      return;
    }
  
    try {
      const url = `${getIpApis()}/helpers/update/finalizaqa?ticket=${ticketNumber}&solucion=${solucion}`;
  
      const response = await fetch(url, {
        method: 'POST',
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Alerta de éxito
        Swal.fire({
          icon: 'success',
          title: '¡QA Finalizado!',
          text: 'La revisión de QA se ha finalizado correctamente.',
        }).then(function () {
            navigate('/dashboard');
        });

      } else {
        throw new Error('Error en la finalización de QA');
      }
    } catch (error) {
      // Alerta en caso de error en la API
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error en la finalización de QA: ' + error.message,
      });
    }
  };
  

  return (
    <div className="container mx-auto p-4 md:max-w-md">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865] text-lg">
          Revisión QA para el ticket: {ticketNumber}
          </h4>
        </div>
        <hr className="w-full mb-4 border-black border-1" />
      </div>
      <form className="space-y-4 w-full" onSubmit={handleSubmit}>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Tipo acción
            </label>
            <select
              value={accion}
              onChange={handleAccionChange}
              className="w-full p-1 border rounded-md text-sm"
            >
              <option value="">Seleccionar una opción</option>
              {tipoAcciones.map((tipo) => (
                <option key={tipo.TAC_ID} value={tipo.TAC_ID}>
                  {tipo.TAC_TIPO_ACCION}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Descripción
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

          {/* Mensaje de éxito o error */}
          {accionAgregada && (
            <div className="bg-green-200 text-white-800 p-2 rounded-md text-sm mt-2">
              ¡Acción agregada correctamente!
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-200 text-red-800 p-2 rounded-md text-sm mt-2">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#003865] text-white py-2 px-4 rounded"
              disabled={descripcion.length === 0}
              title="Agregar"
            >
              <FolderPlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Radio buttons para Reaperturar/Cerrar ticket */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="mb-2">
        <input
              type="radio"
              name="accion-ticket"
              id="reaperturar"
              value="1"
              onChange={handleRadioChange}
              disabled={!accionAgregada}
              className="mr-2"
            />
            <label htmlFor="reaperturar" className="text-gray-700 text-sm">
              Reaperturar ticket
            </label>
          </div>

          <div className="flex items-center mb-2">
            <input
              type="radio"
              name="accion-ticket"
              id="cerrar"
              value="2"
              onChange={handleRadioChange}
              disabled={!accionAgregada}
              className="mr-2"
            />
            <label htmlFor="cerrar" className="text-gray-700 text-sm">
              Cerrar ticket
            </label>
          </div>
        </div>

        {/* Botón Revisión QA */}
        <div className="flex justify-center">
        <button
            type="button"
            onClick={handleQAReview}
            className="bg-green-700 text-white py-2 px-4 rounded"
            disabled={!accionAgregada}
            title="Finalizar Revisión"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
