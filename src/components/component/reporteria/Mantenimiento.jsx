import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Button } from '@mui/material';
import { PencilIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import EditarReporteModal from './EditarReporteModal'; // Importar el modal

export default function Mantenimiento() {
  const [reportes, setReportes] = useState([]);
  const [reporteEditando, setReporteEditando] = useState(null); // Estado para manejar el reporte que estamos editando
  const [openModal, setOpenModal] = useState(false); // Estado para controlar si el modal está abierto o no

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
    console.log("Reporte seleccionado para edición:", reporte); // Verificar que el reporte se seleccione correctamente
    setReporteEditando(reporte); // Establecemos el reporte a editar
    setOpenModal(true); // Abrimos el modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Cerramos el modal
    setReporteEditando(null); // Limpiamos el reporte en edición
  };

  const handleSave = () => {
    consultaReportes(); // Refrescamos los reportes al guardar cambios
  };

  const columnsReportes = [
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => {
        const row = params.row;
        return (
          <IconButton onClick={() => handleEditClick(row)} color="primary">
            <PencilIcon className="h-5 w-5" />
          </IconButton>
        );
      }
    },
    { field: 'REP_ID', headerName: 'Id', width: 50 },
    { field: 'REP_NOMBRE', headerName: 'Nombre', width: 400 },
    { field: 'REP_SP', headerName: 'Procedimiento SQL', width: 250 },
    { field: 'REP_REQUISITO', headerName: 'Requisito', width: 300 },
    { field: 'REP_FILTROS', headerName: 'Filtros SQL', width: 200 },
    { field: 'REP_CAMPOS', headerName: 'Campos', width: 200 },
    { field: 'REP_ESTATUS', headerName: 'Estatus', width: 100 },
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

      {/* Modal para editar reportes */}
      {reporteEditando && (
        <EditarReporteModal
          open={openModal}
          onClose={handleCloseModal}
          reporte={reporteEditando}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
