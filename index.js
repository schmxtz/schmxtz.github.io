const API_ADDRESS = "https://jptranscriptionapi.onrender.com/";
const ICON = "<i class=\"fa fa-caret-down\"></i>";
const ICON2 = "<i class=\"fa fa-arrow-circle-right\" aria-hidden=\"true\"></i>";
let REQUEST = {
    input_text: undefined,
    src_lang: 'de',
    target_lang: 'ja',
};

// On load window loaded stuff
window.addEventListener("load", (event) => {
    // Init dropdown menu
    const dropdownElements = document.getElementsByClassName("dropdown-element");
    const buttonText = document.getElementsByClassName("button-13")[0];
    for (let dropdownElement of dropdownElements) {
        dropdownElement.addEventListener("click", (e) => dropdownClick(e.target, buttonText));
    }

    // Init textbox listeners
    const textBoxes = document.getElementsByClassName("translationTextBox");
    for(let box of textBoxes) {
        box.addEventListener("input", () => {
            if (REQUEST.src_lang.localeCompare(box.id) !== 0) {
                REQUEST.target_lang = REQUEST.src_lang;
                REQUEST.src_lang = box.id;
            }
        });
    }

    // Init text input stuff
    document.addEventListener('mouseup', selectedTextHandler, false);
    document.onmousedown = () => {
        if(document.contains(document.getElementById("share-snippet"))) {
            document.getElementById("share-snippet").remove();
            (window.getSelection ? window.getSelection() : document.selection).empty();
        }
    }
});

function switchLang() {
    const germanBox = document.getElementById("de");
    const japaneseBox = document.getElementById("ja");
    const translateButton = document.getElementById("translateButton");
    const temp = germanBox.style.order;
    germanBox.style.order = japaneseBox.style.order;
    japaneseBox.style.order = temp;
    translateButton.innerHTML = japaneseBox.style.order == 1 ? "Translate Japanese " + ICON2 + " German" : "Translate German " + ICON2 + " Japanese"; 
}

function invertColor() {
    const html = document.getElementsByTagName("html")[0];
    if (html.classList.contains('normal')) html.classList = ['inverted'];
    else html.classList = ['normal'];
}

