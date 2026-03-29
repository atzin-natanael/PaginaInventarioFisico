import express from 'express';
 import { inicio, guardarCodigo, mostrarArticulosInventario, Excel, admin , mostrarInventarioForm, eliminarArticulo} from '../controllers/appControllers.js';

 const router = express.Router();

router.get('/', inicio);
router.post('/', guardarCodigo)
router.get('/mostrarTabla/:id', mostrarArticulosInventario);
router.post('/eliminar-articulo/:id', eliminarArticulo);
router.get('/mostrarTabla/', mostrarInventarioForm);
router.get('/Excel/:id', Excel);
router.get('/admin', admin)
export default router;