// src/components/component/comGraphs.js
"use client";
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { getIpApis } from './configip';

// Función para obtener los datos de la API
const fetchTicketsPorDepartamento = async (setData) => {
  try {
    const response = await fetch(`${getIpApis()}/helpers/graficos/ctdticketsdepa`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setData([]);
  }
};

const fetchServiciosRecurrentes = async (setData) => {
  try {
    const response = await fetch(`${getIpApis()}/helpers/graficos/serviciorecurrente`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setData([]);
  }
};


// Función para preparar los datos para el gráfico de pastel
const prepareDataForPieChart = (data) => {
  return data.map((item) => ({
    name: item.DEPARTAMENTO,
    value: item.CTD,
  }));
};

export const CardPastelTickets = ({ title }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTicketsPorDepartamento(setData); // Obtener datos al cargar el componente
  }, []);

  const pieChartData = prepareDataForPieChart(data);
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full">
      <div className="card bg-[#003865] text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" align="left" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  ); 
};

export const BarChartServiciosRecurrentes = ({ title }) => {
  const [data, setData] = useState([]);
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

  useEffect(() => {
    fetchServiciosRecurrentes(setData);
  }, []);

  return (
    <div className="w-full">
      <div className="card bg-[#003865] text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="Servicio" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Cantidad" fill="#000000">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};