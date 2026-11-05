/* ========================================
   CONFIGURACIÓN Y REFERENCIAS
======================================== */

const STORAGE_KEY = "colegioBolivarLeaderboard";
const MAX_RECORDS = 10;

let clicks = 0;
let tiempoInicio = 0;
let duracionPartida = 10;
let partidaActiva = false;
let partidaFinalizada = false;
let animacion = null;

let jugadorActual = "";

const numero = document.getElementById("numero");
const temporizador = document.getElementById("temporizador");
const mensaje = document.getElementById("mensaje");

const tituloEvento = document.getElementById("tituloEvento");
const nuevoTitulo = document.getElementById("nuevoTitulo");

const nombreJugador = document.getElementById("nombreJugador");
const selectorDuracion = document.getElementById("duracion");

const botonIniciar = document.getElementById("iniciar");
const botonSumar = document.getElementById("sumar");
const botonReiniciar = document.getElementById("reiniciar");
const botonVerRanking = document.getElementById("verRanking");

const resultado = document.getElementById("resultado");
const totalFinal = document.getElementById("totalFinal");
const estadoRecord = document.getElementById("estadoRecord");

const seccionRanking = document.getElementById("seccionRanking");
const categoriaRanking = document.getElementById("categoriaRanking");
const tablaRanking = document.getElementById("tablaRanking");
const mensajeRanking = document.getElementById("mensajeRanking");


/* ========================================
   ALMACENAMIENTO LOCAL
======================================== */

// Estructura inicial de las tres categorías.

function crearRankingVacio() {
    return {
        10: [],
        20: [],
        30: []
    };
}


// Cargar resultados guardados.

function cargarRanking() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            return crearRankingVacio();
        }

        const ranking = JSON.parse(datos);

        return {
            10: Array.isArray(ranking[10]) ? ranking[10] : [],
            20: Array.isArray(ranking[20]) ? ranking[20] : [],
            30: Array.isArray(ranking[30]) ? ranking[30] : []
        };

    } catch (error) {
        console.error("Error al cargar el ranking:", error);
        return crearRankingVacio();
    }
}


// Guardar resultados permanentemente.

function guardarRanking(ranking) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(ranking)
        );

        return true;

    } catch (error) {
        console.error("Error al guardar el ranking:", error);
        return false;
    }
}


// Cargar el ranking al abrir la página.

let ranking = cargarRanking();


/* ========================================
   CAMBIAR TÍTULO DEL EVENTO
======================================== */

nuevoTitulo.addEventListener("input", function () {

    const texto = nuevoTitulo.value.trim();

    tituloEvento.textContent =
        texto || "Nombre del evento";

});


/* ========================================
   INICIAR PARTIDA
======================================== */

function iniciarPartida() {

    // Validar nombre del jugador.

    jugadorActual = nombreJugador.value.trim();

    if (jugadorActual === "") {
        mensaje.textContent =
            "Por favor, ingresa tu nombre antes de comenzar.";

        nombreJugador.focus();
        return;
    }

    // Configurar partida.

    clicks = 0;

    duracionPartida = Number(selectorDuracion.value);

    partidaActiva = true;
    partidaFinalizada = false;

    tiempoInicio = performance.now();

    // Actualizar interfaz.

    numero.textContent = "0";
    temporizador.textContent = "0.000 s";

    resultado.hidden = true;
    seccionRanking.hidden = true;

    botonIniciar.disabled = true;
    botonSumar.disabled = false;

    botonIniciar.textContent = "Partida en curso";

    selectorDuracion.disabled = true;
    nombreJugador.disabled = true;

    nuevoTitulo.disabled = true;

    mensaje.textContent =
        "¡Buena suerte, " + jugadorActual + "!";

    // Iniciar cronómetro.

    actualizarTiempo();
}


/* ========================================
   REGISTRAR CLICKS
======================================== */

function incrementar() {

    if (!partidaActiva) {
        return;
    }

    clicks++;

    numero.textContent = clicks;

}


/* ========================================
   TEMPORIZADOR EN TIEMPO REAL
======================================== */

function actualizarTiempo() {

    if (!partidaActiva) {
        return;
    }

    const ahora = performance.now();

    const transcurrido = ahora - tiempoInicio;

    const limite = duracionPartida * 1000;

    const tiempoMostrado = Math.min(
        transcurrido,
        limite
    );

    temporizador.textContent =
        (tiempoMostrado / 1000).toFixed(3) + " s";

    // Comprobar si terminó la partida.

    if (transcurrido >= limite) {
        finalizarPartida();
        return;
    }

    animacion = requestAnimationFrame(actualizarTiempo);

}


/* ========================================
   GUARDAR RESULTADO EN EL LEADERBOARD
======================================== */

