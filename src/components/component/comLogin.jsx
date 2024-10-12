"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from '@/components/AuthContext'
import Swal from 'sweetalert2'
import { Eye, EyeOff } from "lucide-react"
import logo from "@/app/icons/helpdesk.png"

export default function Component() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!username || !password) {
      Swal.fire({
        icon: 'info',
        title: 'Campo inválido',
        text: 'Por favor, ingresa todos los campos.',
      })
      return
    }

    login({ Username: username, Password: password })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="grid grid-cols-2 min-h-screen">
      <div className="bg-[#003865] flex items-center justify-center">
        <Image 
          src={logo}
          alt="Login Image"
          className="max-w-[400px] max-h-[400px] object-contain"
          width={800}
          height={800}
        />
      </div>
      <div className="bg-white m-auto p-8 rounded-lg shadow-lg">
        <form className="w-full max-w-md space-y-4" onSubmit={handleLogin}>
          <h2 className="text-2xl font-semibold text-center text-[#003865]">Portal de Autogestión Help Desk</h2>
          <div className="space-y-2">
            <label htmlFor="username" className="block text-black mb-1 text-[#003865]">Usuario</label>
            <input 
              id="username" 
              placeholder="ingresa tu usuario..." 
              className="w-full p-2 rounded border border-black text-black" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-black mb-1 text-[#003865]">Contraseña</label>
            <div className="relative">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="ingresa tu contraseña..." 
                className="w-full p-2 rounded border border-black text-black pr-10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#003865] text-white py-2 px-4 rounded mr-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}