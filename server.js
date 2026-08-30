const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Sirve el archivo index.html automáticamente

// Banco de 25 preguntas sobre Primeros Auxilios Básicos
const bancoPreguntas = [
  { id: 1, texto: "¿Cuál es la regla de oro en primeros auxilios (P.A.S.)?", opciones: ["Proteger, Avisar, Socorrer", "Prevenir, Auxiliar, Sanar", "Presionar, Atender, Salvar", "Parar, Analizar, Secar"], correcta: 0 },
  { id: 2, texto: "¿Cuál es la relación de compresiones e insuflaciones en RCP para adultos?", opciones: ["15 compresiones x 2 insuflaciones", "30 compresiones x 2 insuflaciones", "50 compresiones x 5 insuflaciones", "10 compresiones x 1 insuflación"], correcta: 1 },
  { id: 3, texto: "¿Qué se debe hacer primero ante una quemadura de primer grado?", opciones: ["Aplicar crema o aceite", "Enfriar con abundante agua fría corriente", "Reventar las ampollas", "Colocar hielo directamente"], correcta: 1 },
  { id: 4, texto: "En caso de atragantamiento total en un adulto consciente, ¿qué maniobra se aplica?", opciones: ["Maniobra de Valsalva", "Maniobra de Heimlich", "Golpes en la espalda únicamente", "R.C.P. inmediata"], correcta: 1 },
  { id: 5, texto: "¿Cómo se debe posicionar a una persona inconsciente que respira normalmente?", opciones: ["Boca arriba (Decúbito supino)", "Boca abajo (Decúbito prono)", "Posición Lateral de Seguridad (PLS)", "Sentado con la cabeza hacia atrás"], correcta: 2 },
  { id: 6, texto: "¿Qué NO se debe hacer ante una convulsión?", opciones: ["Proteger la cabeza de golpes", "Sujetar fuertemente a la persona o meterle objetos en la boca", "Tomar el tiempo de duración", "Aflojar ropa apretada"], correcta: 1 },
  { id: 7, texto: "Ante una hemorragia severa en una extremidad, ¿cuál es la primera medida?", opciones: ["Aplicar un torniquete de inmediato", "Presión directa sobre la herida con tela limpia", "Lavar con alcohol", "Elevar las piernas del paciente"], correcta: 1 },
  { id: 8, texto: "¿Cuál es el número de emergencias médico estándar en la mayoría de países de LATAM/España?", opciones: ["911 / 112", "011", "100", "555"], correcta: 0 },
  { id: 9, texto: "¿Qué signo indica una obstrucción GRAVE de la vía aérea?", opciones: ["El paciente tose fuertemente", "El paciente puede hablar pero con dificultad", "El paciente no puede hablar, toser ni respirar", "El paciente estornuda continuamente"], correcta: 2 },
  { id: 10, texto: "¿Qué se debe hacer si un objeto está incrustado en el cuerpo del paciente?", opciones: ["Retirarlo rápidamente", "Inmovilizar el objeto sin extraerlo", "Empujarlo un poco más", "Lavar la zona alrededor sacando el objeto"], correcta: 1 },
  { id: 11, texto: "En una insolación o golpe de calor, ¿qué acción es correcta?", opciones: ["Dar de beber alcohol o café", "Mover a la persona a un lugar fresco y aplicar compresas frías", "Meter a la persona en agua helada de golpe", "Cubrirlo con mantas térmicas"], correcta: 1 },
  { id: 12, texto: "¿Qué evalúa la nemotecnia A.V.D.I. en el estado de conciencia?", opciones: ["Alerta, Verbal, Dolor, Inconsciente", "Aire, Venas, Dolor, Infección", "Atención, Vista, Diálogo, Impulso", "Auxilio, Vía, Diagnóstico, Intervención"], correcta: 0 },
  { id: 13, texto: "Ante una fractura abierta (hueso expuesto), ¿qué se debe evitar?", opciones: ["Cubrir la herida con gasa estéril", "Intentar reintroducir el hueso dentro de la piel", "Inmovilizar la zona", "Llamar a emergencias"], correcta: 1 },
  { id: 14, texto: "¿Cuál es la profundidad recomendada de las compresiones torácicas en adultos?", opciones: ["Entre 1 y 2 cm", "Entre 5 y 6 cm", "Más de 10 cm", "Sin importar la profundidad"], correcta: 1 },
  { id: 15, texto: "¿Qué es el shock anafiláctico?", opciones: ["Una fractura múltiple", "Una reacción alérgica grave y potencialmente mortal", "Un desmayo por ayuno", "Un paro cardíaco repentino"], correcta: 1 },
  { id: 16, texto: "¿Qué hacer ante un sangrado nasal (epistaxis)?", opciones: ["Inclinar la cabeza hacia atrás", "Inclinar la cabeza ligeramente hacia adelante y presionar las fosas nasales", "Acostar al paciente boca arriba", "Tapar la nariz con algodón con alcohol"], correcta: 1 },
  { id: 17, texto: "¿Qué se debe verificar antes de realizar RCP?", opciones: ["Si el paciente tiene identificación", "Que la escena sea segura, la conciencia y la respiración del paciente", "El pulso en el pie del paciente", "La presión arterial del paciente"], correcta: 1 },
  { id: 18, texto: "Si una persona sufre una descarga eléctrica, ¿qué se hace primero?", opciones: ["Tocarla para moverla rápidamente", "Cortar la corriente eléctrica antes de tocar a la víctima", "Echarle agua fría", "Tirarla del brazo"], correcta: 1 },
  { id: 19, texto: "¿Qué síntoma es característico de un Infarto Agudo de Miocardio?", opciones: ["Dolor opresivo en el pecho que puede ir al brazo izquierdo o mandíbula", "Fiebre alta y escalofríos", "Dolor punzante en el pie", "Visión borrosa momentánea"], correcta: 0 },
  { id: 20, texto: "¿Cuál es el ritmo ideal de compresiones por minuto en RCP?", opciones: ["60 a 80 por minuto", "100 a 120 por minuto", "150 a 200 por minuto", "40 a 50 por minuto"], correcta: 1 },
  { id: 21, texto: "¿Qué se aplica en una picadura de abeja si el aguijón sigue visible?", opciones: ["Apretarlo con los dedos para sacarlo", "Rasparlo suavemente con una tarjeta rígida para no inyectar más veneno", "Usar pinzas y apretar el saco de veneno", "Dejarlo ahí hasta llegar al hospital"], correcta: 1 },
  { id: 22, texto: "Ante un desmayo (síncope), ¿qué posición ayuda a recuperar la irrigación sanguínea?", opciones: ["Sentado con la cabeza entre las piernas o acostado con piernas elevadas", "De pie caminando despacio", "Boca abajo", "Inclinado hacia un lado"], correcta: 0 },
  { id: 23, texto: "¿Qué componente del botiquín sirve para limpiar heridas superficiales?", opciones: ["Solución salina (suero fisiológico) o agua y jabón", "Alcohol de 96° directo en la herida abierta", "Lisoform", "Merthiolate rojo directo"], correcta: 0 },
  { id: 24, texto: "En caso de un Accidente Cerebrovascular (ACV), ¿qué prueba rápida se realiza?", opciones: ["Pedir que sonría, levante ambos brazos y hable", "Pedir que salte en un pie", "Revisar la temperatura", "Hacer prueba de reflejo en la rodilla"], correcta: 0 },
  { id: 25, texto: "¿Qué significan las siglas DEA en emergencias médicas?", opciones: ["Desfibrilador Externo Automático", "Diagnóstico de Emergencia Avanzado", "Dispositivo de Evaluación Anatómica", "Dosis Emergente de Auxilio"], correcta: 0 }
];

