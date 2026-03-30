const cmds = {
    // name: function, allows for other cmds
    clear : [() => {
        outputElem.innerHTML = "";
    }, false],
    help : [() => {
        let helpText = `${createSpan("help", colors.help)} - produces a list of cmds <br>`
        let clearText = `${createSpan("clear", colors.clear)} - clears the output <br>`
        return helpText + clearText;
    }, false]
}

const colors = {
    "clear" : "#ff8585",
    "help" : "#2eff93"
}

const linePrefix = "> ";

const outputElem = document.getElementById("output");
const inputElem = document.getElementById("input");

let prevCmds = [];
let prevCmdsIndex = 0;

let currentTextOffset = 0;
let canType = false;

function stopTextSelection(){
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
}

function calcCursorOffset(){
    if (inputElem.textContent === "") {
        currentTextOffset = 0;
        inputElem.style.setProperty("--cursor-offset", `${1}`);
        return;
    }
    
    let isLastCharSpace = inputElem.textContent[inputElem.textContent.length - 1] === " ";
    let thisTextOffset = currentTextOffset + (isLastCharSpace ? 1 : 0);
    inputElem.style.setProperty("--cursor-offset", `${thisTextOffset}`);
}

window.addEventListener("keydown", e => {
    if (canType === false) { return; }
    
    if (e.code === "Backspace"){
        stopTextSelection();
        
        if (inputElem.textContent.length <= 1 && currentTextOffset === 0) {
            inputElem.textContent = "";
        } else {
            if (currentTextOffset === 0){
                let newText = inputElem.textContent.slice(0, -1);
                inputElem.textContent = newText;
            } else if (inputElem.textContent.length > 1) {
                let newText = inputElem.textContent.slice(0, currentTextOffset - 1) + inputElem.textContent.slice(currentTextOffset, inputElem.textContent.length);
                inputElem.textContent = newText;
            }
        }
        calcCursorOffset();
        inputElem.innerHTML = colorSyntax(inputElem.textContent);
        return
    }
    
    if (
        e.code !== "ArrowUp" && 
        e.code !== "ArrowDown" && 
        e.code !== "ArrowLeft" && 
        e.code !== "ArrowRight"
    ) { return; }
    
    stopTextSelection();
    
    if (e.code === "ArrowLeft"){
        currentTextOffset = Math.max(currentTextOffset - 1, -inputElem.textContent.length);
    } else if (e.code === "ArrowRight"){
        currentTextOffset = Math.min(currentTextOffset + 1, 0);
    } else if (e.code === "ArrowUp") {
        prevCmdsIndex = (prevCmdsIndex - 1) % prevCmds.length;
        if (prevCmdsIndex === NaN) { prevCmdsIndex = null; }
        else if (prevCmdsIndex === -1) { prevCmdsIndex = prevCmds.length - 1; }
        
        if (prevCmdsIndex !== null) { 
            inputElem.textContent = prevCmds[prevCmdsIndex]; 
            inputElem.innerHTML = colorSyntax(inputElem.textContent); 
        }
    } else { // "ArrowDown"
        prevCmdsIndex = (prevCmdsIndex + 1) % prevCmds.length;
        if (prevCmdsIndex === NaN) { prevCmdsIndex = null; }
        
        if (prevCmdsIndex !== null) { 
            inputElem.textContent = prevCmds[prevCmdsIndex]; 
            inputElem.innerHTML = colorSyntax(inputElem.textContent); 
        }
    }
    
    calcCursorOffset();
});

function createSpan(text, color) {
    return `<span style="--color: ${color}">${text}</span>`;
}

function colorSyntax(text){
    text = text.split(" ");
    
    for (let i = 0; i < text.length; i++){
        let color = colors[text[i]];
        if (color === undefined) { continue; }
        //text[i] = `<span style="--color: ${color}">${text[i]}</span>`;
        text[i] = createSpan(text[i], color);
    }
    
    return text.join(" ");
}

function handleCmds(){
    canType = false;
    
    let text = inputElem.textContent;
    let html = inputElem.innerHTML;
    
    inputElem.textContent = "";
    let output = outputElem.innerHTML + " " + html + "<br>";
    outputElem.innerHTML = output;
    
    let cmdList = text.split(" ");
    
    let cmd1Name = cmdList.shift()
    let cmd1 = cmds[cmd1Name];
    
    if (cmd1 === undefined) {
        outputElem.innerHTML = outputElem.innerHTML + `Unkown cmd ${cmd1Name} <br>`;
    } else {
        if (cmd1[1] === true) { // WIP 
            for (let i = 0; i < cmdList.length; i++){
        
            }
        } else {
            let res = cmd1[0](...cmdList); // rest of the cmd line are params
            if (res !== undefined) {
                outputElem.innerHTML = outputElem.innerHTML + res;
            }
        }
    }
    
    outputElem.innerHTML = outputElem.innerHTML + linePrefix;
    
    prevCmds.push(text);
    
    calcCursorOffset();
    
    canType = true;
}

window.addEventListener("keypress", e => {
    if (canType === false) { return; }
    stopTextSelection();
    
    if (e.code === "Enter") {
        handleCmds();
        
        return;
    }
    
    let key = e.key;
    
    if (currentTextOffset === 0){
        inputElem.textContent = inputElem.textContent + key;
    } else {
        inputElem.textContent = inputElem.textContent.slice(0, currentTextOffset) + key + inputElem.textContent.slice(currentTextOffset, inputElem.textContent.length);
    }
    
    calcCursorOffset();
    inputElem.innerHTML = colorSyntax(inputElem.textContent);
});

function bootUp(){
    setTimeout(() => {
        let output = outputElem.innerHTML + "<br>" + "booting complete" + "<br>" + linePrefix;
        outputElem.innerHTML = output;
        
        calcCursorOffset();
        
        canType = true;
    }, 1000);
}

window.oncontextmenu = () => false;
calcCursorOffset();

bootUp();
