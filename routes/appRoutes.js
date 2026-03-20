import express from 'express';
 import { inicio, guardarCodigo } from '../controllers/appControllers.js';

 const router = express.Router();

router.get('/', inicio);
router.post('/', guardarCodigo)
export default router;