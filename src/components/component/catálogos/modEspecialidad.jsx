"use client"; // Asegura que este componente es un Client Component

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";
import {
    DocumentPlusIcon   ,
    XCircleIcon ,
    PlusIcon
  } from '@heroicons/react/24/solid';

function agregaEspecialidad() {
    const [modal, setModal] = useState(false);
    const [labelText, setLabelText] = useState('Asignar especialidad a técnico');
    const [especialidad, setEspecialidad] = useState('');
    const [tecid, setTecid] = useState('');
    const [comboespecialid, setcomboespecialid] = useState([]);
    const [combotecnicos, setcombotecnicos] = useState('');


    useEffect(() => {
        comboEspecialidades();
        comboTecnicos();
    }, []);

    const comboEspecialidades = async () => {
        try {
          const response = await fetch(`${getIpApis()}/helpers/combos/especialidad`);
          const data = await response.json();
          setcomboespecialid(data);
        } catch (error) {
          console.error('Error al cargar setcomboespecialid:', error);
        }
    };

    
    const comboTecnicos = async () => {
        try {
          const response = await fetch(`${getIpApis()}/helpers/combos/tecnicosespecial`);
          const data = await response.json();
          setcombotecnicos(data);
        } catch (error) {
          console.error('Error al cargar setcomboespecialid:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const camposVacios = [];
        
        if (!especialidad) camposVacios.push('Especialidad');
        if (!tecid) camposVacios.push('Tecnico');

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
            const url = `${getIpApis()}/helpers/insert/especialidad`;
    
            const especialidadData = {
                especialidad: especialidad,
                tecnico: tecid
            };

            // console.log(especialidadData)
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(especialidadData)
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
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1" htmlFor="especialidad">Especialidad (*)</label>
                                    <select
                                            id="especialidad"
                                            value={especialidad}
                                            onChange={(e) => setEspecialidad(e.target.value)}
                                            className="input_field"
                                        >
                                            <option value="">Seleccionar especialidad</option>
                                            {comboespecialid.map(prv => (
                                                <option key={prv.ESP_ESPECIALIDAD} value={prv.ESP_ESPECIALIDAD}>
                                                {prv.ESP_ESPECIALIDAD}
                                                </option>
                                            ))}
                                        </select>
                                </div>
                                <div className="col-span-2 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1" htmlFor="tecid">Técnicos Disponibles (*)</label>
                                    <select
                                        id="tecid"
                                        value={tecid}
                                        onChange={(e) => setTecid(e.target.value)}
                                        className="input_field"
                                    >
                                        <option value="">Seleccionar técnico</option>
                                        {combotecnicos.length === 0 ? (
                                            <option value="" disabled>No hay ningún técnico que aplique a especialidad</option>
                                        ) : (
                                            combotecnicos.map(tec => (
                                                <option key={tec.USR_ID} value={tec.USR_ID}>
                                                    {tec.TECNICO}
                                                </option>
                                            ))
                                        )}
                                    </select>
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
                title="Asignar Especialidad Técnico"
            >
                    <PlusIcon className="w-5 h-5" />
            </button>
        </>
    );
}

export default agregaEspecialidad;