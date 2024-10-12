import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { getIpApis } from '../configip';
import { DocumentIcon, TableCellsIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import Excel from "../../../../public/excel.svg";
import PDF from "../../../../public/pdf-svgrepo-com.svg";
import CSV from "../../../../public/csv_icon.svg";
import Image from "next/image";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function GenerarReporte() {
  const [reportes, setReportes] = useState([]);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    consultaReportes();
  }, []);

  const consultaReportes = async () => {
    try {
      const response = await fetch(`${getIpApis()}/helpers/read/reportes`);
      const data = await response.json();
      setReportes(data);
    } catch (error) {
      console.error('Error fetching setReportes:', error);
    }
  };

  const handleReporteChange = (event) => {
    const selectedId = event.target.value;
    const selected = reportes.find(r => r.REP_ID === parseInt(selectedId));
    setSelectedReporte(selected);

    if (selectedId === "") {
      setFiltros({});
      setTableData([]); // Limpiar tabla si no hay reporte seleccionado
    } else {
      const initialFiltros = {};

      if (selected.REP_FILTROS && selected.REP_FILTROS.trim() !== "") {
        selected.REP_FILTROS.split(',').forEach(filtro => {
          initialFiltros[filtro] = "";
        });
      }

      setFiltros(initialFiltros);
    }
  };


  const handleFiltroChange = (filtro, valor) => {
    setFiltros(prev => ({ ...prev, [filtro]: valor }));
  };

  const renderFiltros = () => {
    if (!selectedReporte) return null;

    if (!selectedReporte.REP_FILTROS || selectedReporte.REP_FILTROS.trim() === "") {
        return null; // No hacemos nada si no hay filtros
    }

    return selectedReporte.REP_FILTROS.split(',').map(filtro => {
      if (filtro.includes("fecha")) {
        return (
          <input
            key={filtro}
            type="date"
            value={filtros[filtro] || ""}
            onChange={(e) => handleFiltroChange(filtro, e.target.value)}
            className="w-full p-2 border rounded-md mt-2 text-sm input_field"
          />
        );
      } else {
        return (
          <input
            key={filtro}
            type="text"
            placeholder={`Ingrese ${filtro}`}
            value={filtros[filtro] || ""}
            onChange={(e) => handleFiltroChange(filtro, e.target.value)}
            className="w-full p-2 border rounded-md mt-2 text-sm input_field"
          />
        );
      }
    });
  };

  const renderRequisito = () => {
    if (!selectedReporte || !selectedReporte.REP_REQUISITO) return null;

    return (
        <div className="bg-yellow-100 p-3 rounded-md mt-4">
        <p className="text-yellow-800 text-sm">
          <strong>
            Filtros del reporte (*):<br />
          </strong>
          {selectedReporte.REP_REQUISITO}
        </p>
      </div>
    );
  };

  const generarReporte = () => {
    if (!selectedReporte) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor, selecciona un reporte antes de generar.',
      });
      return;
    }

    const payload = {
      procedure: selectedReporte.REP_SP,
      filtros: filtros
    };

    axios.post(`${getIpApis()}/helpers/genera/reporte`, payload)
      .then(response => {
        const data = response.data;
        setTableData(data);

        if (data.length > 0) {
          const generatedColumns = Object.keys(data[0]).map(key => ({
            name: key,
            selector: row => row[key],
            sortable: true,
            width: '300px'
          }));
          setColumns(generatedColumns);
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin registros',
            text: 'No hay registros que cumplan con las condiciones del reporte.',
          });
        }
      })
      .catch(error => {
        console.error("Error al generar reporte:", error);
      });
  };

  function obtenerFechaActual() {
        const ahora = new Date();
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const anio = ahora.getFullYear();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const segundos = String(ahora.getSeconds()).padStart(2, '0');

        return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  }

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: columns.length > 4 ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4',
    });
  
    // Logo en formato base64
    const logo = 'data:image/jpeg;base64,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'; // logo en base64
    const fechaActual = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `${selectedReporte.REP_NOMBRE}_${fechaActual}.pdf`;
  
    // Ajustamos la fuente y tamaño inicial
    doc.setFontSize(12);
  
    // Agregamos el logo en el PDF
    doc.addImage(logo, 'JPEG', 40, 20, 75, 50); // (imagenBase64, formato, x, y, ancho, alto) 475 antes
  
    // Título del reporte
    doc.text(`${selectedReporte.REP_NOMBRE} ${obtenerFechaActual()}`, 40, 90);
  
    // Ajusta el tamaño del texto según la cantidad de columnas
    const fontSize = columns.length > 6 ? 8 : 10;
    doc.setFontSize(fontSize);
  
    // Preparamos los datos de la tabla
    const bodyData = tableData.map(row => columns.map(col => row[col.name]));
  
    // Generamos la tabla con auto ajuste
    doc.autoTable({
      head: [columns.map(col => col.name)],
      body: bodyData,
      startY: 100,  // Ajustamos el inicio para dejar espacio al logo y título
      styles: {
        fontSize: fontSize,
        overflow: 'linebreak',
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 'wrap' },
        ...columns.reduce((acc, _, idx) => {
          acc[idx] = { cellWidth: columns.length > 4 ? 'auto' : 'wrap' };
          return acc;
        }, {}),
      },
      theme: 'grid',
      headStyles: { fillColor: [0, 56, 101], textColor: [255, 255, 255] },
      tableWidth: 'auto',
      didDrawPage: function (data) {
        // Añadir el número de página al pie de cada página
        const pageHeight = doc.internal.pageSize.height; // Altura total de la página
        const footerY = pageHeight - 20; // Posición del pie
        doc.setFontSize(12);
        doc.text(`Página ${data.pageNumber}`, 40, footerY);
     },
    });
  
    // Guardamos el PDF
    doc.save(nombreArchivo);
  };
  

  const exportExcel = async () => {
    const fechaActual = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `${selectedReporte.REP_NOMBRE}_${fechaActual}.xlsx`;

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Reporte_${fechaActual}`);

    // Definir estilos para el encabezado
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } }, // Texto blanco
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003865' } }, // Fondo azul
        alignment: { horizontal: 'center', vertical: 'middle' } // Texto centrado
    };

    // Agregar los encabezados de las columnas
    worksheet.columns = columns.map(col => ({
        header: col.name, // Nombre de la columna
        key: col.name,
        width: 20 // Ancho de la columna
    }));

    // Aplicar el estilo de encabezado a cada celda de la primera fila
    worksheet.getRow(1).eachCell(cell => {
        cell.style = headerStyle;
    });

    // Agregar los datos de las filas
    tableData.forEach(row => {
        const dataRow = {};
        columns.forEach(col => {
            dataRow[col.name] = row[col.name];
        });
        worksheet.addRow(dataRow);
    });

    // Generar el archivo Excel y guardarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
 };

    const exportCSV = () => {
        const fechaActual = new Date().toISOString().slice(0, 10);
        const nombreArchivo = `${selectedReporte.REP_NOMBRE}_${fechaActual}.csv`;
        
        const csvData = [
        columns.map(col => col.name), // Encabezados
        ...tableData.map(row => columns.map(col => row[col.name])) // Filas
        ];

        const csvContent = csvData.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, nombreArchivo);
  };

  

  return (
    <div className="flex justify-center items-start h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-[#003865] text-2xl font-bold mb-4 text-center">Reportes y Filtros</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-3 md:max-w-lg mx-auto">
          <select 
            onChange={handleReporteChange} 
            className="w-full p-2 border rounded-md text-sm mb-4"
          >
            <option value="">Seleccione un reporte</option>
            {reportes.map(reporte => (
              <option key={reporte.REP_ID} value={reporte.REP_ID}>
                {reporte.REP_NOMBRE}
              </option>
            ))}
          </select>
          {renderRequisito()}
          {renderFiltros()}
  
          <div className="mt-5 text-center">
            <button 
              onClick={generarReporte} 
              className="bg-[#003865] text-white py-2 px-4 rounded"
              title="Generar Reporte"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
  
        {tableData.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-3">
            <div>
              <p className="text-center font-semibold text-lg mb-2">Vista Previa</p> {/* Texto agregado */}
              <div className="flex justify-end space-x-2 mb-2">
                <button onClick={exportPDF} title="Exportar en PDF">
                  <Image src={PDF} width={30} height={30} alt="Exportar PDF" />
                </button>
                <button onClick={exportExcel} title="Exportar en Excel">
                  <Image src={Excel} width={30} height={30} alt="Exportar Excel" />
                </button>
                <button onClick={exportCSV} title="Exportar en CSV">
                  <Image src={CSV}  width={35} height={35} alt="CSV"/>
                </button>
              </div>
              <DataTable
                columns={columns}
                data={tableData}
                pagination
                highlightOnHover
                striped
                paginationPerPage={10}
                noDataComponent="No hay registros para mostrar" 
                paginationComponentOptions={{
                  rowsPerPageText: 'Registros por página:',
                  rangeSeparatorText: 'de',
                  noRowsPerPage: false,
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                style={{ maxWidth: '800px' }} // Cambia el tamaño máximo aquí
              />
            </div>
            </div>
          )}
      </div>
    </div>
  );
}
