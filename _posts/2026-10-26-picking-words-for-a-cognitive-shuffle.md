---
title: Picking words for a cognitive shuffle
---

When a racing mind keeps you awake, it rarely helps to tell yourself to stop thinking. It tends to work better to give your mind something dull to do instead. The *cognitive shuffle*, from cognitive scientist Luc Beaudoin, is one way to do that. You picture a series of random, unrelated things, one after another, for a few seconds each. A cat. A teapot. A lighthouse. A pair of socks.

The idea is that this resembles what your mind does naturally as it drifts off: loose, disconnected images instead of a plan or an argument. Doing it on purpose crowds out the worry loop and tells your brain that nothing important is happening. Beaudoin's group tested an app version, which plays a new word roughly every eight seconds, and reported it was about as effective as structured problem solving at calming pre-sleep thoughts.

I built a [simple version](/cognitive-shuffle/). The word list matters more than the code, so here is how I chose the words.

## What makes a good word

- **Concrete.** You should be able to picture it right away. *Umbrella* works. *Freedom* doesn't.
- **Boring.** It should be emotionally neutral. Nothing about work, money, health, deadlines, or people you know. *Hospital*, *exam* and *phone* are out.
- **Unrelated to the last one.** The point is to break chains of thought. *Fork* followed by *spoon* invites a story, so the page avoids putting two words from the same category in a row.
- **Common.** Rare words make you stop and ask what they mean. If you learned English as a second language, *juniper* or *meadow* might wake you up instead of letting you drift. The list sticks to everyday words a fluent non-native speaker knows without thinking.

## Not repeating

The list has over a thousand words. The page shuffles all of them and goes through the deck without repeats. It also remembers your place between nights, so you only see a word again after you've been through the whole list. At eight seconds per word, one pass takes more than two hours.

You can set the time per word and the session length. It can also read the words aloud, which helps if you'd rather keep your eyes closed.
