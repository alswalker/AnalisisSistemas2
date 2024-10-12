"use client"; // Asegura que este componente es un Client Component

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import {
    DocumentPlusIcon   ,
    TrashIcon,
    PencilIcon,
    XCircleIcon ,
    ArrowDownTrayIcon,
    PlusIcon
  } from '@heroicons/react/24/solid';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";

function CrudEquipo() {
    const [modal, setModal] = useState(false);
    const [labelText, setLabelText] = useState('Nuevo Equipo');
    const [proveedorId, setProveedorId] = useState('');
    const [equipo, setEquipo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [proveedorcombo, setproveedorcombo] = useState([]);

    useEffect(() => {
        comboProveedor();
    }, []);

    const comboProveedor = async () => {
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/proveedores`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Fetched proveedorcombo:', data); // Log para depuración
            setproveedorcombo(data);
        } catch (error) {
            console.error('Error fetching prioridadcombo:', error);
            setproveedorcombo([]); // En caso de error, asegurarse de que proveedores es un array vacío
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const camposVacios = [];
        
        if (!proveedorId) camposVacios.push('Proveedor');
        if (!equipo) camposVacios.push('Equipo');
        if (!categoria) camposVacios.push('Categoría');
        if (!precioUnitario) camposVacios.push('Precio Unitario');
    
        // Verificar si hay campos vacíos
        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }
    
        // Validar que el precio unitario sea numérico
        if (isNaN(precioUnitario)) {
            Swal.fire({
                icon: 'error',
                title: 'Campo inválido',
                text: 'Por favor ingresa un precio unitario numérico.',
            });
            return;
        }
    
        try {
            const url = `${getIpApis()}/helpers/insert/equipos`;
    
            const equipoData = {
                idProveedor: proveedorId,
                Equipo: equipo,
                Categoria: categoria,
                PrecioUnitario: parseFloat(precioUnitario)
            };
    
            // console.log(equipoData)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipoData)
            });
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro registrado correctamente!'
                }).then(function () {
                    window.location.reload();
                    setModal(false);
                });
            } else {
                throw new Error('Error al guardar el equipo');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar el equipo',
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
                    <div className="flex flex-col items-center">
                        <hr className="w-full border-black mb-4" />
                        <p className="text-sm text-gray-500 mb-6 text-center">Campos Obligatorios: (*)</p>
                        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1" htmlFor="proveedorId">Proveedor (*)</label>
                                    <select
                                            id="proveedorId"
                                            value={proveedorId}
                                            onChange={(e) => setProveedorId(e.target.value)}
                                            className="input_field"
                                        >
                                            <option value="">Selecciona el proveedor</option>
                                            {proveedorcombo.map((prv) => (
                                                <option key={prv.PRV_ID} value={prv.PRV_ID}>
                                                    {prv.PRV_NOMBRE_COMERCIAL}
                                                </option>
                                            ))}
                                        </select>
                                </div>
                                <div className="col-span-2 flex flex-col">
                                    <div className="flex items-center">
                                        <label className="text-[#8B8E98] text-xs font-semibold mb-1">Nombre del Equipo (*)</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={equipo}
                                        placeholder="ingresa el nombre del equipo"
                                        onChange={(e) => setEquipo(e.target.value)}
                                        className="input_field"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Categoria (*)</label>
                                    <input
                                        type="text"
                                        value={categoria}
                                        placeholder="ingresa la categoria"
                                        onChange={(e) => setCategoria(e.target.value)}
                                        className="input_field"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Precio Unitario (*) </label>
                                    <input
                                        type="text"
                                        value={precioUnitario}
                                        placeholder="ingresa el precio unitario del equipo"
                                        onChange={(e) => setPrecioUnitario(e.target.value)}
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

export default CrudEquipo;
