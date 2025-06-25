import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import contadorRoutes from "./routes/contador";
import { ErrorResponse, AppConfig } from "./types/interfaces";
import { cerrarConexionDB } from "./controllers/contadorController";

// Configurar variables de entorno
dotenv.config();

const app: Application = express();

// Configuración de la aplicación
const config: AppConfig = {
  port: parseInt(process.env.PORT || "4001", 10),
  secretKey: process.env.SECRET_ACCESS_GENERATOR_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de requests (opcional)
app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use("/contador", contadorRoutes);

// Ruta de salud del servidor
app.get("/health", (req: Request, res: Response): void => {
  res.status(200).json({
    status: "OK",
    message: "Servidor de generador de códigos funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.nodeEnv,
  });
});

// Ruta de información de la API
app.get("/", (req: Request, res: Response): void => {
  res.status(200).json({
    message: "API Generador de Códigos SIASIS",
    version: "1.0.0",
    environment: config.nodeEnv,
    endpoints: {
      "GET /contador/generar":
        "Genera el siguiente código para un tipo de artefacto",
      "GET /contador/estado":
        "Obtiene el estado actual de todos los contadores",
      "GET /health": "Verifica el estado del servidor",
    },
    queryParams: {
      TipoDeArtefacto: "Valores válidos: TP, TE, TC, BUG",
    },
    headers: {
      Authorization: "Token de acceso requerido para endpoints protegidos",
    },
    ejemploUso: {
      url: "/contador/generar?TipoDeArtefacto=TP",
      headers: {
        Authorization: "tu_token_secreto",
      },
    },
  });
});

// Ruta de 404 NOT FOUND
app.use("*", (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: "Ruta no encontrada",
    message: `La ruta ${req.originalUrl} no existe en este servidor`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json({
    ...errorResponse,
    rutasDisponibles: [
      "GET /",
      "GET /health",
      "GET /contador/generar",
      "GET /contador/estado",
    ],
  });
});

// Manejo global de errores
app.use(
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error("Error no controlado:", error);

    const errorResponse: ErrorResponse = {
      error: "Error interno del servidor",
      message: "Ha ocurrido un error inesperado",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
);

// Función para iniciar el servidor
const startServer = (): void => {
  const server = app.listen(config.port, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
    console.log(`📊 API Generador de Códigos SIASIS lista`);
    console.log(`🔗 URL: http://localhost:${config.port}`);
    console.log(`📚 Documentación: http://localhost:${config.port}/`);
    console.log(`🌍 Entorno: ${config.nodeEnv}`);

    // Verificar variables de entorno críticas
    if (!config.secretKey) {
      console.warn(
        "⚠️  ADVERTENCIA: SECRET_ACCESS_GENERATOR_KEY no está configurada"
      );
    }
    if (!config.databaseUrl) {
      console.warn("⚠️  ADVERTENCIA: DATABASE_URL no está configurada");
    }
  });

  // Manejo de cierre ordenado del servidor
  const gracefulShutdown = (signal: string) => {
    console.log(
      `\n📴 Recibida señal ${signal}. Cerrando servidor ordenadamente...`
    );

    server.close(async () => {
      console.log("📴 Servidor HTTP cerrado");

      try {
        await cerrarConexionDB();
        console.log("📴 Conexión a base de datos cerrada");
      } catch (error) {
        console.error("❌ Error al cerrar conexión a BD:", error);
      }

      console.log("✅ Cierre ordenado completado");
      process.exit(0);
    });
  };

  // Escuchar señales de cierre
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

// Iniciar el servidor solo si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

export default app;
