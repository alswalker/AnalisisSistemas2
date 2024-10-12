"use client"; // Asegura que este componente es un Client Component

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";
import {
    XCircleIcon,
    CheckCircleIcon,
    CheckIcon
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function Encuesta({ ticketNumber }) {
    const [modal, setModal] = useState(false);
    const [atencion, setAtencion] = useState('');
    const [tiempo, setTiempo] = useState('');
    const [solucion, setSolucion] = useState('');
    const [comentario, setComentario] = useState('');
    const navigate = useNavigate(); // Define useNavigate aquí
    const [showTooltips, setShowTooltips] = useState({
        atencion: false,
        tiempo: false,
        solucion: false,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const camposVacios = [];

        if (!atencion) camposVacios.push('Atención');
        if (!tiempo) camposVacios.push('Tiempo');
        if (!solucion) camposVacios.push('Solución');

        // Verificar si hay campos vacíos
        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }

        try {
            // Construir la URL con los parámetros de la encuesta
            const url = `${getIpApis()}/helpers/update/cerrarticket`;
        
            const ticketData = {
                ticket: ticketNumber,
                atencion: atencion,
                tiempo: tiempo,
                solucion: solucion,
                comentario: comentario,
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
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket cerrado correctamente!'
                }).then(function () {
                    setModal(false);
                    navigate('/dashboard');
                });
            } else {
                throw new Error('Error al cerrar ticket');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al cerrar ticket',
                text: error.message,
            });
        }
    };

    // Actualiza los manejadores para cada tooltip
    const handleMouseEnter = (field) => {
        setShowTooltips((prev) => ({ ...prev, [field]: true }));
    };

    const handleMouseLeave = (field) => {
        setShowTooltips((prev) => ({ ...prev, [field]: false }));
    };

    const handleFocus = (field) => {
        setShowTooltips((prev) => ({ ...prev, [field]: false }));
    };

    const handleOpenModal = () => setModal(true);
    const handleCloseModal = () => setModal(false);

    return (
        <>
            {modal && (
                <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className="bg-white m-auto p-8 rounded-lg shadow-lg w-full max-w-lg">
                        <div className="bg-[#003865] flex items-center w-full mb-10 p-4 rounded-t-lg">
                            <p className="text-xl text-white text-left flex-grow">Encuesta del Ticket: {ticketNumber}</p>
                            <Image 
                                src={logo}
                                alt="logo"
                                width={50} 
                                height={50}
                                className="object-contain mr-4"
                            />
                        </div>
                        <div className="flex text-black flex-col items-center">
                            <hr className="w-full border-black mb-4" />
                            <p className="text-sm text-gray-500 mb-6 text-center">Campos Obligatorios: (*)</p>
                            <p className="text-sm text-gray-500 mb-6 text-center">Marque del 1 al 5 - siendo 1 lo más bajo y 5 lo más alto</p>
                            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Atención brindada (*)</label>
                                        <select
                                            value={atencion}
                                            onChange={(e) => setAtencion(e.target.value)}
                                            className="input_field"
                                            onMouseEnter={() => handleMouseEnter('atencion')}
                                            onMouseLeave={() => handleMouseLeave('atencion')}
                                            onFocus={() => handleFocus('atencion')}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {[...Array(5).keys()].map(num => (
                                                <option key={num + 1} value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                         {/* Tooltip flotante */}
                                         {showTooltips.atencion && (
                                                <div className="absolute top-25 left-1 mr-4 p-2 w-64 bg-gray-200 text-sm rounded shadow-lg z-10 transform translate-x-full">
                                                    <p>Califica como fue la atención que brindó el técnico para resolver el ticket</p>
                                                </div>
                                            )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Tiempo de atención (*)</label>
                                        <select
                                            value={tiempo}
                                            onChange={(e) => setTiempo(e.target.value)}
                                            className="input_field"
                                            onMouseEnter={() => handleMouseEnter('tiempo')}
                                            onMouseLeave={() => handleMouseLeave('tiempo')}
                                            onFocus={() => handleFocus('tiempo')}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {[...Array(5).keys()].map(num => (
                                                <option key={num + 1} value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                        {/* Tooltip flotante */}
                                        {showTooltips.tiempo && (
                                                <div className="absolute top-25 left-1 mr-4 p-2 w-64 bg-gray-200 text-sm rounded shadow-lg z-10 transform translate-x-full">
                                                    <p>Califica como fue el tiempo de atención que se tomó el técnico para resolver el ticket.</p>
                                                </div>
                                            )}
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Solución brindada por el técnico (*)</label>
                                        <select
                                            value={solucion}
                                            onChange={(e) => setSolucion(e.target.value)}
                                            className="input_field"
                                            onMouseEnter={() => handleMouseEnter('solucion')}
                                            onMouseLeave={() => handleMouseLeave('solucion')}
                                            onFocus={() => handleFocus('solucion')}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            {[...Array(5).keys()].map(num => (
                                                <option key={num + 1} value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                        {/* Tooltip flotante */}
                                        {showTooltips.solucion && (
                                                <div className="absolute top-25 left-1 mr-4 p-2 w-64 bg-gray-200 text-sm rounded shadow-lg z-10 transform translate-x-full">
                                                    <p>Califica si la solución brindada es la adecuada.</p>
                                                </div>
                                            )}
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Comentario extra</label>
                                        <textarea
                                            value={comentario}
                                            placeholder="Ingrese algún comentario extra"
                                            onChange={(e) => setComentario(e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm bg-[#F2F2F2]"
                                            rows="4"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                                        title="Cerrar Ticket"
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                        {/* Enviar */}
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-red-700 text-white py-2 px-4 rounded"
                                        onClick={handleCloseModal}
                                        title="Cancelar"
                                    >
                                        <XCircleIcon className="h-5 w-5" />
                                        {/* Cancelar */}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <button
                className="bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center"
                onClick={handleOpenModal}
                title="Abrir Encuesta"
            >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Cerrar
            </button>
        </>
    );
}

export default Encuesta;
