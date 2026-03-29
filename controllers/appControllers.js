import { Console } from 'console';
import { check, validationResult } from 'express-validator'
import ExcelJS from 'exceljs'
import path from 'path'

const inicio = async (req, res) => {
    const { colector, zona, almacen } = req.query;
    
    try {
        // Petición a la API de Render para traer los colectores
        const respuesta = await fetch(`${process.env.API_URL}/inventario/colectores`);
        const colectores = respuesta.ok ? await respuesta.json() : [];

        if (colectores.length === 0) {
            console.warn("No se recibieron colectores de la API");
        }
        const respuesta2 = await fetch(`${process.env.API_URL}/inventario/zonas`);
        const zonas = respuesta2.ok ? await respuesta2.json() : [];

        if (zonas.length === 0) {
            console.warn("No se recibieron colectores de la API");
        }

        return res.render('inicio', {
            pagina: 'Registro de Inventario',
            colectores, // Enviamos el arreglo de colectores a la vista
            zonas,
            datos: {
                colector: colector || '',
                zona: zona || '',
                almacen: almacen || ''
            },
            apiUrl: process.env.API_URL
        });
    } catch (error) {
        console.error("Error al conectar con la API de colectores:", error);
        return res.render('inicio', {
            pagina: 'Registro de Inventario',
            colectores: [], 
            zonas: [],// Enviamos vacío para evitar que la vista truene
            datos: { colector: '', zona: '', almacen: '' },
            apiUrl: process.env.API_URL
        });
    }
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
        // Petición a la API de Render para traer los colectores
        const respuesta = await fetch(`${process.env.API_URL}/inventario/colectores`);
        const colectores = respuesta.ok ? await respuesta.json() : [];
        const respuesta2 = await fetch(`${process.env.API_URL}/inventario/zonas`);
        const zonas = respuesta2.ok ? await respuesta2.json() : [];
        // Si hay errores, volvemos a renderizar la página con las alertas
        return res.render('inicio', {
            errores: resultado.array(),
            datos: req.body, // Enviamos los datos para que no se borre lo que el usuario ya escribió
            colectores: colectores,
            zonas: zonas,
            apiUrl: process.env.API_URL
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
    const zonaId = req.params.id;

    const mostrar = await fetch(`${process.env.API_URL}/inventario/mostrarTabla/${colectorId}`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }

        const tabla = await mostrar.json();

        if(!tabla){
            return res.redirect(`/mostrarTabla/${colectorId}`);
        } 
        let almacen = '';
        if (tabla && tabla.length > 0) {
        // 2. OBTENER EL ÚLTIMO REGISTRO (el más reciente)
        const ultimoRegistro = tabla[tabla.length - 1]; 
        
        almacen = ultimoRegistro.ALMACEN;
    }
    // AQUÍ ES DONDE SÍ VA EL RENDER
        res.render('tabla', {
            pagina: 'Inventario Actualizado',
            tabla: tabla,
            colectorId,
            zonaId,
            almacen,
            total: tabla.length
        });
};
const Excel = async (req, res) =>{
    const colectorId = req.params.id;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    // 2. Definir las columnas
    worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Descripción', key: 'descripcion', width: 40 },
        { header: 'Contado', key: 'contado', width: 20 },
        { header: 'Zona', key: 'zona', width: 30 },
        { header: 'Responsable', key: 'colector', width: 40 },
        { header: 'Almacén', key: 'almacen', width: 43 }
    ];
    try {
        // Petición a la API de Render para traer los colectores
        const respuesta = await fetch(`${process.env.API_URL}/inventario/mostrarRegistros`);
        const registros = respuesta.ok ? await respuesta.json() : [];
        console.log('registros: ', registros);
        if (registros.length === 0) {
            console.warn("No se recibieron registros de la API");
        }
        registros.forEach((fila) => {
            worksheet.addRow({
                codigo: fila.CLAVE_ARTICULO,
                descripcion: fila.DESCRIPCION,
                contado: fila.CONTADO,
                zona: fila.NOMBRE_ZONA,
                colector: fila.NOMBRE_COLECTOR,
                almacen: fila.ALMACEN
            });
        });
    
        // 4. Guardar el archivo físicamente
        const nombreArchivo = 'Inventario_Cornejo.xlsx';
        await workbook.xlsx.writeFile(nombreArchivo);
        
        console.log(`Archivo ${nombreArchivo} guardado con éxito.`);
        res.setHeader(
            'Content-Type', 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition', 
            `attachment; filename=${nombreArchivo}`
        );
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error al conectar con la API de colectores:", error);
    }
    // 3. Agregar los datos de tu variable
}
const admin = async (req, res) => {
    const { colector, zona, almacen } = req.query;
    
    try {
        // Petición a la API de Render para traer los colectores
        const respuesta = await fetch(`${process.env.API_URL}/inventario/colectores`);
        const colectores = respuesta.ok ? await respuesta.json() : [];

        if (colectores.length === 0) {
            console.warn("No se recibieron colectores de la API");
        }
        const respuesta2 = await fetch(`${process.env.API_URL}/inventario/zonas`);
        const zonas = respuesta2.ok ? await respuesta2.json() : [];

        if (zonas.length === 0) {
            console.warn("No se recibieron colectores de la API");
        }
        return res.render('admin', {
            pagina: 'Registro de Inventario',
            colectores,
            zonas, // Enviamos el arreglo de colectores a la vista
            datos: {
                colector: colector || '',
                zona: zona || '',
                almacen: almacen || ''
            },
            apiUrl: process.env.API_URL
        });
    } catch (error) {
        console.error("Error al conectar con la API de colectores:", error);
        return res.render('admin', {
            pagina: 'Registro de Inventario',
            colectores: [], // Enviamos vacío para evitar que la vista truene
            datos: { colector: '', zona: '', almacen: '' },
            apiUrl: process.env.API_URL
        });
    }
}
const mostrarInventarioForm = async (req, res) => {
    const {colector} = req.query;
    console.log('aqui entra', req.query)
    const mostrar = await fetch(`${process.env.API_URL}/inventario/mostrarTabla/${colector}`);
        
        if (!mostrar.ok) {
            console.error("El servidor de la tabla respondió con error");
            // Si falla la tabla, al menos mostramos un mensaje y no se queda colgado
            return res.render('templates/mensaje', { pagina: 'Registro guardado, pero no se pudo cargar la tabla.' });
        }

        const tabla = await mostrar.json();

        if(!tabla){
            return res.redirect(`/mostrarTabla/${colector}`);
        } 
        
    // AQUÍ ES DONDE SÍ VA EL RENDER
        res.render('tablaAdmin', {
            pagina: 'Inventario Actualizado',
            tabla: tabla,
            colector,
            total: tabla.length
        });
    }
const eliminarArticulo= async (req, res)=>{
    const { id } = req.params;
    const { colectorId } = req.body; // Para poder redirigir después
    console.log('body', req.body)
    console.log('params', req.params)
    console.log('query', req.query)
    


    try {
        // Le avisamos a la API de Render que borre el registro
        const respuesta = await fetch(`${process.env.API_URL}/inventario/eliminar-articulo/${id}`, {
            method: 'POST', // O 'POST' según cómo esté programada tu API
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('resp', respuesta)
        if (respuesta.ok) {
            // Si la API borró con éxito, refrescamos la tabla
            res.redirect(`/mostrarTabla/${colectorId}`);
        } else {
            res.status(500).send("No se pudo eliminar en la API");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error de conexión con la API");
    }
}
export {
    inicio,
    guardarCodigo,
    mostrarArticulosInventario,
    Excel,
    admin,
    mostrarInventarioForm,
    eliminarArticulo
}