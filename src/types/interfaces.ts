import { NextFunction, Request, Response } from "express";

// Enum de tipos de artefactos
export enum TiposDeArtefactos {
  TEST_PLAN = "TP",
  TEST_EXECUTION = "TE",
  TEST_CASE = "TC",
  BUG = "BUG",
}

// Interfaces de respuesta de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  timestamp: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  details?: string;
}

export interface GenerarCodigoResponse {
  success: true;
  codigo: string;
  tipo: string;
  numero: number;
  timestamp: string;
}

export interface ContadorInfo {
  tipo: string;
  valorActual: number;
  proximoCodigo: string;
}

export interface EstadoContadoresResponse {
  success: true;
  contadores: ContadorInfo[];
  timestamp: string;
}

// Interfaces para base de datos
export interface ContadorDB {
  Id_Contador: number;
  Nombre_Contador: string;
  Contador: number;
}

// Interfaces extendidas de Express
export interface AuthenticatedRequest extends Request {
  user?: {
    authenticated: boolean;
    timestamp: number;
  };
}

// Tipos para middleware
export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ControllerFunction = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void> | void;

// Configuración de la aplicación
export interface AppConfig {
  port: number;
  secretKey: string;
  databaseUrl: string;
  nodeEnv: string;
}

// Tipos para validación
export type TipoArtefactoValid = keyof typeof TiposDeArtefactos;

// Error personalizado
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
