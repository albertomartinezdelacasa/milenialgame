// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", iniciarJuego);

// Variables globales
let canvas, ctx;
let jugadorMilenial;
let numCarriles, carrilAltura, carriles;
let millennial;
let activeProblems = [];
let deudaEmocional = 0;
let colisionActiva = false;
let dificultad = 0;
let botonReiniciar;
let juegoEnPausa = false;
let ultimoTiempoGeneracion = 0;
let intervaloGeneracion = 2000; // Intervalo inicial en ms
let tiempoUltimoFrame = 0;
let puntuacionMaxima = localStorage.getItem("puntuacionMaxima") || 0;
// Variables para sonidos (comentadas hasta implementar)
// let efectoSonidoColision, efectoSonidoSuperado, musicaFondo;

// Array de problemas millennials
const problemasArray = [
    "volver con tus padres",
    "no permitirte terapia",
    "III Guerra mundial",
    "La vivienda",
    "tus amigos tienen hijos",
    "auge del fascismo",
    "El cambio climático",
    "La depresión",
    "Ansiedad",
    "Los Domingos",
    "Adicción al móvil",
    "FOMO",
    "Aumento del alquiler",
    "coño, la lavadora",
    "sueldos bajos",
    "burnout laboral",
    "precariedad",
    "deudas",
    "crisis de los 30",
];

// Colores para los problemas (variedad visual)
const coloresProblemas = [
    "#FF5733", // Naranja
    "#C70039", // Rojo
    "#900C3F", // Burdeos
    "#581845", // Morado
    "#2E86C1", // Azul
    "#17A589", // Verde
];

// Función principal para iniciar el juego
function iniciarJuego() {
    // Inicializar elementos del DOM
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    botonReiniciar = document.getElementById("reiniciarJuego");

    // Crear botón de pausa
    crearBotonPausa();

    // Cargar recursos
    cargarRecursos();

    // Configurar eventos
    configurarEventos();

    // Inicializar configuración del juego
    inicializarConfiguracion();

    // Iniciar el bucle del juego
    requestAnimationFrame(gameLoop);
}

// Cargar imágenes y sonidos
function cargarRecursos() {
    // Cargar imagen del jugador
    jugadorMilenial = new Image();
    jugadorMilenial.src = "./img/milenial.png";

    // Cargar efectos de sonido (comentados para no romper el juego si no existen)
    /*
    // Descomentar y crear la carpeta 'sounds' con estos archivos para activar sonidos
    efectoSonidoColision = new Audio('./sounds/collision.mp3');
    efectoSonidoSuperado = new Audio('./sounds/success.mp3');
    musicaFondo = new Audio('./sounds/background.mp3');
    musicaFondo.loop = true;
    musicaFondo.volume = 0.5;
    */
}

// Crear botón de pausa
function crearBotonPausa() {
    const botonPausa = document.createElement("button");
    botonPausa.id = "pausarJuego";
    botonPausa.textContent = "Pausar";
    botonPausa.style.position = "absolute";
    botonPausa.style.top = "10px";
    botonPausa.style.right = "10px";
    document.body.appendChild(botonPausa);

    botonPausa.addEventListener("click", () => {
        juegoEnPausa = !juegoEnPausa;
        botonPausa.textContent = juegoEnPausa ? "Reanudar" : "Pausar";

        // Si se reanuda el juego, actualizar el tiempo del último frame
        if (!juegoEnPausa) {
            tiempoUltimoFrame = performance.now();
            requestAnimationFrame(gameLoop);
        }
    });
}

// Configurar eventos de teclado y botones
function configurarEventos() {
    // Evento para reiniciar el juego
    botonReiniciar.addEventListener("click", reiniciarJuego);

    // Eventos de teclado
    document.addEventListener("keydown", manejarTeclado);

    // Evento para pausar/reanudar con la tecla 'P'
    document.addEventListener("keydown", (event) => {
        if (event.code === "KeyP") {
            juegoEnPausa = !juegoEnPausa;
            document.getElementById("pausarJuego").textContent = juegoEnPausa
                ? "Reanudar"
                : "Pausar";

            // Si se reanuda el juego, actualizar el tiempo del último frame
            if (!juegoEnPausa) {
                tiempoUltimoFrame = performance.now();
                requestAnimationFrame(gameLoop);
            }
        }
    });
}

