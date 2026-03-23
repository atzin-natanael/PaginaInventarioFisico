import { Console } from 'console';
import { check, validationResult } from 'express-validator'

const inicio= async (req, res) =>{
    const { colector, zona, almacen } = req.query;
    console.log('zona a mostrar', zona)
    const mostrar = await fetch(`${process.env.API_URL}/inventario/colectores`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }
        const colectores= await mostrar.json();
        return res.render('inicio', {
        pagina: 'Registro de Zonas',
        colectores: colectores,
        datos: {
                colector: colector || '',
                zona: zona || '',
                almacen: almacen || ''
            },
        apiUrl: process.env.API_URL
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
        const respuesta = await fetch(`${process.env.API_URL}/inventario/guardarRegistro/`, { 
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
        return res.redirect(`/mostrarTabla/${colector}`);

    } catch (err) {
        console.error('Error en el servidor:', err);
        // Aquí también usa el 'res' original
        return res.render('templates/mensaje', {
            pagina: 'Hubo un problema al guardar la cotización.'
        });
    }
}
const mostrarArticulosInventario = async (req, res) => {
    const colectorId = req.params.id;
    console.log('aqui entra', colectorId)
    const mostrar = await fetch(`${process.env.API_URL}/inventario/mostrarTabla/${colectorId}`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }

        const tabla = await mostrar.json();
        console.log('aqui esta la tabla', tabla)

        if(!tabla){
            return res.redirect(`/mostrarTabla/${colectorId}`);
        } 
        let almacen = '';
        let zona = '';
        if (tabla && tabla.length > 0) {
        // 2. OBTENER EL ÚLTIMO REGISTRO (el más reciente)
        const ultimoRegistro = tabla[tabla.length - 1]; 
        
        almacen = ultimoRegistro.ALMACEN;
        zona = ultimoRegistro.ZONA;
    }
    // AQUÍ ES DONDE SÍ VA EL RENDER
        res.render('tabla', {
            pagina: 'Inventario Actualizado',
            tabla: tabla,
            colectorId,
            almacen,
            zona
        });
};
export {
    inicio,
    guardarCodigo,
    mostrarArticulosInventario
}