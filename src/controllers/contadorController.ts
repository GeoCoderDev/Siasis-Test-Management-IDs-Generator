import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import {
  TiposDeArtefactos,
  AuthenticatedRequest,
  GenerarCodigoResponse,
  EstadoContadoresResponse,
  ErrorResponse,
  ContadorDB,
  ContadorInfo,
  ControllerFunction,
} from "../types/interfaces";

const prisma = new PrismaClient();

/**
 * Inicializa los contadores si no existen
 */
const inicializarContadores = async (): Promise<void> => {
  const tiposContadores: string[] = Object.values(TiposDeArtefactos);

  for (const tipo of tiposContadores) {
    const contadorExistente: ContadorDB | null =
      await prisma.t_Contadores.findFirst({
        where: { Nombre_Contador: tipo },
      });

    if (!contadorExistente) {
      await prisma.t_Contadores.create({
        data: {
          Nombre_Contador: tipo,
          Contador: 1,
        },
      });
      console.log(`Contador inicializado para tipo: ${tipo}`);
    }
  }
};

/**
 * Valida si un tipo de artefacto es válido
 */
const esTipoArtefactoValido = (
  tipo: string
): tipo is keyof typeof TiposDeArtefactos => {
  return Object.values(TiposDeArtefactos).includes(tipo as TiposDeArtefactos);
};

/**
 * Genera el siguiente código para un tipo de artefacto
 */
export const generarSiguienteCodigo: ControllerFunction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const tipoDeArtefacto: string | undefined = req.query
      .TipoDeArtefacto as string;

    // Validar que el tipo de artefacto sea proporcionado
    if (!tipoDeArtefacto) {
      const errorResponse: ErrorResponse = {
        error: "Parámetro requerido",
        message: "El parámetro TipoDeArtefacto es obligatorio",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Validar que el tipo de artefacto sea válido
    if (!esTipoArtefactoValido(tipoDeArtefacto)) {
      const tiposValidos: string[] = Object.values(TiposDeArtefactos);
      const errorResponse: ErrorResponse = {
        error: "Tipo de artefacto inválido",
        message: `El tipo debe ser uno de: ${tiposValidos.join(", ")}`,
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Asegurar que los contadores estén inicializados
    await inicializarContadores();

    // Buscar el contador existente
    let contador: ContadorDB | null = await prisma.t_Contadores.findFirst({
      where: { Nombre_Contador: tipoDeArtefacto },
    });

    if (!contador) {
      // Crear el contador si no existe (esto no debería pasar después de la inicialización)
      contador = await prisma.t_Contadores.create({
        data: {
          Nombre_Contador: tipoDeArtefacto,
          Contador: 1,
        },
      });
    } else {
      // Incrementar el contador existente
      contador = await prisma.t_Contadores.update({
        where: { Id_Contador: contador.Id_Contador },
        data: { Contador: { increment: 1 } },
      });
    }

    // Generar el código final
    const codigoGenerado: string = `SIASIS-${tipoDeArtefacto}-${contador.Contador}`;

    const response: GenerarCodigoResponse = {
      success: true,
      codigo: codigoGenerado,
      tipo: tipoDeArtefacto,
      numero: contador.Contador,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al generar código:", error);

    const errorResponse: ErrorResponse = {
      error: "Error interno del servidor",
      message: "No se pudo generar el código",
      timestamp: new Date().toISOString(),
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    };

    res.status(500).json(errorResponse);
  }
};

/**
 * Obtiene el estado actual de todos los contadores
 */
export const obtenerEstadoContadores: ControllerFunction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await inicializarContadores();

    const contadores: ContadorDB[] = await prisma.t_Contadores.findMany({
      orderBy: { Nombre_Contador: "asc" },
    });

    const estadoContadores: ContadorInfo[] = contadores.map(
      (contador: ContadorDB) => ({
        tipo: contador.Nombre_Contador,
        valorActual: contador.Contador,
        proximoCodigo: `SIASIS-${contador.Nombre_Contador}-${
          contador.Contador + 1
        }`,
      })
    );

    const response: EstadoContadoresResponse = {
      success: true,
      contadores: estadoContadores,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener estado de contadores:", error);

    const errorResponse: ErrorResponse = {
      error: "Error interno del servidor",
      message: "No se pudo obtener el estado de los contadores",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
};

// Función para cerrar la conexión de Prisma de manera ordenada
export const cerrarConexionDB = async (): Promise<void> => {
  await prisma.$disconnect();
};
