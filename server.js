const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializar Base de Datos SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      documento TEXT PRIMARY KEY,
      nombre TEXT,
      intentos_realizados INTEGER DEFAULT 0,
      bloqueado INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS intentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento TEXT,
      numero_intento INTEGER,
      puntaje INTEGER,
      total_preguntas INTEGER,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      respuestas_json TEXT,
      FOREIGN KEY (documento) REFERENCES usuarios(documento)
    )
  `);
});

// Banco completo de 25 preguntas
const bancoPreguntas = [
  { id: 1, texto: "¿Cuál es la regla de oro en primeros auxilios (P.A.S.)?", imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500", opciones: ["Proteger, Avisar, Socorrer", "Prevenir, Auxiliar, Sanar", "Presionar, Atender, Salvar", "Parar, Analizar, Secar"], correcta: 0 },
  { id: 2, texto: "¿Cuál es la relación de compresiones e insuflaciones en RCP para adultos?", imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500", opciones: ["15 compresiones x 2 insuflaciones", "30 compresiones x 2 insuflaciones", "50 compresiones x 5 insuflaciones", "10 compresiones x 1 insuflación"], correcta: 1 },
  { id: 3, texto: "¿Qué se debe hacer primero ante una quemadura de primer grado?", imagen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500", opciones: ["Aplicar crema o aceite", "Enfriar con abundante agua fría corriente", "Reventar las ampollas", "Colocar hielo directamente"], correcta: 1 },
  { id: 4, texto: "En caso de atragantamiento total en un adulto consciente, ¿qué maniobra se aplica?", imagen: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=500", opciones: ["Maniobra de Valsalva", "Maniobra de Heimlich", "Golpes en la espalda únicamente", "R.C.P. inmediata"], correcta: 1 },
  { id: 5, texto: "¿Cómo se debe posicionar a una persona inconsciente que respira normalmente?", imagen: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500", opciones: ["Boca arriba (Decúbito supino)", "Boca abajo (Decúbito prono)", "Posición Lateral de Seguridad (PLS)", "Sentado con la cabeza hacia atrás"], correcta: 2 },
  { id: 6, texto: "¿Qué NO se debe hacer ante una convulsión?", imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500", opciones: ["Proteger la cabeza de golpes", "Sujetar fuertemente a la persona o meterle objetos en la boca", "Tomar el tiempo de duración", "Aflojar ropa apretada"], correcta: 1 },
  { id: 7, texto: "Ante una hemorragia severa en una extremidad, ¿cuál es la primera medida?", imagen: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500", opciones: ["Aplicar un torniquete de inmediato", "Presión directa sobre la herida con tela limpia", "Lavar con alcohol", "Elevar las piernas del paciente"], correcta: 1 },
  { id: 8, texto: "¿Cuál es el número de emergencias médico estándar en la mayoría de países de LATAM/España?", imagen: "https://images.unsplash.com/photo-1583912267670-6575ad3736f8?w=500", opciones: ["911 / 112", "011", "100", "555"], correcta: 0 },
  { id: 9, texto: "¿Qué signo indica una obstrucción GRAVE de la vía aérea?", imagen: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=500", opciones: ["El paciente tose fuertemente", "El paciente puede hablar pero con dificultad", "El paciente no puede hablar, toser ni respirar", "El paciente estornuda continuamente"], correcta: 2 },
  { id: 10, texto: "¿Qué se debe hacer si un objeto está incrustado en el cuerpo del paciente?", imagen: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500", opciones: ["Retirarlo rápidamente", "Inmovilizar el objeto sin extraerlo", "Empujarlo un poco más", "Lavar la zona alrededor sacando el objeto"], correcta: 1 },
  { id: 11, texto: "En una insolación o golpe de calor, ¿qué acción es correcta?", imagen: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500", opciones: ["Dar de beber alcohol o café", "Mover a la persona a un lugar fresco y aplicar compresas frías", "Meter a la persona en agua helada de golpe", "Cubrirlo con mantas térmicas"], correcta: 1 },
  { id: 12, texto: "¿Qué evalúa la nemotecnia A.V.D.I. en el estado de conciencia?", imagen: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500", opciones: ["Alerta, Verbal, Dolor, Inconsciente", "Aire, Venas, Dolor, Infección", "Atención, Vista, Diálogo, Impulso", "Auxilio, Vía, Diagnóstico, Intervención"], correcta: 0 },
  { id: 13, texto: "Ante una fractura abierta (hueso expuesto), ¿qué se debe evitar?", imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500", opciones: ["Cubrir la herida con gasa estéril", "Intentar reintroducir el hueso dentro de la piel", "Inmovilizar la zona", "Llamar a emergencias"], correcta: 1 },
  { id: 14, texto: "¿Cuál es la profundidad recomendada de las compresiones torácicas en adultos?", imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500", opciones: ["Entre 1 y 2 cm", "Entre 5 y 6 cm", "Más de 10 cm", "Sin importar la profundidad"], correcta: 1 },
  { id: 15, texto: "¿Qué es el shock anafiláctico?", imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500", opciones: ["Una fractura múltiple", "Una reacción alérgica grave y potencialmente mortal", "Un desmayo por ayuno", "Un paro cardíaco repentino"], correcta: 1 },
  { id: 16, texto: "¿Qué hacer ante un sangrado nasal (epistaxis)?", imagen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500", opciones: ["Inclinar la cabeza hacia atrás", "Inclinar la cabeza ligeramente hacia adelante y presionar las fosas nasales", "Acostar al paciente boca arriba", "Tapar la nariz con algodón con alcohol"], correcta: 1 },
  { id: 17, texto: "¿Qué se debe verificar antes de realizar RCP?", imagen: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500", opciones: ["Si el paciente tiene identificación", "Que la escena sea segura, la conciencia y la respiración del paciente", "El pulso en el pie del paciente", "La presión arterial del paciente"], correcta: 1 },
  { id: 18, texto: "Si una persona sufre una descarga eléctrica, ¿qué se hace primero?", imagen: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500", opciones: ["Tocarla para moverla rápidamente", "Cortar la corriente eléctrica antes de tocar a la víctima", "Echarle agua fría", "Tirarla del brazo"], correcta: 1 },
  { id: 19, texto: "¿Qué síntoma es característico de un Infarto Agudo de Miocardio?", imagen: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500", opciones: ["Dolor opresivo en el pecho que puede ir al brazo izquierdo o mandíbula", "Fiebre alta y escalofríos", "Dolor punzante en el pie", "Visión borrosa momentánea"], correcta: 0 },
  { id: 20, texto: "¿Cuál es el ritmo ideal de compresiones por minuto en RCP?", imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500", opciones: ["60 a 80 por minuto", "100 a 120 por minuto", "150 a 200 por minuto", "40 a 50 por minuto"], correcta: 1 },
  { id: 21, texto: "¿Qué se aplica en una picadura de abeja si el aguijón sigue visible?", imagen: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500", opciones: ["Apretarlo con los dedos para sacarlo", "Rasparlo suavemente con una tarjeta rígida para no inyectar más veneno", "Usar pinzas y apretar el saco de veneno", "Dejarlo ahí hasta llegar al hospital"], correcta: 1 },
  { id: 22, texto: "Ante un desmayo (síncope), ¿qué posición ayuda a recuperar la irrigación sanguínea?", imagen: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500", opciones: ["Sentado con la cabeza entre las piernas o acostado con piernas elevadas", "De pie caminando despacio", "Boca abajo", "Inclinado hacia un lado"], correcta: 0 },
  { id: 23, texto: "¿Qué componente del botiquín sirve para limpiar heridas superficiales?", imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500", opciones: ["Solución salina (suero fisiológico) o agua y jabón", "Alcohol de 96° directo en la herida abierta", "Lisoform", "Merthiolate rojo directo"], correcta: 0 },
  { id: 24, texto: "En caso de un Accidente Cerebrovascular (ACV), ¿qué prueba rápida se realiza?", imagen: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500", opciones: ["Pedir que sonría, levante ambos brazos y hable", "Pedir que salte en un pie", "Revisar la temperatura", "Hacer prueba de reflejo en la rodilla"], correcta: 0 },
  { id: 25, texto: "¿Qué significan las siglas DEA en emergencias médicas?", imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500", opciones: ["Desfibrilador Externo Automático", "Diagnóstico de Emergencia Avanzado", "Dispositivo de Evaluación Anatómica", "Dosis Emergente de Auxilio"], correcta: 0 }
];

// Algoritmo para seleccionar 5 preguntas minimizando solapamiento (<15% repetición)
function seleccionarPreguntasSinRepeticion(idsAnteriores = []) {
  let disponibles = bancoPreguntas.filter(p => !idsAnteriores.includes(p.id));
  
  // Si no hay suficientes preguntas no vistas, se completa con el resto
  if (disponibles.length < 5) {
    const faltantes = 5 - disponibles.length;
    const usadas = bancoPreguntas.filter(p => idsAnteriores.includes(p.id));
    usadas.sort(() => 0.5 - Math.random());
    disponibles = disponibles.concat(usadas.slice(0, faltantes));
  } else {
    disponibles.sort(() => 0.5 - Math.random());
    disponibles = disponibles.slice(0, 5);
  }

  return disponibles.map(q => ({
    id: q.id,
    texto: q.texto,
    imagen: q.imagen,
    opciones: q.opciones
  }));
}

// Ruta: Validar/Registrar participante y obtener evaluación
app.post('/api/iniciar', (req, res) => {
  const { documento, nombre } = req.body;

  if (!documento || !nombre) {
    return res.status(400).json({ error: 'Documento y nombre son obligatorios.' });
  }

  db.get('SELECT * FROM usuarios WHERE documento = ?', [documento], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!usuario) {
      // Registrar nuevo usuario
      db.run('INSERT INTO usuarios (documento, nombre, intentos_realizados, bloqueado) VALUES (?, ?, 0, 0)', 
        [documento, nombre], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          enviarEvaluacion(documento, nombre, 1, [], res);
        });
    } else {
      if (usuario.bloqueado || usuario.intentos_realizados >= 2) {
        return res.status(403).json({ 
          error: 'Has alcanzado el límite de 2 intentos permitidos. Contacta al administrador para que habilite un nuevo intento.' 
        });
      }

      // Obtener preguntas del primer intento para evitar solapamiento (>85% de variación)
      db.get('SELECT respuestas_json FROM intentos WHERE documento = ? ORDER BY id ASC LIMIT 1', [documento], (err, ultimoIntento) => {
        let idsPrevios = [];
        if (ultimoIntento && ultimoIntento.respuestas_json) {
          try {
            const parsed = JSON.parse(ultimoIntento.respuestas_json);
            idsPrevios = parsed.map(r => r.preguntaId);
          } catch(e) {}
        }
        enviarEvaluacion(documento, usuario.nombre, usuario.intentos_realizados + 1, idsPrevios, res);
      });
    }
  });
});

function enviarEvaluacion(documento, nombre, numeroIntento, idsPrevios, res) {
  const preguntasSeleccionadas = seleccionarPreguntasSinRepeticion(idsPrevios);
  res.json({
    documento,
    nombre,
    numeroIntento,
    maxIntentos: 2,
    preguntas: preguntasSeleccionadas
  });
}

// Ruta: Calificar y registrar en la base de datos
app.post('/api/evaluar', (req, res) => {
  const { documento, respuestas } = req.body; // respuestas = [{ preguntaId: 1, seleccion: 0 }]

  if (!documento || !Array.isArray(respuestas)) {
    return res.status(400).json({ error: 'Datos de evaluación inválidos.' });
  }

  db.get('SELECT * FROM usuarios WHERE documento = ?', [documento], (err, usuario) => {
    if (err || !usuario) return res.status(400).json({ error: 'Usuario no registrado.' });

    if (usuario.intentos_realizados >= 2 || usuario.bloqueado) {
      return res.status(403).json({ error: 'Límite de intentos superado.' });
    }

    let aciertos = 0;
    const detalleRespuestas = respuestas.map(r => {
      const preg = bancoPreguntas.find(p => p.id === r.preguntaId);
      const esCorrecta = preg && preg.correcta === r.seleccion;
      if (esCorrecta) aciertos++;
      return {
        preguntaId: r.preguntaId,
        seleccion: r.seleccion,
        correcta: preg ? preg.correcta : null,
        esCorrecta
      };
    });

    const nuevoNumeroIntento = usuario.intentos_realizados + 1;
    const nuevoBloqueo = nuevoNumeroIntento >= 2 ? 1 : 0;

    db.serialize(() => {
      // Guardar intento
      db.run(
        'INSERT INTO intentos (documento, numero_intento, puntaje, total_preguntas, respuestas_json) VALUES (?, ?, ?, ?, ?)',
        [documento, nuevoNumeroIntento, aciertos, respuestas.length, JSON.stringify(detalleRespuestas)]
      );

      // Actualizar estado del usuario
      db.run(
        'UPDATE usuarios SET intentos_realizados = ?, bloqueado = ? WHERE documento = ?',
        [nuevoNumeroIntento, nuevoBloqueo, documento]
      );
    });

    res.json({
      puntaje: aciertos,
      total: respuestas.length,
      porcentaje: ((aciertos / respuestas.length) * 100).toFixed(0),
      intentoActual: nuevoNumeroIntento,
      bloqueado: nuevoBloqueo === 1
    });
  });
});

// RUTAS ADMINISTRATIVAS

// Consultar todos los participantes e intentos
app.get('/api/admin/resultados', (req, res) => {
  const query = `
    SELECT u.documento, u.nombre, u.intentos_realizados, u.bloqueado, 
           i.numero_intento, i.puntaje, i.total_preguntas, i.fecha
    FROM usuarios u
    LEFT JOIN intentos i ON u.documento = i.documento
    ORDER BY u.nombre ASC, i.numero_intento ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Habilitar / Desbloquear participante para más intentos
app.post('/api/admin/desbloquear', (req, res) => {
  const { documento } = req.body;
  if (!documento) return res.status(400).json({ error: 'Documento requerido.' });

  db.run(
    'UPDATE usuarios SET intentos_realizados = 0, bloqueado = 0 WHERE documento = ?',
    [documento],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: `Usuario ${documento} desbloqueado exitosamente.` });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});