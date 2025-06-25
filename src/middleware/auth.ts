import { Response, NextFunction } from "express";
import {
  AuthenticatedRequest,
  AuthMiddleware,
  ErrorResponse,
} from "../types/interfaces";

/**
 * Middleware de autenticación para verificar el token de acceso
 */
export const authenticateRequest: AuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader: string | undefined = req.headers.authorization;
  const secretKey: string | undefined = process.env.SECRET_ACCESS_GENERATOR_KEY;

  if (!authHeader) {
    const errorResponse: ErrorResponse = {
      error: "Token de autorización requerido",
      message:
        "Debe proporcionar un token de autorización en el header Authorization",
      timestamp: new Date().toISOString(),
    };
    res.status(401).json(errorResponse);
    return;
  }

  if (!secretKey) {
    console.error(
      "SECRET_ACCESS_GENERATOR_KEY no está configurada en las variables de entorno"
    );
    const errorResponse: ErrorResponse = {
      error: "Error de configuración del servidor",
      message: "Configuración de seguridad faltante",
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
    return;
  }

  if (authHeader !== secretKey) {
    const errorResponse: ErrorResponse = {
      error: "Token de autorización inválido",
      message: "El token proporcionado no es válido",
      timestamp: new Date().toISOString(),
    };
    res.status(401).json(errorResponse);
    return;
  }

  // Añadir información de usuario autenticado
  req.user = {
    authenticated: true,
    timestamp: Date.now(),
  };

  next();
};
