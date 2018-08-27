//JsPentis es un juego basado en el popular Tetris, programado en Javascript y partiendo de una tabla como base.
//El codigo no esta nada optimizado, ya que al tratarse de una toma de contacto con JS se ha priorizado la sencillez. 
//Aun asi, cualquier mejora es bienvenida :)


//Pentominos
var f = { blocks: 0b0000000110011000010000000, color: 'lightcoral'   };
var ia = { blocks: 0b0000000000111110000000000, color: 'cyan'   };
var l = { blocks: 0b0100001000010000110000000, color: 'orange'   };
var n = { blocks: 0b0010001100010000100000000, color: 'sandybrown'   };
var p = { blocks: 0b0000001000011000110000000, color: 'lawngreen'   };
var t = { blocks: 0b0000001110001000010000000, color: 'purple'   };
var u = { blocks: 0b0000001010011100000000000, color: 'yellow'   };
var v = { blocks: 0b0000001000010000111000000, color: 'aquamarine'   };
var w = { blocks: 0b0000001000011000011000000, color: 'gray'   };
var xa = { blocks: 0b0000000100011100010000000, color: 'skyblue'   };
var ya = { blocks: 0b0001000110000100001000000, color: 'seagreen'   };
var z = { blocks: 0b0000001100001000011000000, color: 'red'   };

//Chiral pentominos
var fc = { blocks: 0b0000001100001100010000000, color: 'moccasin'   };
var lc = { blocks: 0b0001000010000100011000000, color: 'blue'   };
var nc = { blocks: 0b0010000110000100001000000, color: 'violet'   };
var pc = { blocks: 0b0000000100011000110000000, color: 'tomato'   };
var yc = { blocks: 0b0100001100010000100000000, color: 'slateblue'   };
var zc = { blocks: 0b0000000110001000110000000, color: 'green'   };

//Variables globales
var puntuacion = 0;
var x = 0;
var y = 0;
var tablero = new Array(288);
var siguientebloque = new Array(2);
var actualbloque = new Array(2);

//Tiempo
var tiempo;
var temporizador;

//Estados
var listaestilos = ["2px solid white", "1px solid black", "none"]
var estilo = 3;
//0: sin iniciar 1: en curso 2:pausa
var juego = 0;

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function cambiarestilo()
{
    if(estilo > 2) estilo = 0;
    var elementos = document.getElementsByTagName("td");
    for(var i = 0, total = elementos.length; i < total; i++) elementos[i].style.border=listaestilos[estilo];
    estilo++;
     
}

function DibujarCuadrado(y, x, color, fijar, tabla = "principal") {
    //fijar 0:solo pintar 1:fijar
    if ((fijar == 1)) tablero[y*12 + x] = color;
    document.getElementsByClassName(tabla)[y].getElementsByTagName("td")[x].style.backgroundColor=color;
}

function juegonuevo()
{
    if(juego == 1) {
        clearInterval(temporizador);
        document.getElementById("nuevo").innerHTML = "Continuar";
        juego = 2;
        return 0;
    }

    if(juego == 2) {
        temporizador = setInterval(bajar, tiempo);
        document.getElementById("nuevo").innerHTML = "Pausa";
        juego = 1;
        return 0;
    }

    //Inicializamos el tablero en blanco, puntuacion y tiempo
    for (var i = 0; i < 288; i++) tablero[i] = 'white';
    for (var i = 0; i < 288; i++) DibujarCuadrado(Math.floor(i/12), i%12, 'white', 1);
    puntuacion = 0;
    tiempo = 5100;
    juego = 1;
    document.getElementById("puntuacion").innerHTML = puntuacion;
    document.getElementById("nuevo").innerHTML = "Pausa";
    //Ponemos un bloque en pantalla
    Bloque();
    temporizador = setInterval(bajar, tiempo);
}


function dibujarbloque(y, x, pieza, modo, fijar, tabla = "principal") {

    //modo 0:pintar bloque 1:borrar bloque 2:probar si es valido
    //fijar 0:solo pintar 1:fijar

    bloque = pieza[0];
    color = pieza[1];

    for (var i = 0; i < 5; i++) {
        izquierda = x;
        for (var j = 0; j < 5; j++) {
            var mask = 1 << (24 - (i*5 + j));
            if ((mask & bloque) != 0) {
               if (modo == 0) DibujarCuadrado(y, izquierda, color, fijar, tabla); 
               if (modo == 1) DibujarCuadrado(y, izquierda, 'white', fijar);
               if (modo == 2) if ((tablero[y*12 + izquierda] != 'white') || (izquierda > 11) || (izquierda < 0)) return 4;   
            } 
            izquierda++ ;
        }
        y++; 
    }

    return 0;

}

