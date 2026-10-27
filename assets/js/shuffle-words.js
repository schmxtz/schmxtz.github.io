// Word list for the cognitive shuffle.
//
// Rules for adding words:
//   - concrete: something you can picture immediately
//   - neutral: nothing tied to work, money, health, danger or strong feelings
//   - common: a fluent non-native English speaker knows it without thinking
//     (no "juniper", "meadow", "trellis")
//   - one simple word: no compound nouns like "polar bear", "tea bag" or
//     "windowsill"
//   - each word appears once across all categories
//
// Categories exist only so the shuffle can avoid two related words in a row.
window.SHUFFLE_WORDS = {
  animals: `
    cat, dog, horse, cow, pig, sheep, goat, rabbit, bunny, mouse, hamster, duck,
    chicken, rooster, hen, goose, turkey, donkey, pony, lamb, kitten, puppy,
    camel, llama, alpaca, elephant, giraffe, zebra, lion, tiger, cheetah,
    leopard, bear, panda, koala, kangaroo, monkey, gorilla, deer, moose, fox,
    wolf, squirrel, hedgehog, raccoon, beaver, otter, hippo, rhino, buffalo,
    lizard, chameleon, frog, toad, turtle, tortoise, snail, owl, eagle, hawk,
    parrot, penguin, swan, pigeon, seagull, flamingo, peacock, ostrich, crow,
    sparrow, robin, pelican, toucan, dolphin, whale, seal, walrus, octopus,
    crab, lobster, shrimp, starfish, seahorse, goldfish, salmon, tuna,
    butterfly, bee, ladybug, ant, caterpillar, beetle, sloth, chick, duckling,
    swallow, stork, canary, badger, bison, ferret, gecko, iguana, jaguar,
    panther, poodle, beagle, puffin, piglet, calf, foal, bull, ox, mule, yak,
    lemur, meerkat, armadillo, anteater, porcupine, skunk, chipmunk, worm, moth,
    spider, cricket, fish, shark, oyster, clam, mussel
  `,

  food: `
    apple, banana, orange, lemon, lime, grape, cherry, strawberry, blueberry,
    raspberry, peach, pear, plum, apricot, melon, watermelon, pineapple, mango,
    coconut, kiwi, avocado, fig, tomato, potato, carrot, onion, garlic, pepper,
    chili, cucumber, lettuce, cabbage, cauliflower, broccoli, spinach, celery,
    pumpkin, mushroom, corn, beans, peas, olive, pickle, rice, bread, baguette,
    toast, butter, cheese, egg, milk, yogurt, honey, jam, sugar, salt, flour,
    spaghetti, noodles, pasta, pizza, sandwich, soup, salad, pancake, waffle,
    cookie, cake, cupcake, muffin, brownie, croissant, bagel, pretzel, donut,
    pie, chocolate, candy, lollipop, marshmallow, popcorn, chips, crackers,
    cereal, oatmeal, burger, sausage, meatball, fries, omelette, sushi, taco,
    burrito, dumpling, curry, lasagna, tea, coffee, juice, lemonade, smoothie,
    milkshake, almond, peanut, walnut, hazelnut, cashew, raisin, popsicle,
    pudding, cream, ketchup, mustard, mayonnaise, nachos, cheesecake, mint,
    basil, grapefruit, cranberry, radish, zucchini, eggplant, asparagus, ginger,
    parsley, ham, bacon, steak, pastry, biscuit, scone, tart, jelly, custard,
    syrup, cocoa, cola, water, soda, porridge, granola, ravioli, tortilla,
    kebab, bun, gum, toffee, fudge
  `,

  home: `
    spoon, fork, knife, cup, mug, teacup, plate, bowl, saucer, kettle, teapot,
    pan, pot, oven, stove, microwave, fridge, freezer, toaster, blender, sink,
    napkin, tablecloth, jar, bottle, lid, tray, apron, sponge, lunchbox,
    thermos, straw, toothpick, broom, dustpan, mop, hanger, iron, towel, pillow,
    blanket, quilt, mattress, bed, sofa, couch, armchair, cushion, curtain,
    carpet, rug, lamp, candle, mirror, shelf, bookshelf, drawer, cupboard,
    wardrobe, closet, table, desk, chair, stool, doormat, doorbell, doorknob,
    key, vase, flowerpot, frame, bathtub, shower, soap, toothbrush, toothpaste,
    comb, hairbrush, shampoo, fireplace, radiator, fan, window, stairs, balcony,
    attic, basement, garage, fence, gate, mailbox, chimney, roof, wallpaper,
    ceiling, floor, wall, door, kitchen, bedroom, bathroom, hook, eggcup, jug,
    whisk, ladle, cookbook, clothespin, footstool, bench, cradle, crib, hammock,
    clock, calendar, basket, bin, bucket, faucet, tap, tile, cabinet, sieve,
    grater, peeler, spatula, tongs, corkscrew, coaster, placemat, dresser,
    sheet, duvet, hallway, porch, terrace, patio, shed, cellar, laundry
  `,

  clothing: `
    hat, cap, beanie, scarf, gloves, mittens, socks, shoes, sneakers, boots,
    sandals, slippers, heels, jacket, coat, raincoat, sweater, cardigan, hoodie,
    shirt, blouse, dress, skirt, jeans, trousers, shorts, leggings, pajamas,
    bathrobe, swimsuit, belt, necktie, button, zipper, pocket, collar, sleeve,
    vest, overalls, sunglasses, glasses, necklace, ring, bracelet, earrings,
    wristwatch, watch, headband, helmet, crown, tiara, backpack, handbag,
    suitcase, umbrella, earmuffs, tuxedo, kimono, poncho, shoelace, beret,
    bikini, uniform, costume, cape, cloak, gown, robe, bow, brooch, locket,
    pendant, anklet, hairpin, ribbon, veil, mask, turban, bonnet, sombrero,
    clogs, loafers, moccasins, stockings, tights, jumpsuit, blazer, parka, kilt,
    bandana, wig, goggles, buckle, badge, lace, denim, fleece
  `,

  nature: `
    mountain, hill, river, lake, ocean, sea, beach, island, forest, desert,
    valley, waterfall, cave, volcano, field, pond, stream, rock, stone, pebble,
    sand, seashell, shell, wave, cloud, rainbow, snowflake, sunrise, sunset,
    moon, star, planet, sky, rain, raindrop, snow, fog, puddle, ice, icicle,
    frost, sunshine, leaf, tree, oak, pine, palm, branch, flower, rose, tulip,
    sunflower, daisy, lily, lavender, orchid, cactus, grass, bush, acorn, seed,
    mud, nest, log, iceberg, glacier, canyon, jungle, dune, comet, galaxy, sun,
    bamboo, clover, petal, blossom, lotus, seaweed, coral, bay, lagoon, cliff,
    ivy, moss, fern, twig, root, thorn, vine, hedge, reed, dandelion, poppy,
    violet, willow, birch, maple, cedar, shore, coast, harbor, boulder, crystal,
    dew, mist, hail, wind, breeze
  `,

  places: `
    house, cottage, cabin, castle, palace, tower, lighthouse, windmill, farm,
    barn, greenhouse, treehouse, igloo, museum, library, bakery, cafe,
    restaurant, supermarket, market, bookshop, hotel, cinema, theater, stadium,
    zoo, aquarium, playground, pool, airport, pier, bridge, tunnel, street,
    road, sidewalk, fountain, statue, skyscraper, apartment, elevator,
    escalator, campsite, village, town, city, campfire, rooftop, courtyard,
    pyramid, fort, hut, stable, doghouse, circus, park, garden, pizzeria,
    roundabout, square, station, tent, shop, mall, canal, ranch, vineyard,
    orchard, observatory, planetarium, gallery, boathouse, marina, dock, plaza,
    highway
  `,

  transport: `
    car, bus, train, tram, subway, bicycle, tricycle, motorcycle, scooter,
    truck, van, taxi, tractor, bulldozer, airplane, glider, helicopter, balloon,
    rocket, spaceship, satellite, boat, rowboat, sailboat, ship, ferry, canoe,
    kayak, raft, yacht, submarine, gondola, sled, sleigh, snowmobile, carriage,
    wagon, cart, unicycle, wheel, anchor, sail, paddle, oar, propeller,
    limousine, convertible, jeep, railway, tugboat, speedboat, houseboat,
    seaplane, jet, caravan, trailer, moped, skateboard, blimp, airship,
    catamaran, lifeboat, tire, engine, horn, bell, brake, pedal, saddle,
    handlebar, ticket, map, compass
  `,

  tools: `
    hammer, nail, screw, screwdriver, wrench, pliers, toolbox, ladder, shovel,
    spade, rake, hoe, wheelbarrow, hose, paintbrush, brush, brick, wood, glass,
    paper, cardboard, cotton, wool, silk, leather, velvet, gold, silver, copper,
    clay, chalk, thread, yarn, rope, string, chain, cork, sticker, glue, tape,
    scissors, pencil, pen, crayon, marker, eraser, sharpener, ruler, notebook,
    sketchbook, stapler, magnet, envelope, stamp, postcard, clipboard,
    flashlight, torch, funnel, sandpaper, easel, canvas, ink, chalkboard,
    blackboard, bookmark, padlock, lock, saw, axe, drill, chisel, hinge, needle,
    pin, thimble, tweezers, pump, mallet, trowel, pitchfork, lantern, wire,
    plank, notepad, cloth, net
  `,

  play: `
    ball, kite, doll, dollhouse, teddy, marbles, puzzle, dice, cards, chess,
    dominoes, blocks, bubbles, hoop, frisbee, sandcastle, snowman, snowball,
    swing, slide, seesaw, carousel, trampoline, football, basketball,
    volleyball, baseball, racket, skates, skis, snowboard, surfboard, trophy,
    medal, whistle, darts, badminton, piano, guitar, violin, cello, drum,
    trumpet, flute, harmonica, harp, saxophone, tambourine, xylophone,
    accordion, banjo, ukulele, microphone, headphones, radio, maracas, bagpipes,
    wand, puppet, pinwheel, pinata, crossword, sudoku, bingo, tennis, golf,
    bowling, hockey, rugby, soccer, archery, fishing, rowing, sailing, skiing,
    skating, surfing, juggling, yoga, cycling, jogging, hiking, camping, picnic,
    party, parade, concert, carnival, festival, magic, robot, dinosaur, rattle,
    jigsaw, paint, glitter, confetti, streamer, kazoo, triangle, organ,
    keyboard, tuba, trombone, clarinet, gong, cymbals, bongos, mandolin
  `,

  people: `
    baker, farmer, pilot, sailor, astronaut, chef, cook, painter, gardener,
    fisherman, firefighter, postman, librarian, musician, dancer, ballerina,
    singer, magician, juggler, acrobat, clown, king, queen, prince, princess,
    knight, pirate, cowboy, wizard, fairy, mermaid, elf, giant, dwarf, alien,
    superhero, detective, explorer, scientist, teacher, waiter, carpenter,
    plumber, tailor, barber, captain, lifeguard, referee, shepherd, beekeeper,
    lumberjack, photographer, cyclist, skier, surfer, swimmer, runner, hiker,
    tourist, sculptor, potter, florist, mechanic, zookeeper, driver, conductor,
    ninja, samurai, viking, skater, climber, guide, ranger, diver, toymaker,
    shoemaker, butcher, grocer, jester, butler, maid, nanny, baby, toddler,
    child, boy, girl, grandma, grandpa, bride, groom, twins, scout, poet,
    author, drummer, guitarist, pianist, violinist, cowgirl, gnome, angel,
    golfer, jockey, rider
  `,

  things: `
    book, newspaper, magazine, comic, letter, poster, painting, photo, album,
    gift, present, matchbox, firework, sparkler, hourglass, globe, telescope,
    binoculars, microscope, camera, typewriter, treasure, feather, barrel,
    crate, birdhouse, scarecrow, beehive, horseshoe, flag, keychain, diamond,
    pearl, package, parcel, jukebox, wreath, souvenir, trunk, chest, quill,
    scroll, chessboard, bead, ornament, figurine, diary, journal, atlas,
    dictionary, novel, palette, inkwell, candlestick, chandelier, lampshade,
    tapestry, banner, sign, signpost, lamppost, sundial, weathervane, birdbath,
    throne
  `,
};
