const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Imagen del millennial
const jugadorMilenial = new Image();
jugadorMilenial.src = "./img/milenial.png";

// Configuración de carriles
const numCarriles = 4; // Número de carriles
const carrilAltura = canvas.height / numCarriles; // Altura de cada carril
const carriles = [];
for (let i = 0; i < numCarriles; i++) {
    carriles.push(carrilAltura * i);
}

// Configuración del millennial
const millennial = {
    x: 50,
    y: carriles[1], // Empieza en el segundo carril
    width: 50,
    height: carrilAltura - 20,
};

const problemasArray = [
    "volver con tus padres",
    "no permitirte terapia",
    "III Guerra mundial",
    "La vivienda",
    "tus amigos tienen hijos",
    "auge del fascismo",
    "El cambio climático",
    "La depresión",
    "ansiedad",
    "Adicción al móvil",
    "FOMO",
    "Aumento del alquiler",
    "coño, la lavadora",
    "sueldos bajos",
];

const activeProblems = [];
let deudaEmocional = 0; // Marcador de deuda emocional
let colisionActiva = false; // Controla si la colisión está activa
let dificultad = 0; // Controla el nivel de dificultad dinámica

const botonReiniciar = document.getElementById("reiniciarJuego");

function actualizarDificultad() {
    const nivelActual = Math.floor(Math.abs(deudaEmocional) / 300);
    if (nivelActual > dificultad) {
        dificultad = nivelActual; // Incrementar dificultad si alcanza un nuevo nivel
    }
}

function generarProblema() {
    const problemaAleatorio =
        problemasArray[Math.floor(Math.random() * problemasArray.length)];
    const randomCarril = carriles[Math.floor(Math.random() * carriles.length)];

    const problema = {
        text: problemaAleatorio,
        x: canvas.width,
        y: randomCarril + 5, // Centrar en el carril
        width: 190,
        height: carrilAltura - 10, // Ajustar al tamaño del carril
        speed: 5,
    };
    return problema;
}

function moverProblemas(problemasArray) {
    problemasArray.forEach((problema, i) => {
        problema.x -= problema.speed + dificultad;
        if (problema.x + problema.width < 0) {
            problemasArray.splice(i, 1);
            deudaEmocional -= 50; // Resta puntos si el problema se supera
            actualizarDificultad();
        }
    });
}

function dibujarProblemas(ctx, problemasArray) {
    problemasArray.forEach((problema) => {
        ctx.fillStyle = "#FF5733";
        ctx.fillRect(problema.x, problema.y, problema.width, problema.height);
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

function dibujarMilenial(ctx, millennial) {
    ctx.drawImage(
        jugadorMilenial,
        millennial.x,
        millennial.y,
        millennial.width,
        millennial.height
    );
}

function dibujarMarcador(ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Deuda emocional: ${deudaEmocional}`, canvas.width - 10, 30);
}

function mostrarMotionBlur() {
    ctx.fillStyle = "rgba(34, 34, 34, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function mostrarMensajeFinal() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "Generación de cristal, no aguantáis nada",
        canvas.width / 2,
        canvas.height / 2 - 20
    );
    ctx.font = "20px Arial";
    ctx.fillText(
        `Tu deuda emocional es de ${deudaEmocional}`,
        canvas.width / 2,
        canvas.height / 2 + 20
    );

    botonReiniciar.style.display = "block";
}

function detectarColision(millennial, problema) {
    return (
        millennial.x < problema.x + problema.width &&
        millennial.x + millennial.width > problema.x &&
        millennial.y < problema.y + problema.height &&
        millennial.y + millennial.height > problema.y
    );
}

botonReiniciar.addEventListener("click", () => {
    window.location.reload(); // Recargar la página
});

document.addEventListener("keydown", (event) => {
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
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mostrar marcador
    dibujarMarcador(ctx);

    if (colisionActiva) {
        mostrarMotionBlur();
        mostrarMensajeFinal();
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

    dibujarMilenial(ctx, millennial);
    moverProblemas(activeProblems);
    dibujarProblemas(ctx, activeProblems);

    // Verificar colisiones
    activeProblems.forEach((problema) => {
        if (detectarColision(millennial, problema)) {
            colisionActiva = true; // Activa la colisión
            setTimeout(() => {
                mostrarMensajeFinal();
            }, 200);
        }
    });

    requestAnimationFrame(gameLoop);
}

setInterval(() => {
    activeProblems.push(generarProblema());
}, 2000);

gameLoop();
