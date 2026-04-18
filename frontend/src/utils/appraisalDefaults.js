const generateTempId = () => {
  return Date.now();
};

const generateFolio = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `AVL-${timestamp}`;
};

export const getEmptyAppraisal = (usuario) => ({
  id: generateTempId(),
  isPersisted: false,

  folio: generateFolio(),

  clienteNombre: '',
  clienteTelefono: '',
  vehiculoInteres: '',

  fechaAvaluo: new Date().toISOString().slice(0, 10),
  fechaActualizacion: null,

  estatus: 'borrador',

  asesorVentas: usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : '',

  generales: {
    marca: '',
    subMarca: '',
    version: '',
    transmision: '',
    numeroSerie: '',
    anioModelo: '',
    color: '',
    kilometraje: '',
    numeroDuenios: '',
    placas: '',
    complementarios: '',
    comentarios: ''
  },

  documentacion: {
    factura: '',
    cartaOrigen: '',
    tenencias: '',
    ultimoServicio: '',
    verificacion: '',
    manuales: '',
    garantia: '',
    engomado: '',
    tarjetaCirculacion: '',
    polizaSeguro: '',
    comentarios: ''
  },

  interior: {
    vestiduras: '',
    cielo: '',
    consola: '',
    alfombras: '',
    tablero: '',
    encendedor: '',
    puertas: '',
    volante: '',
    consolaDos: ''
  },

  carroceria: {
    observaciones: ''
  },

  sistemaElectrico: {
    espejosElectricos: false,
    bolsasAire: false,
    aireAcondicionado: false,
    controlCrucero: false,
    chisguetero: false,
    luzMapa: false,
    funcionesVolante: false,
    checkEngine: false,
    asientosElectricos: false,
    claxon: false,
    lucesInternas: false,
    segurosElectricos: false,
    cristalesElectricos: false,
    aperturaCajuela: false,
    pantalla: false,
    farosNiebla: false,
    lucesExternas: false,
    limpiadores: false,
    estereoUsb: false,
    quemacocos: false,
    testigos: false,
    direccionales: false
  },

  fugasMotor: {
    motor: '',
    transmision: '',
    sistemaFrenos: '',
    direccionHidraulica: '',
    amortiguadores: '',
    anticongelante: '',
    aireAcondicionado: '',
    flechas: '',
    soportesMotor: '',
    soportesCaja: '',
    comentarios: ''
  },

  valuacion: {
    tomaLibro: '',
    ventaLibro: '',
    reparaciones: '',
    tomaAutorizada: ''
  },

  fotosGenerales: [],
  fotosDetalle: [],
  historial: []
});

export const formatMysqlDateTime = () => {
  return new Date().toLocaleString('sv-SE').replace('T', ' ');
};