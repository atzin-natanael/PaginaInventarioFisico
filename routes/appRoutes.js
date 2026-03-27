import express from 'express';
 import { inicio, guardarCodigo, mostrarArticulosInventario, Excel } from '../controllers/appControllers.js';

 const router = express.Router();

router.get('/', inicio);
router.post('/', guardarCodigo)
router.get('/mostrarTabla/:id', mostrarArticulosInventario);
router.get('/Excel/:id', Excel);
export default router;