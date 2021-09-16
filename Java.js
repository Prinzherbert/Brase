var imageWidth = document.body.clientWidth; //Tamanho do canvas
var imageHeight = document.body.clientHeight;
var canvas = null;
var ctx = null;
var bounds = null;
var selectedBox = null;
var panX = 0; // "Pan" é o local do canvas infinito sendo mostrado na tela
var panY = 0;
var mouseX = 0; // Coordenadas do mouse
var mouseY = 0;
var oldMouseX = 0; //Coordenadas anteriores do mouse
var oldMouseY = 0;
var mouseHeld = false;
var boxArray = []; //Array onde vão ficar os elementos

function DraggableBox(x,y,width,height,text){ //Elemento sendo usado para testes, caixa arrastável
    this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.text = text;
	this.isSelected = false;
}

DraggableBox.prototype.isCollidingWidthPoint = function(x,y){ //Função para detectar se o mouse está em cima do elemento
    return (x>this.x && x<this.x + this.width) && (y>this.y && y<this.y + this.height);
}

DraggableBox.prototype.drag = function(newX,newY){ //Função para arrastar o elemento
    this.x = newX - this.width * 0.5;
    this.y = newY - this.height * 0.5;
}

DraggableBox.prototype.draw = function() { //Renderização do elemento
    if (this.isSelected){
        ctx.fillStyle = "#828282";
        ctx.fillRect(this.x - panX, this.y - panY, this.width, this.height);
        ctx.fillStyle = "#c2c2c2";
    } else {
        ctx.fillRect(this.x - panX, this.y - panY, this.width, this.height);
    }
    ctx.fillStyle = "#003a6e";
    ctx.fillText(this.text, this.x + this.width * 0.5 - panX, this.y + this.height * 0.5 - panY, this.width);
    ctx.fillStyle = "#c2c2c2";
}

window.onmousedown = function(e){ //O que acontece ao segurar o mouse
    mouseHeld = true;
    if (!selectedBox){
        for (var i = boxArray.length - 1; i > -1; --i){
            if (boxArray[i].isCollidingWidthPoint(mouseX + panX, mouseY + panY)){ //Detectando se o mouse colide com algum elemento
                selectedBox = boxArray[i];
                selectedBox.isSelected = true;
                requestAnimationFrame(draw);
                return;
            }
        }
    }
}

window.onmousemove = function(e){ //O que acontece ao mover o mouse
    mouseX = e.clientX - bounds.left;
    mouseY = e.clientY - bounds.top;
    if (mouseHeld){
        if (!selectedBox){
            panX += oldMouseX - mouseX; //Mudando o local mostrado quando o mouse é arrastado sem colidir com um elemento
            panY += oldMouseY - mouseY;
        } else {
            selectedBox.x = mouseX - selectedBox.width * 0.5 + panX; //Movendo o elemento quando o mouse está colidindo com ele
            selectedBox.y = mouseY - selectedBox.height * 0.5 + panY;
        }
    }
    oldMouseX = mouseX;
    oldMouseY = mouseY;
    requestAnimationFrame(draw);
}

window.onmouseup = function(e){ //O que acontece quando solta o mouse
    mouseHeld = false;
    if (selectedBox){
        selectedBox.isSelected = false;
        selectedBox = null;
        requestAnimationFrame(draw);
    }
}

function draw(){ //Renderização do canvas (só renderiza elementos visíveis)
    ctx.fillStyle = "#ebebeb";
    ctx.fillRect(0,0,imageWidth,imageHeight);
    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;
    ctx.fillStyle = "#c2c2c2";
    for (var i=0; i<boxArray.length; ++i){
        box = boxArray[i];
        xMin = box.x - panX - 2000;
        xMax = box.x + box.width - panX;
        yMin = box.y - panY;
        yMax = box.y + box.width - panY;
        if (xMax>0 && xMin<imageWidth && yMax>0 && xMin<imageHeight){
            box.draw();
        }
    }
}

window.onload = function(){ //Inicialização da página
    canvas = document.getElementById("canvas");
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    bounds = canvas.getBoundingClientRect();
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.font = "15px Arial";
    boxArray.push(new DraggableBox(0,0,150,50,"Caixa teste")); //Elementos utilizados como exemplo
    boxArray.push(new DraggableBox(Math.random() * 320,Math.random() * 240,100,50,"Texto exemplo"));
    boxArray.push(new DraggableBox(Math.random() * 320,Math.random() * 240,100,50,"Outra caixa"));
    boxArray.push(new DraggableBox(Math.random() * 320,Math.random() * 240,100,50,"Caixa"));
    boxArray.push(new DraggableBox(Math.random() * 320,Math.random() * 240,150,50,"Mais texto"));
    requestAnimationFrame(draw);
}

window.onunload = function(){ //Finalização da página
    canvas = null;
    ctx = null;
    bounds = null;
    selectedBox = null;
    boxArray = null;
}

window.onresize = function(){ //Atualizando os parâmetros da inicialização caso a janela seja redimensionada
    var imageWidth = document.body.clientWidth;
    var imageHeight = document.body.clientHeight;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    ctx.textAlign = "center";
}