"use client"; // Asegura que este componente es un Client Component

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";
import {
    XCircleIcon,
    CheckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function SolucionTicket({ ticketNumber, titulo }) {
    const [modal, setModal] = useState(false);
    const [solucion, setSolucion] = useState('');
    const [isSending, setIsSending] = useState(false); // Estado para el cursor
    const navigate = useNavigate(); // Define useNavigate aquí

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!solucion) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: 'Por favor completa el campo de Solución.',
            });
            return;
        }

        setIsSending(true); // Cambia el cursor a cargando

        try {
            const url = `${getIpApis()}/helpers/update/finalizatecnico?ticket=${ticketNumber}&solucion=${encodeURIComponent(solucion)}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket finalizado correctamente!'
                }).then(async () => {
                    const correoResponse = await fetch(`${getIpApis()}/helpers/mail/retornacorreos?ticket=${ticketNumber}`);
                    const correos = await correoResponse.json();
                    const clienteCorreo = correos[0]?.CLIENTE;

                    // Enviar correo al cliente
                    await fetch(`${getIpApis()}/helpers/email/send`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            Para: clienteCorreo,
                            Asunto: 'SE HA FINALIZADO SU TICKET',
                            Ticket: ticketNumber,
                            Tipo: 'Finaliza ticket',
                            Titulo: titulo,
                            Descripcion: solucion
                        })
                    });

                    setIsSending(false); // Cambiar el cursor a normal
                    setModal(false);
                    navigate('/dashboard');
                });
            } else {
                throw new Error('Error al finalizar ticket');
            }
        } catch (error) {
            setIsSending(false); // Cambiar el cursor a normal en caso de error
            Swal.fire({
                icon: 'error',
                title: 'Error al finalizar ticket',
                text: error.message,
            });
        }
    };

    const handleOpenModal = () => setModal(true);
    const handleCloseModal = () => {
        setModal(false);
        setIsSending(false); // Asegurar que el cursor vuelva a su estado normal
    };

    return (
        <>
            {modal && (
                <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
                    <div className={`bg-white m-auto p-8 rounded-lg shadow-lg w-full max-w-lg ${isSending ? 'cursor-wait' : 'cursor-default'}`}>
                        <div className="bg-[#003865] flex items-center w-full mb-10 p-4 rounded-t-lg">
                            <p className="text-xl text-white text-left flex-grow">Solución del Ticket: {ticketNumber}</p>
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
                            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 flex flex-col">
                                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Solución Realizada (*)</label>
                                        <textarea
                                            value={solucion}
                                            placeholder="Ingresa la solución realizada"
                                            onChange={(e) => setSolucion(e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm bg-[#F2F2F2]"
                                            rows="4"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                                        title="Finalizar"
                                        disabled={isSending} // Deshabilitar botón mientras se envía
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-red-700 text-white py-2 px-4 rounded"
                                        onClick={handleCloseModal}
                                        title="Cancelar"
                                        disabled={isSending} // Deshabilitar botón mientras se envía
                                    >
                                        <XCircleIcon className="h-5 w-5" />
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
                title="Finalizar Ticket Actual"
            >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Finalizar
            </button>
        </>
    );
}

export default SolucionTicket;
