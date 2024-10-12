"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import { getIpApis } from '../configip';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';

export default function FileUpload({ ticketNumber, onUploadComplete }) {
  const [files, setFiles] = useState([]);

  // Límite de tamaño en bytes (1MB)
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB en bytes

  // Manejar el cambio de archivo
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Validar que los archivos no superen 1MB
      const validFiles = selectedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          Swal.fire({
            icon: 'error',
            title: 'Archivo demasiado grande',
            text: `El archivo ${file.name} supera el tamaño máximo de 1MB.`,
          });
          return false; // No incluir el archivo
        }
        return true; // Incluir solo si es válido
      });

      setFiles(validFiles); // Guardar los archivos válidos
    }
  };

  // Subir archivo
  const handleFileUpload = async () => {
    if (files.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay archivos para subir',
        text: 'Por favor, selecciona archivos que no superen los 1MB.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('ticket', ticketNumber); // Adjuntar el ticket

    files.forEach((file) => {
      formData.append('file', file); // Adjuntar cada archivo
    });

    try {
      const response = await fetch(`${getIpApis()}/helpers/upload/archivo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
            icon: 'success',
            title: '¡Archivo subido correctamente!',
          }).then(function () {
        setFiles([]); // Limpiar los archivos subidos
        if (onUploadComplete) {
          onUploadComplete(); // Llamar la función de callback para actualizar el listado si se provee
        }
        });
      } else {
        console.error('Error subiendo archivo');
      }
    } catch (error) {
      console.error('Error en el fetch:', error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      {/* Input para subir archivo */}
      <div className="flex items-center space-x-2">
        <input
          type="file"
          multiple
          onChange={handleFileChange} // Evento para seleccionar archivos
          className="p-2"
        />
        <button
          onClick={handleFileUpload} // Evento para subir archivos
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
          title="Subir Archivo"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
