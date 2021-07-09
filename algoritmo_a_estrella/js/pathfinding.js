//variables
var canvas;
var ctx;
var FPS = 50;

// tablero
var columnas = 25;
var filas = 25;
var tablero; //matriz del nivel

//tiles
var anchoT;
var altoT;

const muro = '#333333';
const camino = '#cccccc';

//Ruta
var principio;
var fin;

var openSet = [];
var closedSet = [];

var caminoC = [];
var terminado = false;

//creamos array 2d
function creaArray2d(f, c) {
    var obj = new Array(f);
    for (a = 0; a < f; a++) {
        obj[a] = new Array(c);
    }
    return obj;
}

function heuristica(a, b) {
    var x = Math.abs(a.x - b.x);
    var y = Math.abs(a.y - b.y);

    var dist = x + y;

    return dist;
}

function clsArray(array, elemento) {
    for (i = array.length - 1; i >= 0; i--) {
        if (array[i] == elemento) {
            array.splice(i, 1);
        }
    }
}

//casillas obj
function casillas(x, y) {
    //posicion
    this.x = x;
    this.y = y;

    //tipo (obs = 1, vacio = 0)
    this.tipo = 0;

    var aleatorio = Math.floor(Math.random() * 5); //0-4
    if (aleatorio == 1)
        this.tipo = 1;

    //carga de casillas
    this.f = 0; //coste total (g + h)
    this.g = 0; //pasos dados
    this.h = 0; //heuristica(estimacion)

    this.vecinos = [];
    this.padre = null;

    //metodo calcula vecinos
    this.addVecinos = function() {
        if (this.x > 0) {
            this.vecinos.push(tablero[this.y][this.x - 1]); //vecino izq
        }
        if (this.x < filas - 1) {
            this.vecinos.push(tablero[this.y][this.x + 1]); //vecino der
        }
        if (this.y > 0) {
            this.vecinos.push(tablero[this.y - 1][this.x]); // vecino arriba
        }
        if (this.y < columnas - 1) {
            this.vecinos.push(tablero[this.y + 1][this.x]); //vecino abajo
        }
        //console.log(this.vecinos);
    }

    //metodo que dibuja
    this.dibuja = function() {
        var color;
        if (this.tipo == 0) { color = camino; }

        if (this.tipo == 1) { color = muro; }

        //dibujamos
        ctx.fillStyle = color;
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }

    //dibuja openset
    this.dibujaOpenSet = function() {
        ctx.fillStyle = '#008000';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }

    //dibuja closedset
    this.dibujaClosedSet = function() {
        ctx.fillStyle = '#800000';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }


    //dibuja camino
    this.dibujaCamino = function() {
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(this.x * anchoT, this.y * altoT, anchoT, altoT);
    }
}

function onInicia() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    //cal el tamaño de los tiles ( proporcional)
    anchoT = parseInt(canvas.width / columnas);
    altoT = parseInt(canvas.height / filas);
    //console.log('ancho: ' + anchoT + ' alto: ' + altoT);

    //creamos la matriz
    tablero = creaArray2d(filas, columnas);

    //añadimos los objetos casillas
    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            tablero[i][j] = new casillas(j, i);
        }
    }

    //añadimos vecinos
    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            tablero[i][j].addVecinos();
        }
    }

    //creamos origen y destino
    principio = tablero[0][0];
    fin = tablero[columnas - 1][filas - 1];

    //inicializamos openSet
    openSet.push(principio);

    //ejecutamos principal bucle
    setInterval(principal, 1000 / FPS)

}

function dibujaTablero() {
    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            tablero[i][j].dibuja();
        }
    }

    //dibuja openset
    for (i = 0; i < openSet.length; i++) {
        openSet[i].dibujaOpenSet();
    }

    //dibuja closedset
    for (i = 0; i < closedSet.length; i++) {
        closedSet[i].dibujaClosedSet();
    }

    //dibuja closedset
    for (i = 0; i < caminoC.length; i++) {
        caminoC[i].dibujaCamino();
    }
}

function clsCanvas() {
    canvas.width = canvas.width;
    canvas.height = canvas.height;
}

function algoritmo() {
    //seguimos hasta encontrar solucion
    if (terminado != true) {
        //seguimos si hay algo en openset
        if (openSet.length > 0) {
            //buscamos el mejor camino
            var ganador = 0; //indice dentro del array openset

            //evaluamos que openset tiene el menor coste
            for (i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[ganador].f) {
                    ganador = i;
                }
            }

            //analizamos la mejor casilla
            var actual = openSet[ganador];

            //si llegamos al final buscamos el camino devuelta
            if (actual === fin) {
                var temporal = actual;
                caminoC.push(temporal);
                while (temporal.padre != null) {
                    temporal = temporal.padre;
                    caminoC.push(temporal);
                }

                console.log('Se encontro el camino posible')
                terminado = true;
            }
            //si no hemos llegado al final, sigue
            else {
                clsArray(openSet, actual);
                closedSet.push(actual);

                var vecinos = actual.vecinos;

                //recorro los vecinos del ganador
                for (i = 0; i < vecinos.length; i++) {
                    var vecino = vecinos[i];
                    //si el vecino no esta en closed y no es una pared
                    //hacemos calculos
                    if (!closedSet.includes(vecino) && vecino.tipo != 1) {
                        var tempG = actual.g + 1;
                        //si el vecino esta en open y la carga es mayor
                        if (openSet.includes(vecino)) {
                            if (tempG < vecino.g) {
                                vecino.g = tempG; //camino mas corto
                            }
                        } else {
                            vecino.g = tempG;
                            openSet.push(vecino);
                        }
                        //actualizamos valores
                        vecino.h = heuristica(vecino, fin);
                        vecino.f = vecino.g + vecino.h;

                        //guardamos el padre
                        vecino.padre = actual;
                    }
                }
            }
        } else {
            console.log('No se encontro el camino posible')
            terminado = true; //algoritmo termina
        }
    }
}

function principal() {
    clsCanvas();
    algoritmo();
    dibujaTablero();
}