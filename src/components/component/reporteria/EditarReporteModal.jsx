import React from 'react';
import { Box, Modal, TextField, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import {
    DocumentCheckIcon,
    XCircleIcon
  } from '@heroicons/react/24/solid';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,  // Ajustamos el ancho del modal
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function EditarReporteModal({ open, onClose, reporte, onSave }) {
  const [editFormData, setEditFormData] = React.useState(reporte);

  React.useEffect(() => {
    setEditFormData(reporte);  // Actualiza los datos cuando cambie el reporte
  }, [reporte]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveClick = async () => {
    const { REP_ID, REP_NOMBRE, REP_SP, REP_REQUISITO, REP_FILTROS, REP_CAMPOS, REP_ESTATUS } = editFormData;

    if (!REP_NOMBRE || !REP_SP) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'Por favor completa todos los campos obligatorios.',
      });
      return;
    }

    try {
      const url = `${getIpApis()}/helpers/update/reportes`; // Cambia la URL según tu API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        onClose(); // Cerramos el modal primero
        Swal.fire({
          icon: 'success',
          title: '¡Reporte actualizado correctamente!',
        }).then(() => {
          onSave(); // Refrescar los datos después de guardar
        });
      } else {
        throw new Error('Error al actualizar el reporte');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar el reporte',
        text: error.message,
      });
    }
};


  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <h2 id="modal-modal-title">Editar Reporte</h2>
        <TextField
          label="Nombre del Reporte"
          name="REP_NOMBRE"
          value={editFormData.REP_NOMBRE}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Procedimiento SQL"
          name="REP_SP"
          value={editFormData.REP_SP}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Requisito"
          name="REP_REQUISITO"
          value={editFormData.REP_REQUISITO}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          multiline  // Esto convierte el TextField en un TextArea
          rows={3}   // Puedes ajustar la altura del área de texto
        />
        <TextField
          label="Filtros SQL"
          name="REP_FILTROS"
          value={editFormData.REP_FILTROS}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          multiline  // TextArea
          rows={3}   // Ajuste de altura
        />
         <TextField
          label="Campos"
          name="REP_CAMPOS"
          value={editFormData.REP_CAMPOS}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
          multiline  // TextArea
          rows={3}   // Ajuste de altura
        />
        <TextField
          label="Estatus"
          name="REP_ESTATUS"
          value={editFormData.REP_ESTATUS}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button 
          onClick={handleSaveClick} 
          title="Actualizar"
          >
            <DocumentCheckIcon className="w-8 h-8 fill-[#003865]" />
          </Button>
          <Button 
          onClick={onClose} 
          title="Cancelar"
          >
            <XCircleIcon className="w-8 h-8 fill-[#EE4B2B]" />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
