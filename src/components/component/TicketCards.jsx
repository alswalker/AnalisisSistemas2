import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { getIpApis } from '@/components/component/configip';
import { BellAlertIcon, FolderOpenIcon} from '@heroicons/react/24/solid';

const fetchTicketData = async (endpoint, username, setData) => {
  try {
    const response = await fetch(`${getIpApis()}${endpoint}?idUsuario=${username}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    setData([{ descripcion: 'Error', total: 0 }]);
  }
};

const TicketCards = () => {
  const { user } = useAuth();
  const [pendingTickets, setPendingTickets] = useState([{ descripcion: 'Cargando...', total: 0 }]);
  const [inProgressTickets, setInProgressTickets] = useState([{ descripcion: 'Cargando...', total: 0 }]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.Username) {
      fetchTicketData('/helpers/pendientes/tickets', user.Username, setPendingTickets);
      fetchTicketData('/helpers/enproceso/tickets', user.Username, setInProgressTickets);
    }
  }, [user]);

  const handleCardClick = (count, route) => {
    if (count > 0) {
      navigate(route);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {pendingTickets.map((ticket, index) => (
        <div
          key={index}
          className={`card bg-[#003865] text-white p-6 rounded-lg cursor-pointer ${ticket.total === 0 ? 'cursor-not-allowed' : ''}`}
          onClick={() => handleCardClick(ticket.total, '/detallependientes')}
        >
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <BellAlertIcon className="w-12 h-12" />
            </div>
            <div className="text-lg">{ticket.descripcion}</div>
            <div className="text-4xl font-bold">{ticket.total}</div>
          </div>
        </div>
      ))}
      
      {inProgressTickets.map((ticket, index) => (
        <div
          key={index}
          className={`card bg-[#003865] text-white p-6 rounded-lg cursor-pointer ${ticket.total === 0 ? 'cursor-not-allowed' : ''}`}
          onClick={() => handleCardClick(ticket.total, '/detalleenproceso')}
        >
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <FolderOpenIcon className="w-12 h-12" />
            </div>
            <div className="text-lg">{ticket.descripcion}</div>
            <div className="text-4xl font-bold">{ticket.total}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketCards;
