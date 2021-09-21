var body = document.body;
var imageWidth = window.innerWidth;     //Tamanho do canvas
var imageHeight = window.innerHeight;
var canvas = null;                              // Variáveis nulas para inicialização e operação do canvas;
var ctx = null;
var bounds = null;
var boxArray = [];                              // Array onde vão ficar os elementos
var selectedBox = null;
var editBox = null;
var panX = 0;                                   // "Pan" é o local do canvas infinito sendo mostrado na tela
var panY = 0;
var mouseX = 0;                                 // Coordenadas do mouse
var mouseY = 0;
var oldMouseX = 0;                              // Coordenadas anteriores do mouse
var oldMouseY = 0;
var displayX = document.getElementById("x");    // Elementos que mostram as coordenadas atuais na tela
var displayY = document.getElementById("y");
var mouseHeld = false;                          // Detecta se o mouse continua apertado
var isCreate = false;                           // Modo de criação de caixas
var isDelete = false;                           // Modo de exclusão de caixas
var scale = 5;                                  // Variável para manter contagem simples do zoom
var minScale = 1;                               // Valores mínimo e máximo de zoom
var maxScale = 9;

window.onload = function(){                                             // Inicialização da página
    body.addEventListener('wheel', checkScrollDirection);               // Permite detectar scroll
    canvas = document.getElementById("canvas");                         // Setup pro canvas
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    bounds = canvas.getBoundingClientRect();
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.font = "15px Arial";
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,150,150,"Texto exemplo"));      // Caixas incluidas inicialmente (Para propósito de testes apenas, excluir nas etapas finais)
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,150,150,"Outra caixa"));
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,150,150,"Caixa"));
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,150,150,"Mais texto"));
    requestAnimationFrame(draw);
}

window.onunload = function(){                                           // Quando a janela não está sendo mostrada
    canvas = null;
    ctx = null;
    bounds = null;
    selectedBox = null;
    boxArray = null;
}

window.onresize = function(){                                           // Atualizando os parâmetros da inicialização caso a janela seja redimensionada (Isso não tá mais funcionando, ARRUMAR)
    var imageWidth = window.innerWidth;
    var imageHeight = window.innerHeight;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    ctx.textAlign = "center";
}

window.onmousedown = function(e){                                       //O que acontece ao segurar o mouse
    mouseHeld = true;
    if (!selectedBox){
        for (var i = boxArray.length - 1; i > -1; --i){
            if (boxArray[i].isCollidingWidthPoint(mouseX + panX, mouseY + panY)){           //Detectando se o mouse colide com algum elemento
                selectedBox = boxArray[i];
                selectedBox.isSelected = true;
                requestAnimationFrame(draw);
                return;
            }
        }
    }
}

window.ondblclick = function(e){                                        // Executa com clique duplo
    if (isCreate == false){
            if (!editBox){
                for (var i = boxArray.length - 1; i > -1; --i){
                    if (boxArray[i].isCollidingWidthPoint(mouseX + panX, mouseY + panY)){   // Detectando se o mouse colide com algum elemento
                        if(isDelete == false){
                            editBox = boxArray[i];                                          // Isso muda o texto da caixa
                            editBox.isEdit = true;
                            editBox.text = "Editado";
                        } else {
                            boxArray.splice(i,1);                                           // Isso exclui a caixa do array
                        }
                        return;
                    }
                }
            }
    } else {
        boxArray.push(new DraggableBox((mouseX+panX),(mouseY+panY),150,150,"Caixa teste"));  // Isso cria uma nova caixa
        requestAnimationFrame(draw);
    }
}

window.onmousemove = function(e){                                                           // O que acontece ao mover o mouse
    mouseX = (e.clientX - bounds.left)*(imageWidth/window.innerWidth);                      // Calculando a posição do mouse levando em conta resolução e zoom
    mouseY = (e.clientY - bounds.top)*(imageHeight/window.innerHeight);
    if (mouseHeld){
        if (!selectedBox){
            panX += oldMouseX - mouseX;                                 // Mudando o local mostrado quando o mouse é arrastado sem colidir com um elemento
            panY += oldMouseY - mouseY;
            displayX.innerText = Math.round(panX);                      // Mostra as coordenadas atuais arredondadas no elemento específico
            displayY.innerText = Math.round(panY);
        } else {
            selectedBox.x = mouseX - selectedBox.width * 0.5 + panX;    // Movendo o elemento quando o mouse está colidindo com ele
            selectedBox.y = mouseY - selectedBox.height * 0.5 + panY;
        }
    }
    oldMouseX = mouseX;                                                 // Guarda a última posição do mouse
    oldMouseY = mouseY;
    requestAnimationFrame(draw);
}

