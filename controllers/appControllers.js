import { check, validationResult } from 'express-validator'
const inicio= (req, res) =>{
    res.render('inicio');
}
const guardarCodigo= async(req, res) =>{
    const {colector, zona, codigo, descripcion, cantidad} = req.body;
    await check('colector').notEmpty().withMessage('El colector es obligatorio').run(req)
    await check('zona').notEmpty().withMessage('La zona es obligatoria').run(req)
    await check('codigo').notEmpty().withMessage('El codigo es obligatorio').run(req)
    //await check('cantidad').notEmpty().withMessage('La cantidad es obligatoria').run(req)
    await check('cantidad').isNumeric().withMessage('La cantidad debe ser válida').run(req)

    // 1. Validar que no esté vacío
    await check('descripcion').notEmpty().withMessage('El código no se ha verificado').run(req);

    // 2. Validar que NO diga "PRODUCTO NO REGISTRADO"
    await check('descripcion')
        .not().equals('❌ PRODUCTO NO REGISTRADO')
        .withMessage('El código de artículo no existe en el sistema')
        .run(req);

    // 3. Validar que NO se haya quedado en "Buscando..." (por si el usuario fue muy rápido)
    await check('descripcion')
        .not().equals('Buscando producto...')
        .withMessage('Espera a que se cargue la descripción del producto')
        .run(req);
    let resultado = validationResult(req);
    //console.log(resultado)
    if (!resultado.isEmpty()) {
        // Si hay errores, volvemos a renderizar la página con las alertas
        return res.render('inicio', {
            errores: resultado.array(),
            datos: req.body // Enviamos los datos para que no se borre lo que el usuario ya escribió
        });
    }
    console.log(req.body);
    res.render('tabla') = (req, res)=>{
        pagina = 'exito';
    }
}
export {
    inicio,
    guardarCodigo
}