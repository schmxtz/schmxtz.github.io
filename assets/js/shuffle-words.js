// Word list for the cognitive shuffle.
//
// Rules for adding words:
//   - concrete: something you can picture immediately
//   - neutral: nothing tied to work, money, health, danger or strong feelings
//   - common: a fluent non-native English speaker knows it without thinking
//     (no "juniper", "meadow", "trellis")
//   - each word appears once across all categories
//
// Categories exist only so the shuffle can avoid two related words in a row.
window.SHUFFLE_WORDS = {
  animals: `
    cat, dog, horse, cow, pig, sheep, goat, rabbit, mouse, hamster, guinea pig,
    duck, chicken, rooster, goose, turkey, donkey, pony, lamb, kitten, puppy,
    camel, llama, alpaca, elephant, giraffe, zebra, lion, tiger, cheetah, leopard,
    bear, polar bear, panda, koala, kangaroo, monkey, gorilla, deer, moose,
    reindeer, fox, wolf, squirrel, hedgehog, raccoon, beaver, otter, hippo, rhino,
    buffalo, lizard, chameleon, frog, turtle, tortoise, snail, owl, eagle, hawk,
    parrot, penguin, swan, pigeon, seagull, flamingo, peacock, ostrich, crow,
    sparrow, robin, woodpecker, hummingbird, pelican, toucan, dolphin, whale,
    seal, walrus, sea lion, octopus, crab, lobster, shrimp, jellyfish, starfish,
    seahorse, goldfish, salmon, tuna, clownfish, butterfly, bee, bumblebee,
    ladybug, ant, caterpillar, dragonfly, firefly, grasshopper, beetle, sloth,
    chick, duckling, swallow, stork, canary, pufferfish, stingray
  `,

  food: `
    apple, banana, orange, lemon, lime, grape, cherry, strawberry, blueberry,
    raspberry, peach, pear, plum, apricot, melon, watermelon, pineapple, mango,
    coconut, kiwi, avocado, fig, tomato, potato, sweet potato, carrot, onion,
    garlic, bell pepper, chili, cucumber, lettuce, cabbage, cauliflower, broccoli,
    spinach, celery, pumpkin, mushroom, corn, green beans, peas, olive, pickle,
    rice, bread, baguette, toast, butter, cheese, boiled egg, milk, yogurt, honey,
    jam, peanut butter, sugar cube, salt, flour, spaghetti, noodles, pizza,
    sandwich, tomato soup, salad, pancake, waffle, cookie, birthday cake, cupcake,
    muffin, brownie, croissant, bagel, pretzel, donut, apple pie, chocolate bar,
    candy, lollipop, marshmallow, caramel, vanilla, cinnamon, ice cream, popcorn,
    potato chips, crackers, cereal, oatmeal, burger, hot dog, sausage, meatball,
    french fries, omelette, sushi, taco, burrito, dumpling, curry, lasagna, tea,
    coffee, hot chocolate, orange juice, lemonade, smoothie, milkshake, almond,
    peanut, walnut, hazelnut, cashew, raisin, popsicle, pudding, whipped cream,
    ketchup, mustard, mayonnaise, soy sauce, nachos, cheesecake, gingerbread,
    cotton candy, fried egg, scrambled eggs, cheese toast, fruit salad,
    banana bread, chocolate chip, ice cube, mint, basil, tea bag, grapefruit,
    cranberry, pomegranate, lemon slice, sesame seeds
  `,

  home: `
    spoon, fork, teaspoon, chopsticks, cup, mug, teacup, plate, bowl, saucer,
    kettle, teapot, frying pan, saucepan, cooking pot, oven, stove, microwave,
    fridge, freezer, toaster, blender, dishwasher, kitchen sink, napkin,
    tablecloth, jar, bottle, lid, tray, apron, oven mitt, rolling pin,
    cutting board, sponge, dish towel, salt shaker, pepper mill, cookie jar,
    lunchbox, thermos, picnic basket, drinking straw, toothpick, broom, dustpan,
    mop, vacuum cleaner, laundry basket, washing machine, clothes hanger, iron,
    ironing board, towel, pillow, blanket, quilt, mattress, bed, bunk bed, sofa,
    armchair, rocking chair, cushion, curtain, carpet, rug, lamp, light bulb,
    candle, mirror, shelf, bookshelf, drawer, cupboard, wardrobe, closet, table,
    desk, chair, stool, doormat, doorbell, doorknob, key, vase, flowerpot,
    picture frame, bathtub, shower, soap, bubble bath, toothbrush, toothpaste,
    comb, hairbrush, hair dryer, shampoo, rubber duck, fireplace, radiator, fan,
    window, windowsill, front door, stairs, balcony, attic, basement, garage,
    fence, garden gate, mailbox, chimney, roof, wallpaper, ceiling, doorstep,
    night light, hot water bottle, kitchen, bedroom, bathroom, living room,
    dining room, coat hook, shoe rack, egg cup, sugar bowl, butter dish,
    bread basket, fruit bowl, water jug, ice tray, spice rack, coffee table,
    bedside table, footstool, laundry line, clothespin, bath mat, shower curtain,
    soap dish, cookbook, recipe card, soup ladle, whisk, colander, measuring cup
  `,

  clothing: `
    hat, baseball cap, beanie, scarf, gloves, mittens, socks, shoes, sneakers,
    boots, rain boots, sandals, flip-flops, slippers, high heels, jacket, coat,
    raincoat, sweater, cardigan, hoodie, shirt, T-shirt, blouse, dress, skirt,
    jeans, trousers, shorts, leggings, pajamas, bathrobe, swimsuit, belt, necktie,
    bow tie, button, zipper, pocket, collar, sleeve, vest, overalls, sunglasses,
    glasses, necklace, ring, bracelet, earrings, wristwatch, headband, hair clip,
    helmet, crown, tiara, backpack, handbag, suitcase, umbrella, earmuffs, tuxedo,
    kimono, poncho, shoelace, straw hat, winter coat, wool socks, rain jacket,
    denim jacket, polo shirt, tank top, ski jacket, top hat, sun visor,
    swimming goggles, hair tie, cufflinks, pearl necklace, watch strap, tote bag,
    gym bag, beret, bucket hat, ballet shoes, cowboy boots, winter gloves
  `,

  nature: `
    mountain, hill, river, lake, ocean, beach, island, forest, desert, valley,
    waterfall, cave, volcano, field, pond, stream, rock, stone, pebble, sand,
    seashell, wave, cloud, rainbow, snowflake, sunrise, sunset, moon, full moon,
    star, shooting star, planet, blue sky, rain, raindrop, snow, fog, puddle, ice,
    icicle, frost, breeze, sunshine, leaf, autumn leaves, tree, oak tree,
    pine tree, palm tree, branch, flower, rose, tulip, sunflower, daisy, lily,
    lavender, orchid, cactus, grass, bush, pine cone, acorn, seed, mud, nest, log,
    coral reef, iceberg, glacier, canyon, jungle, sand dune, riverbank, comet,
    galaxy, sun, bamboo, clover, four-leaf clover, petal, blossom, cherry blossom,
    maple leaf, lotus, seaweed, stepping stones, hot spring, crescent moon,
    snowdrift, tree stump, mountain peak, bay, lagoon, rock pool, rain cloud,
    morning mist, dewdrop, sandbank, hilltop, green hill, tall grass, wildflower,
    ivy, sunbeam, moonlight, starlight, northern lights
  `,

  places: `
    house, cottage, cabin, castle, palace, tower, lighthouse, windmill, farm,
    barn, greenhouse, treehouse, igloo, museum, library, bakery, cafe, restaurant,
    supermarket, market, flower shop, bookshop, toy shop, hotel, cinema, theater,
    stadium, zoo, aquarium, playground, swimming pool, post office, train station,
    bus stop, airport, harbor, pier, bridge, tunnel, street, country road,
    sidewalk, fountain, statue, skyscraper, apartment, elevator, escalator,
    amusement park, campsite, village, town, city, beach hut, bowling alley,
    ice rink, tennis court, football field, campfire, rooftop, courtyard,
    market stall, laundromat, barber shop, observatory, planetarium,
    botanical garden, pyramid, subway station, fort, boathouse, hut, stable,
    chicken coop, doghouse, flea market, shopping mall, water park, circus,
    park bench, park, garden, vegetable garden, rose garden, ski resort,
    harbor wall, bus station, gift shop, ice cream shop, pizzeria, food court,
    bandstand, clock tower, old town, cobblestone street, roundabout, car wash,
    bike path, footbridge, city square
  `,

  transport: `
    car, bus, double-decker bus, train, steam train, tram, subway, bicycle,
    tricycle, motorcycle, scooter, truck, van, camper van, taxi, tractor,
    bulldozer, airplane, glider, helicopter, hot air balloon, rocket, spaceship,
    satellite, boat, rowboat, sailboat, ship, cruise ship, ferry, canoe, kayak,
    raft, yacht, submarine, gondola, cable car, sled, sleigh, snowmobile,
    carriage, wagon, shopping cart, unicycle, wheel, steering wheel, anchor, sail,
    paddle, oar, propeller, traffic light, food truck, ice cream truck,
    garbage truck, limousine, convertible, jeep, golf cart, railway, fishing boat,
    tugboat, pedal boat, speedboat, houseboat, mountain bike, electric scooter,
    school bus, mail truck, cement mixer, delivery bike, seaplane, train carriage,
    bike bell, windshield wipers, road map
  `,

  tools: `
    hammer, nail, screw, screwdriver, wrench, pliers, toolbox, tape measure,
    ladder, shovel, rake, wheelbarrow, watering can, garden hose, paintbrush,
    paint can, paint roller, bucket, brick, wood, glass, paper, cardboard, cotton,
    wool, silk, leather, velvet, gold, silver, copper, clay, chalk, thread, yarn,
    ribbon, rope, string, chain, cork, sticker, glue, sticky tape, scissors,
    pencil, colored pencils, pen, fountain pen, crayon, marker, highlighter,
    eraser, pencil sharpener, ruler, notebook, sketchbook, paper clip, stapler,
    rubber band, magnet, envelope, stamp, postcard, sticky note, clipboard,
    magnifying glass, flashlight, safety pin, sewing machine, funnel, sandpaper,
    spray bottle, easel, canvas, ink, chalkboard, bookmark, pencil case, push pin,
    hole punch, glue stick, flower press, garden gloves, pruning shears,
    wooden spoon, tin can, paper bag, shopping bag, cardboard box, spirit level,
    extension cord, padlock, toolbelt, wire basket
  `,

  play: `
    ball, beach ball, balloon, kite, doll, dollhouse, teddy bear, toy car,
    toy train, rocking horse, yo-yo, marbles, spinning top, jigsaw puzzle, dice,
    playing cards, board game, chess, dominoes, building blocks, soap bubbles,
    jump rope, hula hoop, frisbee, sandcastle, snowman, snowball, swing, slide,
    seesaw, merry-go-round, carousel, roller coaster, Ferris wheel, trampoline,
    football, basketball, tennis ball, tennis racket, golf ball, golf club,
    baseball glove, volleyball, bowling ball, hockey stick, ice skates,
    roller skates, skis, snowboard, surfboard, skateboard, fishing rod, trophy,
    medal, whistle, dartboard, table tennis, badminton, piano, guitar, violin,
    cello, drum, trumpet, flute, harmonica, harp, saxophone, tambourine,
    xylophone, accordion, banjo, ukulele, microphone, headphones, record player,
    music box, maracas, bagpipes, coloring book, magic wand, puppet, toy boat,
    paper airplane, paper boat, pinwheel, pinata, party hat, treasure map,
    water balloon, sand bucket, beach towel, snow angel, toy robot, toy dinosaur,
    rubber ball, bouncy castle, crossword, sudoku, tennis net, goal post,
    rowing machine, yoga mat, juggling balls, climbing wall, mini golf,
    bowling pins, sheet music, drum kit, grand piano, music stand, guitar pick,
    birthday candles, paper crown, toy drum
  `,

  people: `
    baker, farmer, pilot, sailor, astronaut, chef, painter, gardener, fisherman,
    firefighter, postman, librarian, musician, dancer, ballerina, singer,
    magician, juggler, acrobat, king, queen, prince, princess, knight, pirate,
    cowboy, wizard, fairy, mermaid, elf, robot, alien, superhero, detective,
    explorer, inventor, scientist, teacher, waiter, carpenter, plumber, tailor,
    barber, captain, lifeguard, referee, shepherd, beekeeper, lumberjack,
    photographer, cyclist, skier, surfer, swimmer, runner, hiker, tourist,
    sculptor, potter, florist, mechanic, architect, zookeeper, train driver,
    bus driver, conductor, ninja, samurai, viking, ice skater, mountain climber,
    street musician, ice cream seller, chess player, tour guide,
    lighthouse keeper, park ranger, flower girl, deep-sea diver, puppet maker,
    toy maker, clock maker, glassblower, shoemaker
  `,

  things: `
    book, newspaper, magazine, comic book, letter, poster, painting, photo,
    photo album, gift, gift box, bow, lantern, matchbox, firework, sparkler,
    confetti, snow globe, hourglass, compass, globe, map, telescope, binoculars,
    microscope, camera, typewriter, treasure chest, feather, barrel, crate,
    basket, sleeping bag, hammock, birdhouse, bird feeder, scarecrow, beehive,
    horseshoe, flag, ticket, keychain, wind chime, dreamcatcher, diamond, pearl,
    fishing net, vending machine, package, tin box, message in a bottle,
    lava lamp, disco ball, jukebox, cuckoo clock, grandfather clock,
    ship in a bottle, paper lantern, string lights, wreath, gingerbread house,
    birthday card, picnic blanket, deck chair, beach umbrella, sun lounger,
    garden gnome, bird bath, weather vane, wishing well, totem pole, snow shovel,
    ice scraper, wooden crate, toy chest, trunk, chest of drawers, recipe book,
    fortune cookie, lucky charm, souvenir, fridge magnet, key ring, water bottle,
    lunch bag, sand timer, candle holder, ink bottle, quill, scroll, chessboard
  `,
};
