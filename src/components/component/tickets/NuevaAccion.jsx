import { useEffect, useState } from 'react';
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthContext';
import { FolderPlusIcon } from '@heroicons/react/24/solid';

export default function NuevaAccion({ ticketNumber }) {
  const [accion, setAccion] = useState(''); // Para almacenar el TAC_ID seleccionado
  const [descripcion, setDescripcion] = useState('');
  const [tipoAcciones, setTipoAcciones] = useState([]); // Para almacenar los tipos de acción obtenidos de la API
  const { user } = useAuth();

  const maxCaracteres = 2000;

  // Función para obtener los tipos de acción desde la API
  const comboTipoAccion = async () => {
    try {
        const response = await fetch(`${getIpApis()}/helpers/combos/tipoaccion`);

      const data = await response.json();
      setTipoAcciones(data); // Almacena los tipos de acción en el estado
    } catch (error) {
      console.error('Error al cargar los tipos de acción:', error);
    }
  };

  // Ejecuta la consulta cuando el componente se monta
  useEffect(() => {
    comboTipoAccion();
  }, []);

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  };

  const caracteresRestantes = maxCaracteres - descripcion.length;

  const handleAccionChange = (e) => {
    setAccion(e.target.value); // Almacena el TAC_ID seleccionado
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const camposVacios = [];

    if (!accion) camposVacios.push('Tipo acción');
    if (!descripcion) camposVacios.push('Descripción');

    if (camposVacios.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
      });
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

    //   console.log(accionData);
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(accionData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Acción agregada correctamente!',
        }).then(function () {
          window.location.reload();
        });
      } else {
        throw new Error('Error al guardar la acción');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar acción',
        text: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:max-w-md">
      <div className="w-full"> 
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#003865] text-lg">
            Nueva acción para el ticket: {ticketNumber}
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
      </form>
    </div>
  );
  
  
}
