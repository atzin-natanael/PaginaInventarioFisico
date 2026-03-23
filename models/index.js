import TablaArticulos from "./TablaArticulosInv.js";
import Colectores from "./Colectores.js";

// Un artículo pertenece a un colector
TablaArticulos.belongsTo(Colectores, { foreignKey: 'COLECTOR_ID', as: 'colector' });

// Un colector tiene muchos artículos (Relación inversa)
Colectores.hasMany(TablaArticulos, { foreignKey: 'COLECTOR_ID' });

export {
    TablaArticulos,
    Colectores
};