"use client"; // Asegura que este componente es un Client Component

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";
import { getIpApis } from '../configip';
import {
    DocumentPlusIcon   ,
    TrashIcon,
    PencilIcon,
    XCircleIcon ,
    ArrowDownTrayIcon,
    PlusIcon
  } from '@heroicons/react/24/solid';

function CrudPrioridad() {
    const [modal, setModal] = useState(false);
    const [labelText, setLabelText] = useState('Nueva Prioridad');
    const [prioridad, setPrioridad] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const camposVacios = [];
        
        if (!prioridad) camposVacios.push('Prioridad');
        // if (!direccion) camposVacios.push('Dirección');
        // if (!nit) camposVacios.push('NIT');
        // if (!telefono) camposVacios.push('Teléfono');
        // if (!correo) camposVacios.push('Correo');
    
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
            const url = `${getIpApis()}/helpers/insert/prioridades`;
    
            const prioridadData = {
                prioridad: prioridad
            };
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prioridadData)
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro guardado correctamente!'
                }).then(function () {
                    window.location.reload();
                    setModal(false);
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
    

    const handleOpenModal = () => setModal(true);
    const handleCloseModal = () => setModal(false);

    return (
        <>
            {modal && (
                <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
    <div className="bg-white m-auto p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="bg-[#003865] flex items-center w-full mb-10 p-4 rounded-t-lg">
            <p className="text-2xl text-white text-left flex-grow">{labelText}</p>
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
                        <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Prioridad (*)</label>
                        <input
                            type="text"
                            value={prioridad}
                            placeholder="ingresa una prioridad"
                            onChange={(e) => setPrioridad(e.target.value)}
                            className="input_field"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                                 <button
                                    type="submit"
                                    className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                                    title="Guardar nuevo registro"
                                >
                                    <DocumentPlusIcon     className="h-5 w-5" />
                                    {/* Guardar */}
                                </button>
                                <button
                                    type="button"
                                    className="bg-red-700 text-white py-2 px-4 rounded"
                                    onClick={handleCloseModal}
                                    title="Cancelar"
                                >
                                    <XCircleIcon  className="h-5 w-5" />
                                    {/* Cancelar */}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            )}
             <button
                className="bg-[#003865] text-white py-2 px-4 rounded"
                onClick={handleOpenModal}
                title="Nuevo Registro"
            >
                   <PlusIcon className="w-5 h-5" />
            </button>
        </>
    );
}

export default CrudPrioridad;