"use client"; // Asegura que este componente sea un Client Component
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, TextField, Button } from '@mui/material';
import { DocumentCheckIcon, PencilIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import AgregarReporte from './AgregarReporte'; // Importa el nuevo componente

export default function Mantenimiento() {
  const [reportes, setReportes] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    REP_ID: '',
    REP_NOMBRE: '',
    REP_SP: '',
    REP_REQUISITO: '',
    REP_FILTROS: '',
    REP_ESTATUS: ''
  });

  useEffect(() => {
    consultaReportes();
  }, []);

  const consultaReportes = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/reportesmant`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setReportes(data);
    } catch (error) {
      console.error('Error fetching reportes:', error);
      setReportes([]);
    }
  };

  const handleEditClick = (reporte) => {
    setEditRowId(reporte.REP_ID);
    setEditFormData({ ...reporte });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateClick = async () => {
    const { REP_ID, REP_NOMBRE, REP_SP, REP_REQUISITO, REP_FILTROS, REP_ESTATUS } = editFormData;
    
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
        Swal.fire({
          icon: 'success',
          title: '¡Reporte actualizado correctamente!',
        }).then(() => {
          consultaReportes(); // Actualiza la lista de reportes después de la edición
          setEditRowId(null); // Restablece el estado de edición
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

  const columnsReportes = [
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => {
        const row = params.row;
        return editRowId === row.REP_ID ? (
          <>
            <IconButton onClick={handleUpdateClick} color="success">
              <DocumentCheckIcon className="h-5 w-5" />
            </IconButton>
            <IconButton onClick={() => setEditRowId(null)} color="error">
              <XCircleIcon className="h-5 w-5" />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={() => handleEditClick(row)} color="primary">
            <PencilIcon className="h-5 w-5" />
          </IconButton>
        );
      }
    },
    { field: 'REP_ID', headerName: 'Id', width: 50 },
    {
      field: 'REP_NOMBRE',
      headerName: 'Nombre',
      width: 200,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.REP_ID ? (
          <TextField
            value={editFormData.REP_NOMBRE}
            name="REP_NOMBRE"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.REP_NOMBRE
      )
    },
    {
      field: 'REP_SP',
      headerName: 'Procedimiento SQL',
      width: 200,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.REP_ID ? (
          <TextField
            value={editFormData.REP_SP}
            name="REP_SP"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.REP_SP
      )
    },
    {
      field: 'REP_REQUISITO',
      headerName: 'Filtros Requeridos',
      width: 300,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.REP_ID ? (
          <TextField
            value={editFormData.REP_REQUISITO}
            name="REP_REQUISITO"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.REP_REQUISITO
      )
    },
    {
      field: 'REP_FILTROS',
      headerName: 'Filtros',
      width: 200,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.REP_ID ? (
          <TextField
            value={editFormData.REP_FILTROS}
            name="REP_FILTROS"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.REP_FILTROS
      )
    },
    {
        field: 'REP_ESTATUS',
        headerName: 'Estatus',
        width: 100,
        editable: true,
        renderCell: (params) => (
          editRowId === params.row.REP_ID ? (
            <TextField
              value={editFormData.REP_ESTATUS}
              name="REP_ESTATUS"
              onChange={handleEditFormChange}
              fullWidth
            />
          ) : params.row.REP_ESTATUS
        )
    },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Box sx={{ marginTop: 5, display: 'flex', gap: 1 }}>
      <DataGrid
          rows={reportes}
          columns={columnsReportes}
          getRowId={(row) => row.REP_ID}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>
    </div>
  );
}
