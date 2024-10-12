"use client"; // Asegura que este componente es un Client Component

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; // Importar ReactDOM para manejar renderizado dinámico
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import { PlusIcon } from '@heroicons/react/24/solid';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el locale en español
import { useAuth } from '@/components/AuthContext';
import {
    PlusCircleIcon,
    XCircleIcon 
  } from '@heroicons/react/24/solid';
  import SubirArchivo from './SubirArchivo';

// Registrar el localizador español
registerLocale('es', es);

function ModalTicketCrea({ isOpen, onClose, onSave }) {
    const [modal, setModal] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechalimite, setFechalimite] = useState(null);
    const [prioridadId, setPrioridadId] = useState('');
    const [servicioId, setServicioId] = useState('');
    const [prioridadcombo, setprioridadcombo] = useState([]);
    const [serviciocombo, setserviciocombo] = useState([]);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar el cursor de carga
    const [showTooltip, setShowTooltip] = useState(false);
    const [sugerencias, setSugerencias] = useState([]);


    useEffect(() => {
        comboPrioridades();
        comboServicios();
    }, []);

    const obtenerSugerencias = async (tituloParcial) => {
        if (tituloParcial.length > 2) {
            const response = await fetch(`${getIpApis()}/helpers/suggestions/tickets?tituloParcial=${tituloParcial}`);
            const data = await response.json();
            console.log('Sugerencias recibidas:', data);  // Depurar la respuesta
            setSugerencias(Array.isArray(data) ? data : []);
        } else {
            setSugerencias([]);
        }
    };
    

    

    const comboPrioridades = async () => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/prioridades`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Fetched prioridadcombo:', data); // Log para depuración
            setprioridadcombo(data);
        } catch (error) {
            console.error('Error fetching prioridadcombo:', error);
            setprioridadcombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
        }
    };

    const comboServicios = async () => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/servicios`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Fetched serviciocombo:', data); // Log para depuración
            setserviciocombo(data);
        } catch (error) {
            console.error('Error fetching serviciocombo:', error);
            setserviciocombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
        }
    };

    const generateTicketNumber = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const HH = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
    }

    const ticketNumber = generateTicketNumber();

    const copyToClipboard = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Número de ticket copiado',
                    text: `El número de ticket ${text} ha sido copiado al portapapeles.`,
                });
            }, (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al copiar',
                    text: 'No se pudo copiar el número de ticket al portapapeles.',
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al copiar',
                text: 'La funcionalidad de copiar al portapapeles no está soportada en este navegador.',
            });
        }
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        document.body.style.cursor = 'wait';
        const camposVacios = [];
        
        if (!titulo) camposVacios.push('Incidente');
        if (!descripcion) camposVacios.push('Descripción');
        // if (!fechalimite) camposVacios.push('Fecha Límite');
        if (!prioridadId) camposVacios.push('Prioridad');
        if (!servicioId) camposVacios.push('Tipo de Incidente');
    
        // Verificar si hay campos vacíos
        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }

        // Validar que la fecha límite no sea menor a la fecha actual
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Establecer horas a 00:00 para comparar solo fechas

        if (fechalimite && fechalimite < fechaActual) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha límite inválida',
                text: 'La fecha límite no puede ser anterior a la fecha actual.',
            });
            return;
        }
    
        // Generar el número de ticket
        const ticketNumber = generateTicketNumber();
    
        try {
            const url = `${getIpApis()}/helpers/insert/ticket`;
        
            const ticketData = {
                titulo: titulo,
                descripcion: descripcion,
                fechalimite: fechalimite ? fechalimite : null,
                prioridad: prioridadId,
                servicio: servicioId,
                usuario: user.Username,
                ticketNumber: ticketNumber // Incluyendo el número de ticket en el cuerpo de la solicitud
            };
        
            // console.log(ticketData)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });
        
            if (response.ok) {
                // 1. Obtener correos de la API
                const correoResponse = await fetch(`${getIpApis()}/helpers/mail/retornacorreos?ticket=${ticketNumber}`);
                const correos = await correoResponse.json();

                // 2. Verificar si la respuesta contiene datos
                if (correos && correos.length > 0) {
                    const clienteCorreo = correos[0]?.CLIENTE;
                    const tecnicoCorreo = correos[0]?.TECNICO;

                    if (clienteCorreo && tecnicoCorreo) {
                        // 3. Enviar correo al cliente
                        await fetch(`${getIpApis()}/helpers/email/send`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                Para: clienteCorreo,
                                Asunto: 'TICKET CREADO',
                                Ticket: ticketNumber,
                                Tipo: 'Cliente'
                            }),
                        });

                        // 4. Enviar correo al técnico
                        await fetch(`${getIpApis()}/helpers/email/send`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                Para: tecnicoCorreo,
                                Asunto: 'NUEVO TICKET ASIGNADO',
                                Ticket: ticketNumber,
                                Tipo: 'Técnico',
                                Titulo: titulo,
                                Descripcion: descripcion
                            }),
                        });

                        Swal.fire({
                            icon: 'success',
                            title: '¡Ticket creado!',
                            html: `Número de ticket: <strong>${ticketNumber}</strong><br><div id="file-upload-container"></div>`,
                            didOpen: () => {
                                const container = document.getElementById('file-upload-container');
                                if (container) {
                                    const root = ReactDOM.createRoot(container);
                                    root.render(<SubirArchivo ticketNumber={ticketNumber} />);
                                }
                            },
                        }).then(() => {
                            window.location.reload();
                            setModal(false);
                        });
                    } else {
                        throw new Error('No se encontraron los correos del cliente o técnico.');
                    }
                } else {
                    throw new Error('La respuesta de correos está vacía o es inválida.');
                }
            } else {
                throw new Error('Error al crear ticket');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al crear ticket',
                text: error.message,
            });
            document.body.style.cursor = 'auto'; // Regresar el cursor a normal
        } finally {
            setIsLoading(false);
            document.body.style.cursor = 'auto'; // Regresar el cursor a normal
        }
    }

    const handleInputChange = (e) => {
        const valor = e.target.value;
        setTitulo(valor);
        obtenerSugerencias(valor); // Obtiene sugerencias según el input del usuario
    };
    
    const handleSuggestionClick = (sugerencia) => {
        setTitulo(sugerencia); // Completa el título con la sugerencia seleccionada
        setSugerencias([]); // Limpia las sugerencias
    };
    
    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const handleFocus = () => {
        setShowTooltip(false);
    };

    const handleOpenModal = () => setModal(true);
    const handleCloseModal = () => setModal(false);

    return (
        <>
            {modal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-lg shadow-lg relative">
                    <div className="bg-[#003865] flex items-center w-full mb-10 p-4 rounded-t-lg">
                            <p className="text-2xl text-white text-left flex-grow">Nuevo Ticket</p>
                            <Image 
                                src={logo}
                                alt="logo"
                                width={50} 
                                height={50}
                                className="object-contain mr-4"
                            />
                        </div>
                        <hr className="w-full border-black mb-4" />
                        <p className="text-sm text-gray-500 mb-6 text-center">Campos Obligatorios: (*)</p>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Incidente (*)</label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        placeholder="ingresa tu incidente"
                                        onChange={handleInputChange}
                                        className="input_field"
                                    />
                                    {sugerencias.length > 0 && (
                                        <ul className="sugerencias-list">
                                            {sugerencias.map((sugerencia, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(sugerencia.titulo)} // Maneja el clic en la sugerencia
                                                    className="suggestion" // Aplica estilo a las sugerencias
                                                >
                                                    {sugerencia.titulo}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="col-span-2 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Descripción (*)</label>
                                    <textarea
                                        type="text"
                                        value={descripcion}
                                        placeholder="ingresa una descripción detallada del incidente" 
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm bg-[#F2F2F2]"
                                        rows="4"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Fecha Límite</label>
                                    {/* <DatePicker
                                        selected={fechalimite}
                                        onChange={(date) => setFechalimite(date)}
                                        dateFormat="dd/MM/yyyy"
                                        locale="es" // Se aplica el idioma español
                                        className="input_field"
                                        placeholderText="Selecciona una fecha"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    /> */}
                                    <input
                                        type="date"
                                        value={fechalimite ? fechalimite : ''}
                                        onChange={(e) => setFechalimite(e.target.value)}
                                        className="input_field"
                                    />
                                </div>
                                <div className="flex flex-col">
                                <label className="block text-[#8B8E98] text-xs font-semibold mb-1" htmlFor="prioridadI">Prioridad (*)</label>
                                        <select
                                            id="prioridadId"
                                            value={prioridadId}
                                            onChange={(e) => setPrioridadId(e.target.value)}
                                            className="input_field"
                                        >
                                            <option value="">Selecciona la prioridad del ticket</option>
                                            {prioridadcombo.map((pri) => (
                                                <option key={pri.PRI_ID} value={pri.PRI_ID}>
                                                    {pri.PRI_PRIORIDAD}
                                                </option>
                                            ))}
                                        </select>
                                </div>
                                <div className="col-span-2 flex flex-col">
                                <label className="block text-[#8B8E98] text-xs font-semibold mb-1" htmlFor="servicioId">
                                        Tipo de Incidente (*)
                                    </label>
                                    <select
                                        id="servicioId"
                                        value={servicioId}
                                        onChange={(e) => setServicioId(e.target.value)}
                                        className="input_field"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        onFocus={handleFocus}
                                    >
                                        <option value="">Selecciona el tipo de Incidente</option>
                                        {serviciocombo.map((srv) => (
                                            <option key={srv.SRV_ID} value={srv.SRV_ID}>
                                                {srv.SRV_SERVICIO}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Tooltip flotante */}
                                    {showTooltip && (
                                        <div className="absolute top-25 right-1 mr-4 p-2 w-64 bg-gray-200 text-sm rounded shadow-lg z-10 transform translate-x-full">
                                            <strong>Software:</strong> Incidentes relacionados con el funcionamiento o instalación de aplicaciones.<br/>
                                            <strong>Hardware:</strong> Incidentes relacionados con componentes físicos del equipo, como teclado, monitor, etc.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                                    title="Crear Ticket"
                                >
                                    <PlusCircleIcon      className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    className="bg-red-700 text-white py-2 px-4 rounded"
                                    onClick={handleCloseModal}
                                    title="Cancelar"

                                >
                                    <XCircleIcon  className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <button
                onClick={handleOpenModal}
                className="p-2 bg-[#003865] text-white rounded-full hover:bg-blue-600 focus:outline-none"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </>
    );
    
}

export default ModalTicketCrea;
