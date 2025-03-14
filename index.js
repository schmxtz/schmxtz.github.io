const API_ADDRESS = "https://jptranscriptionapi.onrender.com/";
const ICON = "<i class=\"fa fa-caret-down\"></i>";
const ICON2 = "<i class=\"fa fa-language\" aria-hidden=\"true\"></i>";
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
    document.onmousedown = clearPopover;
});

function clearPopover(event) {
    if (event.target.tagName.localeCompare("BUTTON") === 0 || event.target.tagName.localeCompare("I") === 0) return;
    if(document.contains(document.getElementById("share-snippet"))) {
        document.getElementById("share-snippet").remove();
        (window.getSelection ? window.getSelection() : document.selection).empty();
    }
}

function switchLang() {
    const germanBox = document.getElementById("de");
    const japaneseBox = document.getElementById("ja");
    const translateButton = document.getElementById("translateButton");
    const temp = germanBox.style.order;
    germanBox.style.order = japaneseBox.style.order;
    japaneseBox.style.order = temp;
    translateButton.innerHTML = japaneseBox.style.order == 1 ? "Translate (訳す) Japanese " + ICON2 + " German" : "Translate (訳す) German " + ICON2 + " Japanese"; 
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
    // if (i % 2 == 0) wrapper.style.borderBottom = '2px solid rgb(30, 30, 30)';
    // else wrapper.style.borderBottom = '2px solid rgb(161, 161, 161)';
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

function getSelectionByLang(lang) {
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
    return lang == 0 ? germanWords.join(" ") : japaneseWords.join(" ");
}

function germanTTS() {
    const selection = getSelectionByLang(0);
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance();
    u.text = selection;
    u.lang = 'de-DE';
    u.rate = 1.0;
    speechSynthesis.speak(u);
}

function japaneseTTS() {
    const selection = getSelectionByLang(1);
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance();
    u.text = selection;
    u.lang = 'ja-JP';
    u.rate = 1.0;
    u.volume = 0.5;
    speechSynthesis.speak(u);
}

function copyGerman() {
    const selection = getSelectionByLang(0);
    navigator.clipboard.writeText(selection);
}

window.copyJapanese = () => {
    const selection = getSelectionByLang(1);
    navigator.clipboard.writeText(selection);
}

// TODO: FIX BUTTON LOCATION
function selectedTextHandler(event) {
    const selection = window.getSelection().toString();
    if(window.getSelection().toString().length > 0) {
        const selectedElements = document.getSelection();

        const parent = document.getElementById("de");
        const posX = parent.clientLeft + 100;
        const posY = parent.clientTop + 90;

        // Append HTML to the body, create the "Tweet Selection" dialog
        document.body.insertAdjacentHTML('beforeend', 
            `
            <div id="share-snippet" class="popover" style="top: ${posY}px; left: ${+posX}px;">
                Original/ドイツ語 <button onclick="germanTTS()"><i class="fa fa-volume-up" aria-hidden="true"></i></button> <button onclick="copyGerman()"><i class="fa fa-files-o" aria-hidden="true"></i></button>
                <span class="separator">|</span>
                Katakana/カタカナ <button onclick="japaneseTTS()"><i class="fa fa-volume-up" aria-hidden="true"></i></button> <button onclick="copyJapanese()"><i class="fa fa-files-o" aria-hidden="true"></i></button>
            </div>
            `
            );
    } else {
        if(document.contains(document.getElementById("share-snippet"))) {
            document.getElementById("share-snippet").remove();
        }
    }
}
