import TablaArticulos from "./TablaArticulosInv.js";
import Colectores from "./Colectores.js";
import Zonas from "./Zonas.js";

// Un artículo pertenece a un colector
TablaArticulos.belongsTo(Colectores, { foreignKey: 'COLECTOR_ID', as: 'colector' });
TablaArticulos.belongsTo(Zonas, { foreignKey: 'ZONA_ID', as: 'zonas' });


// Un colector tiene muchos artículos (Relación inversa)
Colectores.hasMany(TablaArticulos, { foreignKey: 'COLECTOR_ID' });
Zonas.hasMany(TablaArticulos, { foreignKey: 'ZONA_ID' });


export {
    TablaArticulos,
    Colectores
};