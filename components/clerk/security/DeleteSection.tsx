"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export const DeleteSection = () => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Función para solicitar contraseña y verificar antes de eliminar
  const requirePassword = async (callback: (password: string) => Promise<boolean>) => {
    try {
      const password = prompt("Por favor, introduce tu contraseña para confirmar esta acción")
      
      if (!password) {
        throw new Error("Se requiere contraseña para continuar")
      }
      
      return await callback(password)
    } catch (error) {
      console.error("Error durante la verificación de contraseña:", error)
      throw error
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await requirePassword(async (password) => {
        // Aquí se llamaría a la API para eliminar la cuenta
        // Por ejemplo:
        // await user.delete({ password });
        console.log("Cuenta eliminada con contraseña:", password)
        return true
      })
      // Cuenta eliminada con éxito
      // Redirigir al usuario a la página de inicio o mostrar un mensaje
      alert("Tu cuenta ha sido eliminada con éxito")
    } catch (error) {
      // Manejar error (contraseña incorrecta, error de API, etc.)
      console.error("Error al eliminar la cuenta:", error)
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium">Eliminar cuenta</h3>
      <p className="text-sm text-muted-foreground">
        Una vez que elimines tu cuenta, todos tus datos serán permanentemente eliminados.
        Esta acción no se puede deshacer.
      </p>
      
      {!showConfirmation ? (
        <Button
          variant="destructive"
          onClick={() => setShowConfirmation(true)}
        >
          Eliminar cuenta
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-destructive">
            ¿Estás seguro de que quieres eliminar permanentemente tu cuenta?
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Confirmar eliminación"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteSection;