// Almacenamiento temporal en memoria
const usuarios = {};

// Iniciar evaluación
app.post('/api/iniciar-evaluacion', (req, res) => {
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res.status(400).json({ error: 'Debes ingresar un ID de usuario válido.' });
  }

  if (!usuarios[usuarioId]) {
    usuarios[usuarioId] = { intentos: 0, historialPreguntas: [] };
  }

  const usuario = usuarios[usuarioId];

  if (usuario.intentos >= 2) {
    return res.status(403).json({ error: 'Has alcanzado el límite máximo de 2 intentos.' });
  }

  // Filtrado de preguntas no usadas para garantizar 0% de repetición
  const preguntasUsadas = new Set(usuario.historialPreguntas);
  const preguntasDisponibles = bancoPreguntas.filter(p => !preguntasUsadas.has(p.id));

  // Seleccionar 5 preguntas al azar
  const seleccionadas = preguntasDisponibles
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  usuario.intentos += 1;
  const intentoActual = {
    id: Date.now(),
    preguntas: seleccionadas,
    inicio: Date.now(),
    tiempoLimiteMs: 5 * 60 * 1000 // 5 minutos de tiempo límite
  };

  usuario.intentoActivo = intentoActual;
  usuario.historialPreguntas.push(...seleccionadas.map(p => p.id));

  // Enviar preguntas sin revelar las respuestas correctas
  const preguntasParaCliente = seleccionadas.map(({ id, texto, opciones }) => ({ id, texto, opciones }));

  res.json({
    intento: usuario.intentos,
    tiempoLimiteSegundos: 300,
    preguntas: preguntasParaCliente
  });
});

// Finalizar y calificar evaluación
app.post('/api/finalizar-evaluacion', (req, res) => {
  const { usuarioId, respuestas } = req.body;
  const usuario = usuarios[usuarioId];

  if (!usuario || !usuario.intentoActivo) {
    return res.status(400).json({ error: 'No hay un intento activo para este usuario.' });
  }

  const intento = usuario.intentoActivo;
  const tiempoTranscurrido = Date.now() - intento.inicio;

  // Tolerancia de 5 segundos adicionales por latencia de red
  if (tiempoTranscurrido > intento.tiempoLimiteMs + 5000) {
    usuario.intentoActivo = null;
    return res.status(408).json({ error: 'Tiempo agotado. La evaluación no fue procesada.' });
  }

  let aciertos = 0;
  const revision = intento.preguntas.map(p => {
    const seleccionada = respuestas[p.id];
    const esCorrecta = seleccionada === p.correcta;
    if (esCorrecta) aciertos++;

    return {
      pregunta: p.texto,
      opciones: p.opciones,
      tuRespuesta: p.opciones[seleccionada] ?? 'Sin responder',
      respuestaCorrecta: p.opciones[p.correcta],
      esCorrecta
    };
  });

  const notaFinal = (aciertos / intento.preguntas.length) * 5.0;
  usuario.intentoActivo = null;

  res.json({
    calificacion: notaFinal.toFixed(1),
    aciertos,
    totalPreguntas: intento.preguntas.length,
    revision
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});