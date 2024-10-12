"use client"; // Asegura que este componente es un Client Component
import { useEffect, useState } from 'react';
import { DataGrid, esES  } from '@mui/x-data-grid';
import { Box, IconButton, Select, MenuItem, TextField } from '@mui/material'; // Asegúrate de incluir TextField aquí
import {
  DocumentCheckIcon,
  MinusCircleIcon,
  PencilIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import { useAuth } from '@/components/AuthContext';
import { format } from 'date-fns';


export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]); // Para la búsqueda
  const [rolesCombo, setRolesCombo] = useState([]);
  const [departamentosCombo, setDepartamentosCombo] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    USUARIO: '',
    NOMBRE: '',
    FECHA_NAC: '',
    USR_CORREO: '',
    USR_TELEFONO: '',
    ROL: '',
    DEPARTAMENTO: ''
  });
  const [filterText, setFilterText] = useState(''); // Estado para la barra de búsqueda

  useEffect(() => {
    consultaUsuarios();
    comboRol();
    comboDepa();
  }, []);

  useEffect(() => {
    // Filtrar usuarios cuando cambia el texto de búsqueda
    setFilteredUsuarios(
      usuarios.filter(usuario =>
        usuario.USUARIO.toLowerCase().includes(filterText.toLowerCase()) ||
        usuario.USR_NOMBRES.toLowerCase().includes(filterText.toLowerCase()) ||
        usuario.USR_APELLIDOS.toLowerCase().includes(filterText.toLowerCase()) ||
        usuario.USR_CORREO.toLowerCase().includes(filterText.toLowerCase()) ||
        usuario.ROL.toLowerCase().includes(filterText.toLowerCase()) ||
        usuario.DEPARTAMENTO.toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [filterText, usuarios]);

  const consultaUsuarios = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/usuarios`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setUsuarios([]);
    }
  };

  const comboRol = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/rol`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setRolesCombo(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRolesCombo([]);
    }
  };

  const comboDepa = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/combos/depa`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setDepartamentosCombo(data);
    } catch (error) {
      console.error('Error fetching departamentos:', error);
      setDepartamentosCombo([]);
    }
  };

  const handleEditClick = (usuario) => {
    setEditRowId(usuario.ID);
    setEditFormData({ ...usuario });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const processRowUpdate = (newRow, oldRow) => {
    setEditFormData((prev) => ({
      ...prev,
      ...newRow,
    }));
  
    // Puedes retornar el nuevo valor de la fila aquí
    return newRow;
  };
  
  
  const handleUpdateClick = async () => {
    try {
      const { USUARIO, USR_NOMBRES, USR_APELLIDOS, FECHA_NAC, USR_CORREO, USR_TELEFONO, ROL, DEPARTAMENTO } = editFormData;
      const camposVacios = [];

      if (!USUARIO) camposVacios.push('Usuario');
      if (!USR_NOMBRES) camposVacios.push('Nombres');
      if (!USR_APELLIDOS) camposVacios.push('Apellidos');
      if (!USR_CORREO) camposVacios.push('Correo');
      if (!USR_TELEFONO) camposVacios.push('Teléfono');
      if (!ROL) camposVacios.push('Rol');
      if (!DEPARTAMENTO) camposVacios.push('Departamento');

      if (camposVacios.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Campos obligatorios',
          text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
        });
        return;
      }

      const rolParts = editFormData.ROL.split('-'); // Dividir el estado en número y texto
      const roldId = rolParts[0].trim(); // Obtener solo el número del estado

      const depParts = editFormData.DEPARTAMENTO.split('-'); // Dividir el estado en número y texto
      const depid = depParts[0].trim(); // Obtener solo el número del estado

      const url = `${getIpApis()}/helpers/update/usuarios`;
      const usuarioData = {
        usuarioId : editFormData.ID,
        usuario: editFormData.USUARIO,
        nombres: editFormData.USR_NOMBRES,
        apellidos: editFormData.USR_APELLIDOS,
        rolId: roldId,
        depId: depid,
        correo: editFormData.USR_CORREO,
        telefono: editFormData.USR_TELEFONO
      };
      
      console.log(usuarioData)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado correctamente!',
        }).then(() => {
          consultaUsuarios(); // Actualiza la lista de usuarios después de la edición
          setEditRowId(null); // Restablece el estado de edición
        });
      } else {
        throw new Error('Error al actualizar el usuario');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar usuario',
        text: error.message,
      });
    }
  };

  const handleBaja = async (idUsuario) => {
    try {
      const response = await fetch(
        `${getIpApis()}/helpers/catalogos/estatusupdate?tabla=HEL_USUARIO&columna=USR_ID&id=${idUsuario}&estatus=0`,
        { method: 'POST' }
      );

      Swal.fire({
        icon: 'success',
        title: '¡Usuario dado de baja correctamente!'
      }).then(() => {
        consultaUsuarios();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al dar de baja el usuario',
        text: error.message,
      });
    }
  };

  const deseaDarBaja = (idUsuario, nombre) => {
    Swal.fire({
      title: `¿Desea dar de baja al usuario ${nombre}?`,
      icon: "warning",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Dar de baja",
      showCancelButton: true,
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        handleBaja(idUsuario);
      }
    });
  };

  const columnsUsuarios = [
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => {
        const row = params.row;
        return editRowId === row.ID ? (
          <>
            <IconButton onClick={handleUpdateClick} color="success">
              <DocumentCheckIcon className="h-5 w-5" />
            </IconButton>
            <IconButton onClick={() => setEditRowId(null)} color="error">
              <XCircleIcon className="h-5 w-5" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => handleEditClick(row)} color="primary">
              <PencilIcon className="h-5 w-5" />
            </IconButton>
            <IconButton color="error">
              <MinusCircleIcon className="h-5 w-5" />
            </IconButton>
          </>
        );
      }
    },
    { field: 'ID', headerName: 'Id', width: 70 },
    {
      field: 'USUARIO',
      headerName: 'Usuario',
      width: 130,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <TextField
            value={editFormData.USUARIO}
            name="USUARIO"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.USUARIO
      )
    },
    {
      field: 'USR_NOMBRES',
      headerName: 'Nombres',
      width: 130,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <TextField
            value={editFormData.USR_NOMBRES}
            name="USR_NOMBRES"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.USR_NOMBRES
      )
    },
    {
      field: 'USR_APELLIDOS',
      headerName: 'Apellidos',
      width: 130,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <TextField
            value={editFormData.USR_APELLIDOS}
            name="USR_APELLIDOS"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.USR_APELLIDOS
      )
    },
    {
      field: 'ROL',
      headerName: 'Rol',
      width: 150,
      editable: true,
      resizable: true, // Asegura que la columna sea redimensionable
  
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <Select
            value={editFormData.ROL}
            onChange={handleEditFormChange}
            name="ROL"
            fullWidth
          >
            {rolesCombo.map((rol) => (
              <MenuItem key={rol.ROL} value={rol.ROL}>
                {rol.ROL}
              </MenuItem>
            ))}
          </Select>
        ) : params.row.ROL
      )
    },
    {
      field: 'DEPARTAMENTO',
      headerName: 'Departamento',
      width: 150,
      editable: true,
      resizable: true, // Asegura que la columna sea redimensionable
  
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <Select
            value={editFormData.DEPARTAMENTO}
            onChange={(e) => setEditFormData({ ...editFormData, DEPARTAMENTO: e.target.value })}
            name="DEPARTAMENTO"
            fullWidth
          >
            {departamentosCombo.map((departamento) => (
              <MenuItem key={departamento.DEPA} value={departamento.DEPA}>
                {departamento.DEPA}
              </MenuItem>
            ))}
          </Select>
        ) : params.row.DEPARTAMENTO
      )
    },
    {
      field: 'USR_CORREO',
      headerName: 'Correo',
      width: 180,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <TextField
            value={editFormData.USR_CORREO}
            name="USR_CORREO"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.USR_CORREO
      )
    },
    {
      field: 'USR_TELEFONO',
      headerName: 'Teléfono',
      width: 150,
      editable: true,
      renderCell: (params) => (
        editRowId === params.row.ID ? (
          <TextField
            value={editFormData.USR_TELEFONO}
            name="USR_TELEFONO"
            onChange={handleEditFormChange}
            fullWidth
          />
        ) : params.row.USR_TELEFONO
      )
    }
  ];
  

  return (
    <Box sx={{ height: 600, width: '100%' }}> {/* Cambia 400 a 600 o a la altura que prefieras */}
     <TextField
        label="Buscar usuario"
        variant="outlined"
        fullWidth
        margin="normal"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)} // Controlar el cambio en la barra de búsqueda
      />
     <DataGrid
        rows={filteredUsuarios}
        columns={columnsUsuarios}
        getRowId={(row) => row.ID}
        pageSize={5}
        rowsPerPageOptions={[5]}
        // checkboxSelection
        editMode="row"
        processRowUpdate={processRowUpdate}  // Procesa actualizaciones de filas
        onProcessRowUpdateError={(error) => {
          console.error('Error updating row:', error);
        }}
      />
    </Box>
  );
}