// Inicializar configuración del juego
function inicializarConfiguracion() {
    // Configuración de carriles
    numCarriles = 4;
    carrilAltura = canvas.height / numCarriles;
    carriles = [];
    for (let i = 0; i < numCarriles; i++) {
        carriles.push(carrilAltura * i);
    }

    // Configuración del millennial
    millennial = {
        x: 50,
        y: carriles[1], // Empieza en el segundo carril
        width: 50,
        height: carrilAltura - 20,
    };

    // Reiniciar variables de juego
    activeProblems = [];
    deudaEmocional = 0;
    colisionActiva = false;
    dificultad = 0;
    juegoEnPausa = false;

    // Iniciar música de fondo
    /*
    if (musicaFondo) {
        musicaFondo.currentTime = 0;
        musicaFondo.play().catch(e => console.log("Error al reproducir música:", e));
    }
    */
}

// Manejar eventos de teclado
function manejarTeclado(event) {
    if (colisionActiva || juegoEnPausa) return;

    if (event.code === "ArrowUp") {
        const currentIndex = carriles.indexOf(millennial.y);
        if (currentIndex > 0) {
            millennial.y = carriles[currentIndex - 1];
        }
    } else if (event.code === "ArrowDown") {
        const currentIndex = carriles.indexOf(millennial.y);
        if (currentIndex < carriles.length - 1) {
            millennial.y = carriles[currentIndex + 1];
        }
    }
}

// Reiniciar el juego
function reiniciarJuego() {
    // Guardar puntuación máxima
    if (Math.abs(deudaEmocional) > puntuacionMaxima) {
        puntuacionMaxima = Math.abs(deudaEmocional);
        localStorage.setItem("puntuacionMaxima", puntuacionMaxima);
    }

    inicializarConfiguracion();
    botonReiniciar.style.display = "none";
}

// Actualizar nivel de dificultad
function actualizarDificultad() {
    const nivelActual = Math.floor(Math.abs(deudaEmocional) / 300);
    if (nivelActual > dificultad) {
        dificultad = nivelActual;
        // Reducir el intervalo de generación con la dificultad (más problemas)
        intervaloGeneracion = Math.max(500, 2000 - dificultad * 200);
    }
}

// Generar un nuevo problema
function generarProblema() {
    const problemaAleatorio =
        problemasArray[Math.floor(Math.random() * problemasArray.length)];
    const randomCarril = carriles[Math.floor(Math.random() * carriles.length)];
    const colorAleatorio =
        coloresProblemas[Math.floor(Math.random() * coloresProblemas.length)];

    const problema = {
        text: problemaAleatorio,
        x: canvas.width,
        y: randomCarril + 5,
        width: 190,
        height: carrilAltura - 10,
        speed: 5 + Math.random() * 2, // Velocidad ligeramente aleatoria
        color: colorAleatorio,
    };
    return problema;
}

// Mover problemas y eliminar los que salen de la pantalla
function moverProblemas(deltaTime) {
    // Usar un bucle for inverso para evitar problemas al eliminar elementos
    for (let i = activeProblems.length - 1; i >= 0; i--) {
        const problema = activeProblems[i];
        // Ajustar velocidad según deltaTime para movimiento constante
        problema.x -= (problema.speed + dificultad) * (deltaTime / 16.67);

        if (problema.x + problema.width < 0) {
            activeProblems.splice(i, 1);
            deudaEmocional -= 50; // Resta puntos si el problema se supera
            actualizarDificultad();

            // Reproducir sonido de problema superado
            /*
            if (efectoSonidoSuperado) {
                efectoSonidoSuperado.currentTime = 0;
                efectoSonidoSuperado.play().catch(e => {});
            }
            */
        }
    }
}

// Dibujar problemas en el canvas
function dibujarProblemas() {
    activeProblems.forEach((problema) => {
        // Dibujar rectángulo con color aleatorio
        ctx.fillStyle = problema.color;
        ctx.fillRect(problema.x, problema.y, problema.width, problema.height);

        // Dibujar texto
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            problema.text,
            problema.x + problema.width / 2,
            problema.y + problema.height / 2 + 5
        );
    });
}

// Dibujar al personaje millennial
function dibujarMilenial() {
    ctx.drawImage(
        jugadorMilenial,
        millennial.x,
        millennial.y,
        millennial.width,
        millennial.height
    );
}

