import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const TablaArticulos = db.define('ARTICULOS_INV_FISICO', {
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // <--- Agrega esto si es tu llave primaria
        autoIncrement: true
    },
    CLAVE_ARTICULO: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DESCRIPCION: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CONTADO: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ZONA: {
        type: DataTypes.STRING(72),
        allowNull: false
    },
    COLECTOR_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ALMACEN: {
        type: DataTypes.ENUM('TIENDA', 'ALMACEN', 'HIDALGO'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['TIENDA', 'ALMACEN', 'HIDALGO']],
                msg: "El almacén debe ser TIENDA, ALMACEN o HIDALGO"
            }
        }
    },
}, {
    tableName: 'ARTICULOS_INV_FISICO',
    freezeTableName: true,
    timestamps: false
})

export default TablaArticulos
