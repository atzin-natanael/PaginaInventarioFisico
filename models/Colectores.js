import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Colectores = db.define('COLECTORES', {
    COLECTOR_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // <--- Agrega esto si es tu llave primaria
        autoIncrement: true
    },
    COLECTOR: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'COLECTORES',
    freezeTableName: true,
    timestamps: false
})

export default Colectores