window.onmouseup = function(e){                                         // Executado ao soltar o mouse
    mouseHeld = false;
    if (selectedBox){
        selectedBox.isSelected = false;                                 // Remove a seleção da caixa caso se aplique
        selectedBox = null;
        requestAnimationFrame(draw);
    }
    if (editBox){
        editBox.isEdit = false;                                         // Remove o modo de edição da caixa caso se aplique
        editBox = null;
    }
}

function draw(){                                                        // Renderização do canvas (só renderiza elementos visíveis)
    ctx.fillStyle = "#ebebeb";                                          // Cor do background do canvas
    ctx.fillRect(0,0,imageWidth,imageHeight);
    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;
    ctx.fillStyle = "#c2c2c2";                                          // Cor padrão da caixa
    for (var i=0; i<boxArray.length; ++i){
        box = boxArray[i];
        xMin = box.x - panX - 2000;
        xMax = box.x + box.width - panX;
        yMin = box.y - panY;
        yMax = box.y + box.width - panY;
        if (xMax>0 && xMin<imageWidth && yMax>0 && yMin<imageHeight){   // Detecta e renderiza apenas as caixas que aparecem na tela
            box.draw();
        }
    }
}

function checkScrollDirection(event){                                  // Aplica o zoom dependendo da direção do scroll
    if (checkScrollDirectionIsUp(event)){
        if(scale>minScale){
            scale--;                                                                        // Se a direção do scroll for pra cima e não passar do limite de zoom, aumenta o zoom
            imageWidth = imageWidth - (document.body.clientWidth*0.1);
            imageHeight = imageHeight - (document.body.clientHeight*0.1);
        }
    } else {
        if(scale<maxScale){
            scale++;                                                                        // Se a direção do scroll for pra baixo e não passar do limite de zoom, diminui o zoom
            imageWidth = imageWidth + (document.body.clientWidth*0.1);
            imageHeight = imageHeight + (document.body.clientHeight*0.1);
        }
    }
    canvas.width = imageWidth;                                          // Atualiza as dimensões e texto do canvas para se ajustarem ao novo zoom
    canvas.height = imageHeight;
    ctx.textAlign = "center";
    ctx.font = "15px Arial";
    requestAnimationFrame(draw);
}
  
function checkScrollDirectionIsUp(event){                               // Detecta a direção do scroll
    if (event.wheelDelta) {
      return event.wheelDelta > 0;                                      // Retorna true se o comando de scroll for positivo
    }
    return event.deltaY < 0;                                            // Retorna false se o comando de scroll for negativo
}

function CreateBoxMode(){                                                   // Função para entrar no modo de criação de caixas
    isCreate = !isCreate;
    isDelete = false;
    if(isCreate){
        document.body.style.cursor = "copy";                            // Altera o cursor para indicar o modo de criação
    } else {
        document.body.style.cursor = "pointer";
    }
}

function DeleteBoxMode(){                                                   // Função para entrar no modo de exclusão de caixas
    isDelete = !isDelete;
    isCreate = false;
    if(isDelete){
        document.body.style.cursor = "crosshair";                       // Altera o cursor para indicar o modo de exclusão
    } else {
        document.body.style.cursor = "pointer";
    }
}

class DraggableBox {                                                    // Classe para as caixas arrastáveis (O VSCode transformou em uma classe automaticamente, lembrar de pesquisar sobre em etapas futuras)
    constructor(x, y, width, height, text) {
        this.x = x;                                                     // Coordenadas da caixa
        this.y = y;
        this.width = width;                                             // Tamanho da caixa
        this.height = height;
        this.text = text;                                               // Conteúdo da caixa
        this.isSelected = false;                                        // Seleção e edit da caixa
        this.isEdit = false;
    }
    isCollidingWidthPoint(x, y) {
        return (x > this.x && x < this.x + this.width) && (y > this.y && y < this.y + this.height);         // Retorna true caso as coordenadas recebidas coincidam com as coordenadas ocupadas por uma caixa
    }
    drag(newX, newY) {
        this.x = newX - this.width * 0.5;
        this.y = newY - this.height * 0.5;
    }
    draw() {
        if (this.isSelected) {
            ctx.fillStyle = "#828282";                                                                                      // Cor ao selecionar a caixa
            ctx.fillRect(this.x - panX, this.y - panY, this.width, this.height);                                            // Preenche a caixa com a cor de seleção
            ctx.fillStyle = "#c2c2c2";                                                                                      // Cor padrão do elemento devolvida
        } else {
            ctx.fillRect(this.x - panX, this.y - panY, this.width, this.height);                                            // Preenche a caixa com a cor padrão
        }
        ctx.fillStyle = "#003a6e";                                                                                          // Cor do texto
        ctx.fillText(this.text, this.x + this.width * 0.5 - panX, this.y + this.height * 0.5 - panY, this.width);           // Preenche a caixa com texto
        ctx.fillStyle = "#c2c2c2";                                                                                          // Cor padrão da caixa
    }
}