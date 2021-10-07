var body = document.body;
var imageWidth = window.innerWidth;     //Tamanho do canvas
var imageHeight = window.innerHeight;
const postit = document.getElementById('postit');
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
var zoom = 1;
var minScale = 1;                               // Valores mínimo e máximo de zoom
var maxScale = 9;
var createEditable = document.createElement('textarea');
var lineLength = 18;                                        // Tamanho das linhas com separação de palavra
var maxLineLength = 22;                         // Tamanho das linhas independentemenete da separação
var maxLength = 130;
var postitSize = 200;
var lineStep = 25;                              // Espaçamento entre as linhas
var breakChar = "¢";                            // Caractere usado na quebra
var breakCount = 0;                             // Contagem de caracteres para quebrar
var tempText;                                   // Texto antes de ser quebrado
var highlightScaling = 2;

window.onload = function (){                                             // Inicialização da página
    body.addEventListener('wheel', checkScrollDirection);               // Permite detectar scroll
    canvas = document.getElementById("canvas");                         // Setup pro canvas
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    bounds = canvas.getBoundingClientRect();
    ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.font = "15px Arial";
    createEditable.id = "editable";
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,postitSize,["Texto exemplo"]));      // Caixas incluidas inicialmente (Para propósito de testes apenas, excluir nas etapas finais)
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,postitSize,["Outra caixa"]));
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,postitSize,["Caixa"]));
    boxArray.push(new DraggableBox(Math.random() * 1500,Math.random() * 1000,postitSize,["Mais texto"]));
    requestAnimationFrame(draw);
}

window.onunload = function(){                                           // Quando a janela não está sendo mostrada
    canvas = null;
    ctx = null;
    bounds = null;
    selectedBox = null;
    boxArray = null;
}

window.onresize = function(){                                           // Atualizando os parâmetros da inicialização caso a janela seja redimensionada
    imageWidth = window.innerWidth;                                     // Armazena o novo tamanho da janela e corrige a escala
    imageHeight = window.innerHeight;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    ctx.textAlign = "center";
    ctx.font = "15px Arial";
    requestAnimationFrame(draw);
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
        if (editBox!=null){
            textEdit();
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
                            document.body.appendChild(createEditable);                      // Insere o elemento editável na página
                            createEditable.style.filter = "hue-rotate(" + editBox.hue.toString() + "deg)";
                            createEditable.style.top = String((editBox.y-panY)*zoom)+"px";         // Coloca o elemento editável no mesmo local da caixa
                            createEditable.style.left = String((editBox.x-panX)*zoom)+"px";
                            createEditable.style.width = String(editBox.size*zoom)+"px";
                            createEditable.style.height = String(editBox.size*zoom)+"px";
                            createEditable.value = editBox.text.join(' ');                            // Coloca o mesmo texto da caixa no elemento editável
                        } else {
                            boxArray.splice(i,1);                                           // Isso exclui a caixa do array
                        }
                        return;
                    }
                }
            }
    } else {
        boxArray.push(new DraggableBox((mouseX+panX),(mouseY+panY),postitSize,["Caixa teste"]));  // Isso cria uma nova caixa
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
            if (createEditable != document.activeElement){                  // Só executar caso o modo de edição não esteja ativa
                selectedBox.x = mouseX - selectedBox.size * 0.5 + panX;    // Movendo o elemento quando o mouse está colidindo com ele
                selectedBox.y = mouseY - selectedBox.size * 0.5 + panY;
            }
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
}

window.onkeydown = function(e){
    if (e.key == "Enter") {
        if (editBox!=null){
            textEdit();
        }
    }
}

function replaceAt(string, index, replacement) {
    return string.substr(0, index) + replacement + string.substr(index + replacement.length);
}

