const API_ADDRESS = "https://jptranscriptionapi.onrender.com/";
const ICON = "<i class=\"fa fa-caret-down\"></i>";
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
    // const germanText = document.getElementById("germanText");
    // germanText.onpaste = (event) => {
    //     event.preventDefault();
    //     clipboardData = (event.originalEvent || event).clipboardData;
    //     pastedData = clipboardData.getData('Text');
    //     germanText.innerText = pastedData;
    // };
});

function switchLang() {
    const germanBox = document.getElementById("de");
    const japaneseBox = document.getElementById("ja");
    const temp = germanBox.style.order;
    germanBox.style.order = japaneseBox.style.order;
    japaneseBox.style.order = temp;
}

async function getData() {
    REQUEST.input_text = document.getElementById(REQUEST.src_lang).innerText;
    console.log(REQUEST);
    try {
        // console.log()
        // if (germanText.innerText == '') return;
        // const response = await fetch(API_ADDRESS + resource, {
        //     method: "POST",
        //     body: JSON.stringify({
        //         user_input: germanText.innerText != null ? germanText.innerText : ' '
        //     }),
        //     headers: {
        //         "Content-type": "application/json; charset=UTF-8"
        //     }
        // });
        // if (!response.ok) {
        //     throw new Error(`Response status: ${response.status}`);
        // }
        // const json = await response.json();
        // // Reset text
        // germanText.replaceChildren();
        // japaneseText.replaceChildren();
        // for (let i = 0; i < json.length; i++) {
        //     var germanWord = addWord(json[i][0], i);
        //     var japaneseWord = addWord(json[i][3], i);
        //     addListeners(germanWord, japaneseWord);
        //     germanText.appendChild(germanWord);
        //     japaneseText.appendChild(japaneseWord);
        //     if (i != json.length - 1 && json[i + 1][1].localeCompare("PUNCT") != 0) {
        //         japaneseText.appendChild(addPunct(" "));
        //         germanText.appendChild(addPunct(" "));
        //     }

        // }
    } catch (error) {
        console.error(error.message);
    }
}

// function addWord(text, id) {
//     let newElement = document.createElement("span");
//     newElement.innerText = text;
//     newElement.id = id;


//     return newElement;
// }

// function addPunct(punct) {
//     let newElement = document.createElement("span");
//     newElement.innerText = punct;
//     return newElement;
// }

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
// function selectedTextHandler(event) {
//     if(document.contains(document.getElementById("share-snippet"))) {
//         document.getElementById("share-snippet").remove();
//     }
//     // Check if any text was selected
//     if(window.getSelection().toString().length > 0) {
//         // Find out how much (if any) user has scrolled
//         var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        
//         // Get cursor position
//         const posX = event.clientX - 110;
//         const posY = event.clientY + 20 + scrollTop;
      
//         // Create Twitter share URL
        
//         // Append HTML to the body, create the "Tweet Selection" dialog
//         document.body.insertAdjacentHTML('beforeend', '<button id="share-snippet" style="position: absolute; top: '+posY+'px; left: '+posX+'px;"> Text to speech </button>');
//     }
// }

// document.addEventListener('mouseup', selectedTextHandler, false);
// document.onmousedown = () => {
// if(document.contains(document.getElementById("share-snippet"))) {
//     document.getElementById("share-snippet").remove();
//     (window.getSelection ? window.getSelection() : document.selection).empty();
// }
// }