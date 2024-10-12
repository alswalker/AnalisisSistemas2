"use client"; // Asegura que este componente es un Client Component

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getIpApis } from '../configip';
import {
    DocumentPlusIcon   ,
    XCircleIcon ,
    PlusIcon
  } from '@heroicons/react/24/solid';
import Image from "next/image";
import logo from "@/app/icons/helpdesk.png";

function CrudProveedor() {
    const [modal, setModal] = useState(false);
    const [labelText, setLabelText] = useState('Nuevo Proveedor');
    const [nombrecomercial, setNombreComercial] = useState('');
    const [razonsocial, setrazonSocial] = useState('');
    const [direccion, setDireccion] = useState('');
    const [nit, setNit] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');


    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [selectedDepartamento, setSelectedDepartamento] = useState(null);

    const [municipio, setMunicipio] = useState('');



    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const response = await fetch(`${getIpApis()}/helpers/combos/departamento`);
                const data = await response.json();
                setDepartamentos(data);
            } catch (error) {
                console.error('Error al cargar departamentos:', error);
            }
        };
    
        fetchDepartamentos();
    }, []);
    
    const handleDepartamentoChange = async (event) => {
        const depaId = event.target.value;
        setSelectedDepartamento(depaId);
    
        try {
            const response = await fetch(`${getIpApis()}/helpers/combos/municipio?depaid=${depaId}`);
            const data = await response.json();
            setMunicipios(data);
        } catch (error) {
            console.error('Error al cargar municipios:', error);
        }
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const camposVacios = [];
        
        if (!nombrecomercial) camposVacios.push('Nombre Comercial');
        if (!razonsocial) camposVacios.push('Nombre Comercial');
        if (!nit) camposVacios.push('NIT');
        if (!direccion) camposVacios.push('Dirección');

        if (camposVacios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: `Por favor completa todos los campos: ${camposVacios.join(', ')}.`,
            });
            return;
        }
    
        // Validar que el teléfono sea numérico y no contenga guiones
        if (!/^\d+$/.test(telefono)) {
            Swal.fire({
                icon: 'error',
                title: 'Campo inválido',
                text: 'Por favor ingresa un teléfono válido sin guiones.',
            });
            return;
        }
    
        try {
            const url = `${getIpApis()}/helpers/insert/proveedores`;
    
            const proveedorData = {
                nombrecomercial: nombrecomercial,
                razonsocial: razonsocial,
                direccion: direccion,
                nit: nit,
                telefono: telefono,
                correo: correo,
                depaid : selectedDepartamento ,
                muniid : municipio 
            };
    
            // console.log(proveedorData)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proveedorData)
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
                    <div className="flex flex-col items-center">
                        <hr className="w-full border-black mb-4" />
                        <p className="text-sm text-gray-500 mb-6 text-center">Campos Obligatorios: (*)</p>
                        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">NIT (*)</label>
                                    <input
                                        type="text"
                                        value={nit}
                                        // placeholder="ingresa el NIT"
                                        onChange={(e) => setNit(e.target.value)}
                                        className="input_field w-full"  // Hacemos que el input ocupe todo el ancho
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <label className="text-[#8B8E98] text-xs font-semibold mb-1">Teléfono</label>
                                        <span className="text-[#8B8E98] text-xs ml-2">(Sin Guiones)</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={telefono}
                                        // placeholder="ingresa un telefono válido"
                                        onChange={(e) => setTelefono(e.target.value)}
                                        className="input_field w-full"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={correo}
                                        // placeholder="ingresa el correo electrónico"
                                        onChange={(e) => setCorreo(e.target.value)}
                                        className="input_field w-full"
                                    />
                                </div>
                                <div className="col-span-3 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Nombre Comercial (*)</label>
                                    <input
                                        type="text"
                                        value={nombrecomercial}
                                        placeholder="ingresa el nombre comercial"
                                        onChange={(e) => setNombreComercial(e.target.value)}
                                        className="input_field w-full"
                                    />
                                </div>
                                <div className="col-span-3 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Razon Social (*)</label>
                                    <input
                                        type="text"
                                        value={razonsocial}
                                        placeholder="ingresa la razón social"
                                        onChange={(e) => setrazonSocial(e.target.value)}
                                        className="input_field w-full"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Departamento (*)</label>
                                    <select
                                        value={selectedDepartamento || ''}
                                        onChange={handleDepartamentoChange}
                                        className="input_field w-full"
                                    >
                                        <option value="">Selecciona un departamento</option>
                                        {departamentos.map(dep => (
                                            <option key={dep.DEP_ID} value={dep.DEP_ID}>
                                                {dep.DEP_NOMBRE}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Municipio (*)</label>
                                    <select
                                        value={municipio || ''}
                                        onChange={(e) => setMunicipio(e.target.value)}
                                        className="input_field w-full"
                                    >
                                        <option value="">Selecciona un municipio</option>
                                        {municipios.map(muni => (
                                            <option key={muni.MUN_ID} value={muni.MUN_ID}>
                                                {muni.MUN_NOMBRE}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-3 flex flex-col">
                                    <label className="block text-[#8B8E98] text-xs font-semibold mb-1">Dirección Completa (*)</label>
                                    <textarea
                                        value={direccion}
                                        placeholder="ingresa la dirección exacta"
                                        onChange={(e) => setDireccion(e.target.value)}
                                        className="input_field w-full h-24"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-green-700 text-white py-2 px-4 rounded mr-2"
                                    title="Guardar nuevo registro"
                                >
                                    <DocumentPlusIcon className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    className="bg-red-700 text-white py-2 px-4 rounded"
                                    onClick={handleCloseModal}
                                    title="Cancelar"
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
                className="bg-[#003865] text-white py-2 px-4 rounded"
                onClick={handleOpenModal}
                title="Nuevo Registro"
            >
                    <PlusIcon className="w-5 h-5" />
            </button>
        </>
    );
}

export default CrudProveedor;