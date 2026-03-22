import express from 'express'
const app = express()
import routes from './routes/appRoutes.js'
import db from './config/db.js'
import './models/TablaArticulosInv.js'
import './models/Colectores.js'
// 1. Configuraciones de motor de plantillas
app.set('view engine', 'pug')
app.set('views', './views')

// 2. MIDDLEWARES DE DATOS (DEBEN IR AQUÍ, ANTES DE LAS RUTAS)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Carpeta pública
app.use(express.static('public'));

// 4. RUTAS (AL FINAL, después de que los datos ya fueron procesados)
app.use('/', routes)

try{
    await db.authenticate()
    db.sync()
    console.log('Conexion correcta a la db')
}catch(error){
    console.log(error)
}
const port = 8000
app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});