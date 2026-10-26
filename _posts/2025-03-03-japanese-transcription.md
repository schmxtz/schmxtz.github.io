---
title: Japanese Transcription
---

## Introduction

The idea behind this project started when I was learning Japanese. I realized that the pronunciation of Japanese is very similar to German in some ways. Or at least you can "recreate" German words using Japanese Katakana.

My first thought then, was to split German words into their syllables and then have a mapping to transcribe each mapping to its Japanese counterpart. However according to [this](https://german.stackexchange.com/questions/70223/how-many-different-syllables-does-the-german-language-have) post, there are around 140000 unique syllables in German - there has to be a better way.

So then thinking like a mathematician, I first [reduced](https://en.wikipedia.org/wiki/Reduction_(mathematics)) the problem to a smaller subset. The way I achieved this, was to first get the [phonetic representation](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) of each word and then create a mapping for phonetic blocks to Katakana blocks. This surprisingly worked as there are only around 600 entries in my mapping so far.

## Implementation

The first issue I ran into was, how do I get the phonetic representation of all German words. And is it possible to find something that is free to use and open-source?

My first idea was to use the python library [gruut-ipa](https://github.com/rhasspy/gruut-ipa), but I ran into some issues very early on. Some of the transcriptions were not correct. I wanted to try to avoid that as much as possible, so I kept looking. Eventually I found out that [Wikitionary](https://www.wiktionary.org/) has a broad database for German words including their phonetic representation and is licensed under the [CC license](https://creativecommons.org/licenses/by-sa/4.0/).

From [kaikki.org](https://kaikki.org/dictionary/rawdata.html) (thank you very much for hosting a compressed extract of each language), I was able to download the list of all words. I wrote a small script to parse it and only save the relevant data - the word and its phonetic representation - and decreased the file down to ~70MB. This is also very useful since it is small enough to represent the data as an in-memory dictionary. Thus I can avoid having to setup some sort of database and is much faster for word lookups.

Now I started making the mapping for phonetic chunks to their Katakana equivalent. I created an algorithm which greedily tries to match the longest possible phonetic chunk. The phonetic representation for the word "danke" is "ˈdaŋkə". The first character can be ignored as it just tells the reader to put put a stress on the start. Then the next longest chunks are "da", "ŋ" and "kə", which maps to "ダ" (da), "ン" (n) and "ケ" (ke). The design was inspired by the site [jisho.org](https://jisho.org/search/%E3%83%95%E3%83%BC%E3%83%90%E3%83%BC%E5%AE%B6%E3%81%AF%E3%82%A6%E3%82%A3%E3%83%BC%E3%83%B3%E3%81%AE%E8%BF%91%E3%81%8F%E3%81%AB%E4%BD%8F%E3%82%93%E3%81%A7%E3%81%84%E3%81%BE%E3%81%99%E3%80%82), with placing the way how to read the word, above the word itself.

## External dependencies

### [jptranscription](https://github.com/schmxtz/jptranscription)

In the main core logic part of my application I only have one external dependency (two if you include the word dictionary list) which is a [library](https://pypi.org/project/split-words/) to split compound-nouns into their respective "base nouns". This is needed because Germans love to put many nouns together to create new words. Usually those are not in the dictionary which is why I need to split them into their original parts. I will implement this myself in the future.

### [jptranscriptionapi](https://github.com/schmxtz/jptranscriptionapi)

For the API I'm using fastapi because it's fast and easy to deploy. Obviously the library above is one dependency. I'm also using [spacy](https://pypi.org/project/spacy/), which is a NLP libary that performs the word splitting for me. This is not a trivial problem for German due to its punctuation rules and other weird grammar. I'm also using [num2words](https://pypi.org/project/num2words/) to transcribe decimal numbers to their written equivalent. And lastly I'm using [deep-translator](https://pypi.org/project/deep-translator/), which stems the API translation calls for me.

### [schmxtz.github.io](https://github.com/schmxtz/schmxtz.github.io)

The website itself is written entirely in plain HTML, javascript and css. I like simplicity and performance, so I avoided using any web frameworks. I'm working with Angular, Ionic and Capacitor for my work, so I wasn't very interested in using it here too.
