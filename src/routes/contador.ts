import { Router } from "express";
import { authenticateRequest } from "../middleware/auth";
import {
  generarSiguienteCodigo,
  obtenerEstadoContadores,
} from "../controllers/contadorController";

const router: Router = Router();

/**
 * GET /contador/generar
 * Genera el siguiente código para un tipo de artefacto
 * Query params: TipoDeArtefacto (TP, TE, TC, BUG)
 * Headers: Authorization (debe coincidir con SECRET_ACCESS_GENERATOR_KEY)
 */
router.get("/generar", authenticateRequest, generarSiguienteCodigo);

/**
 * GET /contador/estado
 * Obtiene el estado actual de todos los contadores
 * Headers: Authorization (debe coincidir con SECRET_ACCESS_GENERATOR_KEY)
 */
router.get("/estado", authenticateRequest, obtenerEstadoContadores);

export default router;
