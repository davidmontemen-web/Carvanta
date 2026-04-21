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

  // 🔥 FORMATO CORRECTO PARA MYSQL (YYYY-MM-DD)
  fechaAvaluo: new Date().toLocaleDateString('en-CA'),
  fechaActualizacion: null,

  estatus: 'borrador',

  asesorVentas: usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : '',

  // ------------------------
  // GENERALES
  // ------------------------
  generales: {
    marca: '',
    submarca: '',
    version: '',
    transmision: '',
    numeroSerie: '',
    anio: '',
    color: '',
    kilometraje: '',
    numeroDuenos: '',
    placas: '',
    comentarios: ''
  },

  // ------------------------
  // DOCUMENTACIÓN
  // ------------------------
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

  // ------------------------
  // INTERIOR (ACTUALIZADO)
  // ------------------------
  interior: {
    vestiduras: '',
    cielo: '',
    consolaCentral: '',
    alfombras: '',
    tablero: '',
    encendedor: '',
    puertasLaterales: '',
    volante: '',
    comentarios: ''
  },

  // ------------------------
  // CARROCERÍA (LISTO PARA CRECER)
  // ------------------------
  carroceria: {
    zonas: {},
    neumaticos: {},
    observaciones: ''
  },

  // ------------------------
  // SISTEMA ELÉCTRICO (YA CON ESTADOS)
  // ------------------------
  sistemaElectrico: {
    espejosElectricos: '',
    bolsasAire: '',
    aireAcondicionado: '',
    controlCrucero: '',
    chisguetero: '',
    luzMapa: '',
    controlesVolante: '',
    checkEngine: '',
    asientosElectricos: '',
    encendedor: '',
    claxon: '',
    lucesInternas: '',
    segurosElectricos: '',
    cristalesElectricos: '',
    aperturaCajuela: '',
    pantalla: '',
    farosNiebla: '',
    lucesExternas: '',
    limpiadores: '',
    estereoUsb: '',
    quemacocos: '',
    testigos: '',
    direccionales: '',
    comentarios: ''
  },

  // ------------------------
  // FUGAS Y MOTOR
  // ------------------------
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

  // ------------------------
  // VALUACIÓN (CON MEDIA)
  // ------------------------
  valuacion: {
    tomaLibro: '',
    ventaLibro: '',
    reparaciones: '',
    tomaAutorizada: '',
    media: '',
    comentarios: ''
  },

  // ------------------------
  // FOTOS
  // ------------------------
  fotosGenerales: [],
  fotosDetalle: [],

  historial: []
});

// 🔥 FORMATO MYSQL DATETIME
export const formatMysqlDateTime = () => {
  return new Date().toLocaleString('sv-SE').replace('T', ' ');
};