async function getData() {
    const germanBoxOrder = document.getElementById("de").style.order;
    let src_lang, tar_lang, input_text;
    const germanInput = document.getElementById("de-in");
    const japaneseInput = document.getElementById("ja-in");

    if (germanBoxOrder == 1) {
        src_lang = 'de';
        tar_lang = 'ja';
        input_text = germanInput.innerText;
    } else {
        src_lang = 'ja';
        tar_lang = 'de';
        input_text = japaneseInput.innerText;
    }

    try {
        if (input_text == '') return;
        const response = await fetch(API_ADDRESS + 'transcribe', {
            method: "POST",
            body: JSON.stringify({
                input_text: input_text,
                engine_name: 'google',
                src_lang: src_lang,
                tar_lang: tar_lang
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        if (germanBoxOrder == 1) {
            japaneseInput.innerHTML = json.output_text
        } 
        insertGermanKatakana(json['phonetics'], germanInput);
    } catch (error) {
        console.error(error.message);
    }
}

function insertGermanKatakana(phoneticList, germanInputElement) {
    germanInputElement.replaceChildren();
    for (let i = 0; i < phoneticList.length; i++) {
        germanInputElement.appendChild(
            addWord(
                phoneticList[i],
                i != phoneticList.length - 1 && phoneticList[i + 1][1].localeCompare("PUNCT") != 0,
                i
            ));
    }
}

function addWord(text, addSpace, i) {
    let wrapper = document.createElement("span");
    wrapper.classList = ['textWrapper'];
    if (i % 2 == 0) wrapper.style.borderBottom = '2px solid rgb(30, 30, 30)';
    else wrapper.style.borderBottom = '2px solid rgb(161, 161, 161)';
    let german = document.createElement("span");
    german.classList = ['germanText'];
    let katakana = document.createElement("span");
    katakana.classList = ['katakanaText'];
    german.innerText = text[0];
    katakana.innerText = text[3];
    wrapper.appendChild(katakana);
    wrapper.appendChild(german);
    if (!addSpace) wrapper.style.marginRight = 0;
    return wrapper;
}

function addPunct(punct) {
    let wrapper = document.createElement("span");
    wrapper.classList = ['textWrapper'];
    let german = document.createElement("span");
    german.classList = ['germanText'];
    let katakana = document.createElement("span");
    katakana.classList = ['katakanaText'];
    german.innerText = " ";
    katakana.innerText = " ";
    wrapper.appendChild(katakana);
    wrapper.appendChild(german);
    return wrapper;
}

// function addListeners(germanWord, japaneseWord) {
//     germanWord.otherWord = japaneseWord;
//     japaneseWord.otherWord = germanWord;
//     germanWord.onmouseenter = function (event) {
//         this.className = "wordHoverStyling";
//         this.otherWord.className = "wordHoverStyling";
//         this.otherWord.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
//         event.preventDefault();
//     };
//     germanWord.onmouseleave = function (event) {
//         this.className = "";
//         this.otherWord.className = "";
//         event.preventDefault();
//     };

//     japaneseWord.onmouseenter = function (event) {
//         this.className = "wordHoverStyling";
//         this.otherWord.className = "wordHoverStyling";
//         this.otherWord.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
//         event.preventDefault();
//     };
//     japaneseWord.onmouseleave = function (event) {
//         this.className = "";
//         this.otherWord.className = "";
//         event.preventDefault();
//     };

//     germanWord.onclick = function (event) {
//         window.speechSynthesis.cancel();
//         var u = new SpeechSynthesisUtterance();
//         u.text = event.srcElement.innerText;
//         u.lang = 'de-DE';
//         u.rate = 1.0;
//         speechSynthesis.speak(u);
//     }

//     japaneseWord.onclick = function (event) {
//         window.speechSynthesis.cancel();
//         var u = new SpeechSynthesisUtterance();
//         u.text = event.srcElement.innerText;
//         u.lang = 'ja-JP';
//         u.rate = 1.0;
//         u.volume = 0.5;
//         speechSynthesis.speak(u);
//     }
// }

// TODO: FIX BUTTON LOCATION
function selectedTextHandler(event) {
    if(document.contains(document.getElementById("share-snippet"))) {
        document.getElementById("share-snippet").remove();
    }
    if(window.getSelection().toString().length > 0) {
        const selection = window.getSelection().toString();
        const germanWords = [];
        const japaneseWords = [];
        selection.split('\n').forEach((word) => {
            let asciiCount = 0, uniCount = 0;
            if (!word) return;
            const chars = word.split('');
            chars.forEach((char) => {
                if (char.charCodeAt() <= 255) asciiCount++;
                else uniCount++;
            })
            if (asciiCount >= uniCount) germanWords.push(word);
            else japaneseWords.push (word);
        })
        
        const selectedElements = document.getSelection();

        if (!selectedElements || !selectedElements?.anchorNode || !selectedElements?.focusNode) return;

        x1 = selectedElements.anchorNode.parentElement.offsetLeft;
        y1 = selectedElements.anchorNode.parentElement.offsetTop;
        x2 = selectedElements.focusNode.parentElement.offsetLeft;
        y2 = selectedElements.focusNode.parentElement.offsetTop;

        const posX = Math.min(x1, x2);
        const posY = Math.min(y1, y2) - 30;
        // Append HTML to the body, create the "Tweet Selection" dialog
        document.body.insertAdjacentHTML('beforeend', 
            `
            <button id="share-snippet" style="position: absolute; top: ${posY}px; left: ${+posX}px;"> Text to speech </button>
            `
            );
    }
}
