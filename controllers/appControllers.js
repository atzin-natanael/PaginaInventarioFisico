import { check, validationResult } from 'express-validator'
const inicio= async (req, res) =>{
    const mostrar = await fetch(`http://localhost:3000/inventario/colectores`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }
        const colectores= await mostrar.json();
        return res.render('inicio', {
        pagina: 'Registro de Zonas',
        colectores: colectores
    });
}
const guardarCodigo= async(req, res) =>{
    const {colector, zona, codigo, descripcion, cantidad, almacen} = req.body;
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
    try {
        const data = {
            "colector": colector,
            "zona": zona,
            "codigo": codigo,
            "descripcion": descripcion,
            "cantidad": cantidad,
            "almacen": almacen
        };
        const respuesta = await fetch(`http://localhost:3000/inventario/guardarRegistro/`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Ahora usa 'respuesta' para todo lo que sigue
        const contentType = respuesta.headers.get("content-type"); 

        let result;
        if (contentType && contentType.includes("application/json")) {
            result = await respuesta.json();
        } else {
            const textError = await respuesta.text();
            throw new Error('Servidor devolvió HTML/Texto.');
        }
        console.log(`Buscando tabla para: ${colector}`);
        const mostrar = await fetch(`http://localhost:3000/inventario/mostrarTabla/${encodeURIComponent(colector)}`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }

        const tabla = await mostrar.json();
        return res.render('tabla', {
            pagina: 'Mostrando registros',
            tabla: tabla
        });
    } catch (err) {
        console.error('Error en el servidor:', err);
        // Aquí también usa el 'res' original
        return res.render('templates/mensaje', {
            pagina: 'Hubo un problema al guardar la cotización.'
        });
    }
}
export {
    inicio,
    guardarCodigo
}