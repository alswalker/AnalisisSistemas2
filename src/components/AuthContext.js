import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { getIpApis } from '@/components/component/configip';
import Swal from 'sweetalert2';

const AuthContext = createContext({
  user: null,
  isLoading: true, // Agrega `isLoading` al contexto
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(null);
  const navigate = useNavigate(); // Define useNavigate aquí

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const currentPath = sessionStorage.getItem('currentPath');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (currentPath) {
      navigate(currentPath); // Navega a la ruta guardada
    }
  }, [navigate]);

  const login = async (loginData) => {
    try {
      const url = `${getIpApis()}/helpers/login/usuarios`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        const result = await response.json();
        if (result === "Autenticación exitosa") {
          sessionStorage.setItem('user', JSON.stringify(loginData));
          setUser(loginData);
          const savedPath = sessionStorage.getItem('currentPath') || '/dashboard';
          navigate(savedPath); // Navega a la ruta guardada o a /dashboard
        } else if (result === "Contraseña incorrecta") {
          Swal.fire({
            icon: 'error',
            title: 'Login erróneo',
            text: 'Usuario o contraseña incorrectos.',
          });
        } else if (result === "Clave errónea, número de intentos excedido") {
          Swal.fire({
            icon: 'warning',
            title: 'Usuario Bloqueado',
            text: 'Número de intentos excedido.',
          });
        }
      } else {
        alert('Error en la autenticación');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const logout = () => {
    clearTimeout(timer);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('currentPath'); // Limpia la ruta guardada
    setUser(null);
    // alert('Sesión expirada... Logout');
    navigate('/'); // Navega al login
    // window.location.reload();
  };

  const handleSessionTimeout = () => {
    clearTimeout(timer);
    logout();
  };

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    if (user) {
      const newTimer = setTimeout(handleSessionTimeout, 900000); //15 minutos
      // const newTimer = setTimeout(handleSessionTimeout, 240000); // Tiempo de 4 minutos

      setTimer(newTimer);
    }
  };

  useEffect(() => {
    if (user) {
      resetTimer();

      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
    } else {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
