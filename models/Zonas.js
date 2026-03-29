import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Zonas = db.define('ZONAS', {
    ZONA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // <--- Agrega esto si es tu llave primaria
        autoIncrement: true
    },
    ZONA: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'ZONAS',
    freezeTableName: true,
    timestamps: false
})

export default Zonas
