import express from 'express';
 import { inicio, guardarCodigo, mostrarArticulosInventario } from '../controllers/appControllers.js';

 const router = express.Router();

router.get('/', inicio);
router.post('/', guardarCodigo)
router.get('/mostrarTabla/:id', mostrarArticulosInventario);
export default router;