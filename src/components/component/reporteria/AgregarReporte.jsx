"use client"; // Asegura que este componente sea un Client Component
import { useState } from 'react';
import { TextField, IconButton, Box, Typography } from '@mui/material';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';

export default function AgregarReporte({ onReporteAgregado }) {
  const [newReportData, setNewReportData] = useState({
    REP_NOMBRE: '',
    REP_SP: '',
    REP_REQUISITO: '',
    REP_FILTROS: '',
    REP_CAMPOS: '',
    REP_ESTATUS: ''
  });

  const handleNewReportChange = (event) => {
    const { name, value } = event.target;
    setNewReportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddClick = async () => {
    const { REP_NOMBRE, REP_SP } = newReportData;

    if (!REP_NOMBRE || !REP_SP) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'Por favor completa todos los campos obligatorios.',
      });
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/insert/reportes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReportData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Reporte agregado correctamente!',
        }).then(() => {
          setNewReportData({ // Restablece el formulario
            REP_NOMBRE: '',
            REP_SP: '',
            REP_REQUISITO: '',
            REP_FILTROS: '',
            REP_CAMPOS: '',
            REP_ESTATUS: ''
          });
          window.location.reload(); // Recarga la página
        });
      } else {
        throw new Error('Error al agregar el reporte');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar el reporte',
        text: error.message,
      });
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '85vh', // Ocupa toda la altura de la pantalla
        backgroundColor: '#f7fafc', // Fondo gris claro
        padding: '16px', 
      }}
    >
      <Box 
        sx={{
          backgroundColor: '#ffffff', // Color de fondo blanco para el formulario
          borderRadius: '8px', 
          padding: '16px', 
          boxShadow: 2,
          width: '400px', // Ancho del formulario
          marginTop: '50px', // Margen superior
        }}
      >
        <Typography variant="h6" align="center" color="#003865">Agregar Nuevo Reporte</Typography>
        
        <TextField
          name="REP_NOMBRE"
          label="Nombre"
          variant="outlined"
          size="medium" // Aumentar el tamaño del input
          value={newReportData.REP_NOMBRE}
          onChange={handleNewReportChange}
          sx={{ mb: 2, width: '100%' }}
        />
        <TextField
          name="REP_SP"
          label="Procedimiento SQL"
          variant="outlined"
          size="medium" // Aumentar el tamaño del input
          value={newReportData.REP_SP}
          onChange={handleNewReportChange}
          sx={{ mb: 2, width: '100%' }}
        />
        
        <TextField
          name="REP_REQUISITO"
          label="Filtros Necesarios"
          variant="outlined"
          size="medium" // Aumentar el tamaño del input
          value={newReportData.REP_REQUISITO}
          onChange={handleNewReportChange}
          multiline // Cambiar a textarea
          rows={4} // Número de filas en el textarea
          sx={{ mb: 2, width: '100%' }}
        />
        
        <TextField
          name="REP_FILTROS"
          label="Parámetros SQL"
          variant="outlined"
          size="medium" // Aumentar el tamaño del input
          value={newReportData.REP_FILTROS}
          onChange={handleNewReportChange}
          multiline // Cambiar a textarea
          rows={4} // Número de filas en el textarea
          sx={{ mb: 2, width: '100%' }}
        />
         <TextField
          name="REP_CAMPOS"
          label="Campos Necesarios"
          variant="outlined"
          size="medium" // Aumentar el tamaño del input
          value={newReportData.REP_CAMPOS}
          onChange={handleNewReportChange}
          multiline // Cambiar a textarea
          rows={4} // Número de filas en el textarea
          sx={{ mb: 2, width: '100%' }}
        />
        
        <IconButton
          onClick={handleAddClick}
          title="Agregar nuevo reporte"
          sx={{ alignSelf: 'flex-end' }} // Alinear el botón a la derecha
        >
          <PlusCircleIcon className="w-8 h-8 fill-[#003865]" />
        </IconButton>
      </Box>
    </Box>
  );
}
