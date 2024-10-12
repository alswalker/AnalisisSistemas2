import { EyeIcon, UserIcon, CalendarIcon, BookmarkIcon, ClipboardDocumentIcon, ArrowUturnLeftIcon, ListBulletIcon, WrenchIcon, TicketIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

export default function DetalleConocimiento({ selectedRecord, setActiveComponent }) {
    const navigate = useNavigate();

    if (!selectedRecord) return null;

    const handleTicketClick = (ticketNumber) => {
        navigate(`/atencionticket?ticket=${ticketNumber}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#003865] mb-6">Detalles del Conocimiento</h2>
            
            {/* Información General */}
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <BookmarkIcon className="w-6 h-6 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Título</h3>
                </div>
                <p className="text-gray-800">{selectedRecord.CON_TITULO}</p>

                <div className="flex items-center space-x-2">
                    <ListBulletIcon className="w-6 h-6 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Descripción del Problema</h3>
                </div>
                <p className="text-gray-800">{selectedRecord.CON_DESCRIPCION}</p>

                <div className="flex items-center space-x-2">
                    <WrenchIcon className="w-6 h-6 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Solución Propuesta</h3>
                </div>
                <p className="text-gray-800">{selectedRecord.CON_SOLUCION}</p>

                {/* Referencia */}
                {selectedRecord.REFERENCIA && (
                    <div className="flex items-center space-x-2">
                        <TicketIcon className="w-6 h-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-700">Ticket de Referencia:</h3>
                        <a 
                            href="#" 
                            className="text-blue-600 hover:underline" 
                            onClick={() => handleTicketClick(selectedRecord.REFERENCIA)}
                        >
                            {selectedRecord.REFERENCIA}
                        </a>
                    </div>
                )}
            </div>

            {/* Información Adicional */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Visitas:</span>
                    </div>
                    <p className="text-gray-800">{selectedRecord.CON_VISITAS}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Fecha de Creación:</span>
                    </div>
                    <p className="text-gray-800">{selectedRecord.FECHA_CREACION}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Autor:</span>
                    </div>
                    <p className="text-gray-800">{selectedRecord.AUTOR}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BookmarkIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Categoría:</span>
                    </div>
                    <p className="text-gray-800">{selectedRecord.CATEGORIA}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ClipboardDocumentIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Estatus:</span>
                    </div>
                    <p className="text-gray-800">{selectedRecord.ESTATUS}</p>
                </div>
            </div>

            {/* Botón de Volver */}
            <div className="mt-8 text-center">
                <button
                    className="bg-[#003865] text-white py-2 px-6 rounded-md hover:bg-[#002845] transition duration-300"
                    onClick={() => setActiveComponent('consulta')} // Volver a la lista
                    title="Regresar"
                >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