function textEdit(){
    tempText = createEditable.value;                                // Pega o texto do elemento editável em uma variável
    tempText = tempText.substring(0, maxLength);
    for(var i=0; i<tempText.length; i++){                           // Loop para quebrar as linhas do texto
        let breakIncoming = false;
        let currentChar = tempText.charAt(i);
        breakCount++;
        if (breakCount >= lineLength){
            breakIncoming = true;
        }
        if (breakIncoming && currentChar == " "){                   // Só quebra em separação de palavras
            tempText = replaceAt(tempText, i, breakChar);
            breakIncoming = false;
            breakCount = 0;
        }
        if (breakCount >= maxLineLength){                           // Depois de certo número de caracteres, quebra independente da separação de palavras
            tempText = replaceAt(tempText, i, breakChar);
            breakIncoming = false;
            breakCount = 0;
        }
    }
    breakIncoming = false;
    breakCount = 0;
    editBox.text = tempText.split(breakChar);
    createEditable.remove();                                        // Exclui o elemento editável
    editBox = null;                                                 // Tira a caixa do modo de edição
}

function draw(){                                                        // Renderização do canvas (só renderiza elementos visíveis)
    ctx.fillStyle = "#ebebeb";                                          // Cor do background do canvas
    ctx.fillRect(0,0,imageWidth,imageHeight);
    var box = null;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;
    for (var i=0; i<boxArray.length; ++i){
        box = boxArray[i];
        xMin = box.x - panX - 2000;
        xMax = box.x + box.size - panX;
        yMin = box.y - panY;
        yMax = box.y + box.size - panY;
        if (xMax>0 && xMin<imageWidth && yMax>0 && yMin<imageHeight){   // Detecta e renderiza apenas as caixas que aparecem na tela
            box.draw();
        }
    }
}

function checkScrollDirection(event){                                  // Aplica o zoom dependendo da direção do scroll
    if (checkScrollDirectionIsUp(event)){
        if(scale>minScale){
            scale--;                                                                        // Se a direção do scroll for pra cima e não passar do limite de zoom, aumenta o zoom
            imageWidth = imageWidth - (window.innerWidth*0.1);
            imageHeight = imageHeight - (window.innerHeight*0.1);
            zoom = window.innerWidth/imageWidth;
        }
    } else {
        if(scale<maxScale){
            scale++;                                                                        // Se a direção do scroll for pra baixo e não passar do limite de zoom, diminui o zoom
            imageWidth = imageWidth + (window.innerWidth*0.1);
            imageHeight = imageHeight + (window.innerHeight*0.1);
            zoom = window.innerWidth/imageWidth;
        }
    }
    createEditable.remove();                                            // Exclui o elemento editável
    editBox = null;                                                     // Tira a caixa do modo de edição
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
    constructor(x, y, size, text) {
        this.x = x;                                                     // Coordenadas da caixa
        this.y = y;
        this.size = size;                                             // Tamanho da caixa
        this.text = text;                                               // Conteúdo da caixa
        this.hue = Math.random() * 360;                                 // Variação de cor nos post-its
        this.isSelected = false;                                        // Seleção e edit da caixa
    }
    isCollidingWidthPoint(x, y) {
        return (x > this.x && x < this.x + this.size) && (y > this.y && y < this.y + this.size);         // Retorna true caso as coordenadas recebidas coincidam com as coordenadas ocupadas por uma caixa
    }
    drag(newX, newY) {
        this.x = newX - this.size * 0.5;
        this.y = newY - this.size * 0.5;
    }
    draw() {
        ctx.filter = "hue-rotate(" + this.hue.toString() + "deg)";      // Adicionando filtro de cor
        if (this.isSelected && editBox == null) {     
            ctx.drawImage(postit, this.x - panX - (5*highlightScaling), this.y - panY - (5*highlightScaling), this.size + (5*highlightScaling*2), this.size + (5*highlightScaling*2));       // Preenche a caixa com a cor de seleção
            ctx.font = "17px Arial";
        } else {
            ctx.drawImage(postit, this.x - panX, this.y - panY, this.size, this.size);                                            // Preenche a caixa com a cor padrão
            ctx.font = "15px Arial";
        }
        ctx.filter = "none";                                            // Tirando filtro de cor
        ctx.fillStyle = "#000000";                                                                                          // Cor do texto
        for (var i=0; i<this.text.length; i++){
            ctx.fillText(this.text[i], this.x + this.size * 0.5 - panX, (this.y + this.size * 0.5 - panY) + (i*lineStep) - ((this.text.length*lineStep/2)-(1*lineStep/2)), this.size);           // Preenche a caixa com texto (multilinha)
        }
        ctx.fillStyle = "#c2c2c2";                                                                                          // Cor padrão da caixa
    }
}