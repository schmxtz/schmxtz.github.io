console.log("test");

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