function Generarficha() {

    actualbloque = siguientebloque.slice();
    for (var i = 0; i < 25; i++) DibujarCuadrado(Math.floor(i/5), i%5, 'white', 0, "next");

    clases = [f, ia, l, n, p, t, u, v, w, xa, ya, z, fc, lc, nc, pc, yc, zc];
    azar = randomIntFromInterval(0,17);
    siguientebloque[0] = clases[azar].blocks;
    siguientebloque[1] = clases[azar].color;
    rotaciones = randomIntFromInterval(0,3)
    for(var i = 0; i < rotaciones; i++) siguientebloque = rotar(siguientebloque);

    dibujarbloque(0, 0, siguientebloque, 0, 0, "next");
}

function Bloque() {
    x = 3;
    y = 0;
    Generarficha();
    lineascompletas();

    if(dibujarbloque(y, x, actualbloque, 2, 0) == 4) {
        juego = 0;
        document.getElementById("nuevo").innerHTML = "Nuevo juego";
        clearInterval(temporizador);
        alert("Perdiste\nRecuerda que puedes iniciar un juego nuevo pulsando la tecla espacio");
        return 0;
    }

    dibujarbloque(y, x, actualbloque, 0, 0);
    
}

function lineascompletas() {
    var i = 0;
    var j = 0;
    var filasenteras = 0;

    for(i = 0; i < 24; i++) {
        for (j = 0; j < 12; j++) if (tablero[i*12 + j] == 'white') break;
        if (j == 12){
            tablero.splice(i*12, 12);
            tablero.splice(0, 0, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white');
            filasenteras++;
        }
    } 

    if(!filasenteras) return(0);

    //Si se ha completado alguna fila, actualizamos el juego asi como la puntuacion y el tiempo
    for (var i = 0; i < 288; i++) DibujarCuadrado(Math.floor(i/12), i%12, tablero[i], 1) ;

    puntuacion += filasenteras;
    document.getElementById("puntuacion").innerHTML = puntuacion;
    if (tiempo > 500) tiempo -= filasenteras*20;
    if (tiempo < 500) tiempo = 500;
    clearInterval(temporizador);
    temporizador = setInterval(bajar, tiempo);
    
}

rotar = function (bloque) {

    var rotado = 0;

    for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var mask = (1 << (i*5 + j));
                if ((mask & bloque[0]) != 0) rotado += (1 << (4 - i + j*5));
            }
        }

    bloque[0] = rotado;

    return(bloque);

}

girar = function () {

    var rotado = actualbloque.slice();
    rotado = rotar(rotado);
    if(dibujarbloque(y, x, rotado, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, actualbloque, 1, 0);
    actualbloque = rotado.slice();
    dibujarbloque(y, x, actualbloque, 0, 0);
}

bajarfuerte = function () {
    dibujarbloque(y, x, actualbloque, 1, 0);
    while (dibujarbloque(y, x, actualbloque, 2, 0) != 4) y++ ;
    dibujarbloque(y - 1, x, actualbloque, 0, 1);
    Bloque();
}

bajar = function () {
    if(dibujarbloque(y + 1, x, actualbloque, 2, 0) == 4) {
        dibujarbloque(y, x, actualbloque, 0, 1);
        Bloque();
        return(0);
    }
    dibujarbloque(y, x, actualbloque, 1, 0);
    y++;
    dibujarbloque(y, x, actualbloque, 0, 0);
}

derecha = function () {
    if(dibujarbloque(y, x + 1, actualbloque, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, actualbloque, 1, 0);
    x++;
    dibujarbloque(y, x, actualbloque, 0, 0);
}

movizquierda = function () {
    if(dibujarbloque(y, x - 1, actualbloque, 2, 0) == 4) return(0) ;
    dibujarbloque(y, x, actualbloque, 1, 0);
    x--;
    dibujarbloque(y, x, actualbloque, 0, 0);
}

acciones = function(tecla) {

    if(juego != 1 && tecla < 41 && tecla > 36) {
        alert("El juego no esta en curso");
        return 0;
    }

    switch(tecla) {
        case 32:
            juegonuevo();
            break;
        case 37:
            movizquierda();
            break;
        case 39:
            derecha();
            break;
        case 38:
            girar();
            break;
        case 40:
            bajarfuerte();
            break;
        default:  
            return 0;          
    }
}


//Lectura de teclado
window.addEventListener('keydown', function(event) {
    var keycode = event.keyCode;
    event.preventDefault();
    acciones(keycode);   
}, false);

//Iniciamos la primera ficha
Generarficha();


