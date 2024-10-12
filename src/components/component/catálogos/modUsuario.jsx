import { useState, useEffect } from 'react';
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale'; 
import { format } from 'date-fns';
import {
    DocumentPlusIcon   ,
    XCircleIcon ,
    PlusIcon
  } from '@heroicons/react/24/solid';
registerLocale('es', es); 

export default function ModUsuario() {
    const [usuario, setUsuario] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState(null);
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [rol, setRol] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [rolesCombo, setRolesCombo] = useState([]);
    const [departamentosCombo, setDepartamentosCombo] = useState([]);

    const comboRol = async () => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/rol`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Fetched proveedorcombo:', data); // Log para depuración
            setRolesCombo(data);
        } catch (error) {
            console.error('Error fetching setRolesCombo:', error);
            setRolesCombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
        }
     };
    
     const comboDepa = async () => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/depa`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // console.log('Fetched proveedorcombo:', data); // Log para depuración
            setDepartamentosCombo(data);
        } catch (error) {
            console.error('Error fetching setDepartamentosCombo:', error);
            setDepartamentosCombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
        }
    };

    useEffect(() => {
        comboRol();
        comboDepa();
    }, []);

        // Función para generar el usuario automáticamente
    const generarUsuario = () => {
        if (nombres && apellidos) {
        const inicial = nombres.charAt(0).toLowerCase();
        const apellido = apellidos.split(' ')[0].toLowerCase(); // Solo el primer apellido
        setUsuario(`${inicial}${apellido}`);
        }
    };

    useEffect(() => {
        generarUsuario();
      }, [nombres, apellidos]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const camposVacios = [];
        if (!usuario) camposVacios.push('Usuario');
        if (!nombres) camposVacios.push('Nombres');
        if (!apellidos) camposVacios.push('Apellidos');
        if (!fechaNacimiento) camposVacios.push('Fecha de Nacimiento');
        if (!correo) camposVacios.push('Correo');
        if (!telefono) camposVacios.push('Teléfono');
        if (!rol) camposVacios.push('Rol');
        if (!departamento) camposVacios.push('Departamento');

        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }

        try {
            const url = `${getIpApis()}/helpers/insert/usuarios`;
    
            const usuarioData = {
                usuario: usuario,
                nombres: nombres,
                apellidos: apellidos,
                fechaNac: fechaNacimiento ? format(fechaNacimiento, 'yyyy-MM-dd') : null,
                telefono: telefono,
                correo: correo,
                telefono : telefono ,
                rolId : rol,
                depId : departamento
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
                    title: '¡Usuario creado correctamente!'
                }).then(async () => {
                    await fetch(`${getIpApis()}/helpers/email/send`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          Para: correo,
                          Asunto: 'USUARIO CREADO',
                          Titulo: usuario,
                          Ticket: '123',
                          Tipo: 'Usuario',
                          Descripcion: `BIENVENIDO ${nombres} ${apellidos}!, SE HA CREADO SU USUARIO ÉXITOSAMENTE, FAVOR DE INGRESAR AL SISTEMA.`,
                        }),
                      });
                    window.location.reload();
                });
            } else {
                throw new Error('Error al guardar el registro');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar registro',
                text: error.message,
            });
        }
    };

    return (
        <div className="container mx-auto p-4 md:max-w-md">
            <h4 className="font-bold text-[#003865] text-lg mb-4 text-center">
                Agregar nuevo usuario
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Usuario</label>
                    <input 
                        type="text"
                        value={usuario}
                        disabled
                        className="w-full p-1 border rounded-md text-sm" 
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm">Nombres</label>
                    <input 
                        type="text" 
                        value={nombres} 
                        onChange={(e) => setNombres(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm" 
                        placeholder="Nombres"
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm">Apellidos</label>
                    <input 
                        type="text" 
                        value={apellidos} 
                        onChange={(e) => setApellidos(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm" 
                        placeholder="Apellidos"
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm">Fecha de Nacimiento</label>
                    <DatePicker
                        selected={fechaNacimiento}
                        onChange={(date) => setFechaNacimiento(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        className="w-full p-1 border rounded-md text-sm"
                        placeholderText="Selecciona una fecha"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm">Correo</label>
                    <input 
                        type="email" 
                        value={correo} 
                        onChange={(e) => setCorreo(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm" 
                        placeholder="Correo electrónico"
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm">Teléfono</label>
                    <input 
                        type="tel" 
                        value={telefono} 
                        onChange={(e) => setTelefono(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm" 
                        placeholder="Número de teléfono"
                    />

                    <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="rolId">Rol</label>
                    <select 
                        id="rolId"
                        value={rol} 
                        onChange={(e) => setRol(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm"
                    >
                        <option value="">Seleccionar rol</option>
                        {rolesCombo.map((rolItem) => (
                            <option key={rolItem.ROL_ID} value={rolItem.ROL_ID}>
                                {rolItem.ROL}
                            </option>
                        ))}
                    </select>

                    <label className="block text-gray-700 font-medium mb-1 text-sm ">Departamento</label>
                    <select 
                        id="depaId"
                        value={departamento} 
                        onChange={(e) => setDepartamento(e.target.value)} 
                        className="w-full p-1 border rounded-md text-sm text-black"
                    >
                        <option value="">Seleccionar departamento</option>
                        {departamentosCombo.map((depaItem) => (
                            <option key={depaItem.DEP_ID} value={depaItem.DEP_ID}>
                                {depaItem.DEPA}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end mt-4">
                        <button 
                            type="submit" 
                            className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                            title="Guardar Usuario"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
