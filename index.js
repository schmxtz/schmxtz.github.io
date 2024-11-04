const API_ADDRESS = "https://jptranscriptionapi.onrender.com/";

async function getPhonetics() {
    getData("phonetizer");
}

async function getKatakana() {
    getData("transcriber");
}

async function getData(resource) {
    const germanText = document.getElementById("germanText");
    const japaneseText = document.getElementById("japaneseText");
    try {
        if (germanText.innerText == '') return;
        const response = await fetch(API_ADDRESS + resource, {
            method: "POST",
            body: JSON.stringify({
                user_input: germanText.innerText != null ? germanText.innerText : ' '
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);
        // Reset text
        germanText.replaceChildren();
        japaneseText.replaceChildren();
        for (let i = 0; i < json.length; i++) {
            var germanWord = addWord(json[i][0], i);
            var japaneseWord = addWord(json[i][3], i);
            addListeners(germanWord, japaneseWord);
            germanText.appendChild(germanWord);
            japaneseText.appendChild(japaneseWord);
            if (json[i][1].localeCompare("PUNCT") != 0 && i != json.length - 1 && json[i + 1][1].localeCompare("PUNCT") != 0) {
                japaneseText.appendChild(addPunct("・"));
                germanText.appendChild(addPunct(" "));
            }

        }
    } catch (error) {
        console.error(error.message);
    }
}

function addWord(text, id) {
    let newElement = document.createElement("span");
    newElement.innerText = text;
    newElement.id = id;
    

    return newElement;
}

function addPunct(punct) {
    let newElement = document.createElement("span");
    newElement.innerText = punct;
    return newElement;
}

function addListeners(germanWord, japaneseWord) {
    germanWord.otherWord = japaneseWord;
    japaneseWord.otherWord = germanWord;
    germanWord.onmouseenter = function(event){
        this.className = "wordHoverStyling";
        this.otherWord.className = "wordHoverStyling";
        event.preventDefault();
    };
    germanWord.onmouseleave = function(event){
        this.className = "";
        this.otherWord.className = "";
        event.preventDefault();
    };

    japaneseWord.onmouseenter = function(event){
        this.className = "wordHoverStyling";
        this.otherWord.className = "wordHoverStyling";
        event.preventDefault();
    };
    japaneseWord.onmouseleave = function(event){
        this.className = "";
        this.otherWord.className = "";
        event.preventDefault();
    };
}