// Dibujar marcador y nivel
function dibujarMarcador() {
    // Fondo semitransparente para el marcador
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(canvas.width - 250, 5, 245, 50);

    // Texto del marcador
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Deuda emocional: ${deudaEmocional}`, canvas.width - 10, 30);
    ctx.fillText(`Nivel: ${dificultad + 1}`, canvas.width - 10, 50);

    // Mostrar puntuación máxima
    ctx.textAlign = "left";
    ctx.fillText(`Récord: ${puntuacionMaxima}`, 10, 30);
}

// Mostrar efecto de desenfoque al perder
function mostrarMotionBlur() {
    ctx.fillStyle = "rgba(34, 34, 34, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Mostrar mensaje final al perder
function mostrarMensajeFinal() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 200);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "Generación de cristal, no aguantáis nada",
        canvas.width / 2,
        canvas.height / 2 - 40
    );

    ctx.font = "20px Arial";
    ctx.fillText(
        `Tu deuda emocional es de ${deudaEmocional}`,
        canvas.width / 2,
        canvas.height / 2
    );

    // Mostrar récord
    if (Math.abs(deudaEmocional) > puntuacionMaxima) {
        ctx.fillStyle = "#FFD700"; // Color dorado
        ctx.fillText(
            "¡Nuevo récord!",
            canvas.width / 2,
            canvas.height / 2 + 30
        );
    } else {
        ctx.fillText(
            `Récord actual: ${puntuacionMaxima}`,
            canvas.width / 2,
            canvas.height / 2 + 30
        );
    }

    botonReiniciar.style.display = "block";
}

// Detectar colisiones entre el millennial y los problemas
function detectarColision(millennial, problema) {
    return (
        millennial.x < problema.x + problema.width &&
        millennial.x + millennial.width > problema.x &&
        millennial.y < problema.y + problema.height &&
        millennial.y + millennial.height > problema.y
    );
}

// Bucle principal del juego
function gameLoop(timestamp) {
    // Si el juego está en pausa, no continuar pero seguir solicitando frames
    if (juegoEnPausa) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Calcular tiempo delta para animación suave
    const deltaTime = tiempoUltimoFrame ? timestamp - tiempoUltimoFrame : 16.67;
    tiempoUltimoFrame = timestamp;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mostrar marcador
    dibujarMarcador();

    // Si hay colisión activa, mostrar pantalla final
    if (colisionActiva) {
        mostrarMotionBlur();
        mostrarMensajeFinal();
        requestAnimationFrame(gameLoop); // Seguir solicitando frames para posibles animaciones
        return;
    }

    // Actualizar dificultad
    actualizarDificultad();

    // Dibujar carriles
    for (let i = 1; i < numCarriles; i++) {
        ctx.beginPath();
        ctx.moveTo(0, carriles[i]);
        ctx.lineTo(canvas.width, carriles[i]);
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
    }

    // Generar nuevos problemas basados en el tiempo
    // Ajustamos la lógica para evitar problemas de sincronización al pausar/reanudar
    if (!ultimoTiempoGeneracion) {
        ultimoTiempoGeneracion = timestamp;
    } else if (timestamp - ultimoTiempoGeneracion > intervaloGeneracion) {
        activeProblems.push(generarProblema());
        ultimoTiempoGeneracion = timestamp;
    }

    // Dibujar elementos del juego
    dibujarMilenial();
    moverProblemas(deltaTime);
    dibujarProblemas();

    // Verificar colisiones (optimizado)
    detectarColisiones();

    // Continuar el bucle del juego
    requestAnimationFrame(gameLoop);
}

// Función separada para detectar colisiones
function detectarColisiones() {
    // Usamos some() que es más eficiente ya que se detiene cuando encuentra una coincidencia
    const hayColision = activeProblems.some((problema) => {
        if (detectarColision(millennial, problema)) {
            colisionActiva = true;

            // Reproducir sonido de colisión
            /*
            if (efectoSonidoColision) {
                efectoSonidoColision.currentTime = 0;
                efectoSonidoColision.play().catch(e => {});
            }
            
            // Detener música de fondo
            if (musicaFondo) {
                musicaFondo.pause();
            }
            */

            // Guardar puntuación máxima
            if (Math.abs(deudaEmocional) > puntuacionMaxima) {
                puntuacionMaxima = Math.abs(deudaEmocional);
                localStorage.setItem("puntuacionMaxima", puntuacionMaxima);
            }

            setTimeout(() => {
                mostrarMensajeFinal();
            }, 200);

            return true; // Detener la iteración
        }
        return false;
    });

    return hayColision;
}