function registrarResultado() {

    const categoria = String(duracionPartida);

    const nuevoResultado = {
        nombre: jugadorActual,
        clicks: clicks,
        fecha: new Date().toLocaleDateString("es-CO")
    };

    // Agregar el nuevo resultado.

    ranking[categoria].push(nuevoResultado);

    // Ordenar de mayor a menor cantidad de clicks.

    ranking[categoria].sort((a, b) => {
        return b.clicks - a.clicks;
    });

    // Conservar únicamente los mejores 10 resultados.

    ranking[categoria] = ranking[categoria].slice(
        0,
        MAX_RECORDS
    );

    // Comprobar si el resultado entra en el Top 10.

    const posicion = ranking[categoria].findIndex(
        (registro) => registro === nuevoResultado
    );

    // Guardar los resultados.

    const guardado = guardarRanking(ranking);

    return {
        posicion: posicion,
        guardado: guardado
    };

}


/* ========================================
   FINALIZAR PARTIDA
======================================== */

function finalizarPartida() {

    if (!partidaActiva) {
        return;
    }

    partidaActiva = false;
    partidaFinalizada = true;

    // Detener animación.

    if (animacion !== null) {
        cancelAnimationFrame(animacion);
        animacion = null;
    }

    // Mostrar tiempo final.

    temporizador.textContent =
        duracionPartida.toFixed(3) + " s";

    // Deshabilitar botones y controles.

    botonSumar.disabled = true;
    botonIniciar.disabled = true;

    botonSumar.textContent = "Partida finalizada";

    // Mostrar resultado.

    resultado.hidden = false;

    totalFinal.textContent =
        jugadorActual + ": " + clicks + " clicks.";

    mensaje.textContent = "¡Se acabó el tiempo!";

    // Guardar y clasificar resultado.

    const registro = registrarResultado();

    if (registro.posicion !== -1) {

        const posicion = registro.posicion + 1;

        estadoRecord.textContent =
            "¡Nuevo récord! Ocupas la posición #" +
            posicion + " del Top 10.";

    } else {

        estadoRecord.textContent =
            "¡Buen trabajo! Sigue intentando entrar al Top 10.";

    }

    if (!registro.guardado) {
        estadoRecord.textContent +=
            " No fue posible guardar el resultado en este navegador.";
    }

    // Mostrar automáticamente el ranking de esta categoría.

    categoriaRanking.value = String(duracionPartida);

    mostrarRanking();

}


/* ========================================
   MOSTRAR TABLA DE POSICIONES
======================================== */

function mostrarRanking() {

    const categoria = categoriaRanking.value;

    const resultados = ranking[categoria] || [];

    // Limpiar tabla anterior.

    tablaRanking.replaceChildren();

    if (resultados.length === 0) {

        mensajeRanking.textContent =
            "Todavía no hay resultados registrados en esta categoría.";

        return;
    }

    mensajeRanking.textContent =
        "Mostrando los mejores " + resultados.length + " resultados.";

    // Crear filas de la tabla.

    resultados.forEach((registro, indice) => {

        const fila = document.createElement("tr");

        const posicion = document.createElement("td");
        const nombre = document.createElement("td");
        const puntuacion = document.createElement("td");

        posicion.textContent = indice + 1;

        // textContent evita interpretar nombres como código HTML.

        nombre.textContent = registro.nombre;

        puntuacion.textContent = registro.clicks;

        fila.appendChild(posicion);
        fila.appendChild(nombre);
        fila.appendChild(puntuacion);

        tablaRanking.appendChild(fila);

    });

}


/* ========================================
   MOSTRAR / OCULTAR RANKING
======================================== */

function alternarRanking() {

    const estaOculto = seccionRanking.hidden;

    seccionRanking.hidden = !estaOculto;

    if (estaOculto) {
        mostrarRanking();

        seccionRanking.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

}


/* ========================================
   CAMBIAR CATEGORÍA DEL RANKING
======================================== */

categoriaRanking.addEventListener("change", mostrarRanking);


/* ========================================
   REINICIAR PARTIDA
======================================== */

function reiniciarPartida() {

    // Detener temporizador anterior.

    if (animacion !== null) {
        cancelAnimationFrame(animacion);
        animacion = null;
    }

    // Restablecer variables.

    clicks = 0;

    partidaActiva = false;
    partidaFinalizada = false;

    duracionPartida = Number(selectorDuracion.value);

    jugadorActual = "";

    // Restablecer interfaz.

    numero.textContent = "0";

    temporizador.textContent = "0.000 s";

    mensaje.textContent =
        "Ingresa tu nombre para comenzar.";

    totalFinal.textContent = "";
    estadoRecord.textContent = "";

    resultado.hidden = true;
    seccionRanking.hidden = true;

    // Habilitar controles.

    botonIniciar.disabled = false;
    botonSumar.disabled = true;

    botonIniciar.textContent = "Iniciar partida";
    botonSumar.textContent = "+ Registrar click";

    selectorDuracion.disabled = false;
    nombreJugador.disabled = false;
    nuevoTitulo.disabled = false;

    nombreJugador.value = "";

    nombreJugador.focus();

}


/* ========================================
   ASIGNAR EVENTOS
======================================== */

botonIniciar.addEventListener("click", iniciarPartida);

botonSumar.addEventListener("click", incrementar);

botonReiniciar.addEventListener("click", reiniciarPartida);

botonVerRanking.addEventListener("click", alternarRanking);


// Mostrar el ranking inicial al cargar la aplicación.

mostrarRanking();
