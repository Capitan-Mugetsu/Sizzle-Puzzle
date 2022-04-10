/**
 * REFERENCES
 *
 * -- handle movement -- https://www.smashingmagazine.com/2016/02/javascript-ai-html-sliding-tiles-puzzle/
 */

/**
 * TODO
 *
 * -- make different size of grid -- ✔️
 * -- make it a slide puzzle -- 🚧
 * -- multiple difficulty lvl -- ✔️
 * -- button change image / refresh button
 * -- handle image position depending on size -- ✔️
 * -- clean code
 * -- improve design
 * -- sound ?
 * -- from puzzle to puzzle
 * -- responsive image
 *
 * -- shuffle should be handle in an other way because I think actually we can have an impossible puzzle
 *
 *
 */

/**
 * DESIGN
 *
 * -- grid 2*2
 * -- one cell per lvl
 * -- Flip in once clicked ?
 *
 */

/**
 * SLIDE PUZZLE
 *
 * -- create empty tile -- ✔️
 * -- store empty tile coord -- ✔️
 * -- store  clicked tile coord -- ✔️
 *
 * -- check if clicked tile and empty tile are neighbours -- ✔️
 *     -- animate if they are
 *
 * -- check if data-pos is the same as data.newPos -- ✔️ ? 🚧
 *    -- if so, win
 *
 * -- add time and score
 *    -- localstorage ?
 *
 * -- add numbers as hint
 *    -- btn to add hint during party
 *
 * -- add lvl -- ✔️
 *    -- make function generic
 *    -- easy 3*3
 *    -- medium 4*4
 *    -- hard 5*5
 *    -- extreme 6*6
 *
 * -- add grid on preview
 */

// start by registering the plugin
gsap.registerPlugin(Flip);

/**
 *--------------------------------------------------------------------------
 * Init
 *--------------------------------------------------------------------------
 */

const LEVELS = {
    easy: 3,
    medium: 4,
    hard: 5,
    extreme: 6
};

const SIZES = {
    easy: 100,
    medium: 80,
    hard: 70,
    extreme: 60
};

Object.keys(LEVELS).forEach((level) => initLevel(level));
setGlobalAnimation();

/**
 * Init
 */
function initLevel(level) {
    const btnLevel = document.querySelector(`[data-level="${level}"] .title`);
    const btnStart = document.querySelector(`[data-level="${level}"] .start`);
    const btnReset = document.querySelector(`[data-level="${level}"] .reset `);
    const btnClose = document.querySelector(`[data-level="${level}"] .close `);

    setPuzzle({ level, gridSize: LEVELS[level], squareSize: SIZES[level] });
    setGrid({ level, gridSize: LEVELS[level] });

    btnLevel.addEventListener("click", showGame);
    btnClose.addEventListener("click", hideGame);
    btnStart.addEventListener("click", () => shufflePuzzle(level));
    btnReset.addEventListener("click", () => reset(level));
}

/**
 * global settings animation
 *
 */
function setGlobalAnimation() {
    const grids = [...document.querySelectorAll(".grid")];
    gsap.set(".close,.preview,.puzzle,.buttons", {
        opacity: 0,
        y: -10,
        visibility: "hidden",
        display: "none"
    });

    gsap.set(".grid > span", { opacity: 0 });

    grids.forEach((g) =>
        gsap.to(g.children, {
            keyframes: { opacity: [0, 1] },
            stagger: 0.03,
            delay: 0.7
        })
    );
}

/**
 * create grid square
 */
function setGrid({ level, gridSize }) {
    const grid = document.querySelector(`[data-level="${level}"] .grid`);
    const frag = document.createDocumentFragment();

    Array.from({ length: gridSize * gridSize }, (_, k) => {
        const span = document.createElement("span");
        span.style.setProperty(
            "background-color",
            `hsl(${220 + k}, 80%, ${45 + k}%)`
        );
        frag.appendChild(span);
    });

    grid.appendChild(frag);
}

/**
 * create squares
 */
function setPuzzle({ level, gridSize, squareSize }) {
    const frag = document.createDocumentFragment();
    const imgSize = squareSize * gridSize;
    const url = `url(https://picsum.photos/${imgSize})`;
    const section = document.querySelector(`[data-level="${level}"]`);
    const puzzle = document.querySelector(`[data-level="${level}"] .puzzle`);

    section.style.setProperty("--size", gridSize);
    section.style.setProperty("--square", `${squareSize}px`);
    section.style.setProperty("--url", url);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const span = document.createElement("span");

            const x = `calc(100% / ${gridSize - 1} * ${j})`;
            const y = `calc(100% / ${gridSize - 1} * ${i})`;

            // css purpose
            span.classList.add("tile");

            // set grid coordinates
            span.dataset.pos = `${j},${i}`;

            span.style.setProperty("background-position-x", x);
            span.style.setProperty("background-position-y", y);
            span.addEventListener("click", (e) => moveTile(e, level));

            frag.appendChild(span);
        }
    }
    puzzle.appendChild(frag);
}

/**
 *--------------------------------------------------------------------------
 * Usage
 *--------------------------------------------------------------------------
 */

/**
 * show grid
 */

function showGame(event) {
    const level = event.target.dataset.level;
    const section = document.querySelector(`[data-level="${level}"]`);
    const sections = [...document.querySelectorAll(`section[data-level]`)];
    const sizeGrid = [SIZES[level], SIZES[level]];

    const state = Flip.getState(sections);
    const titleState = Flip.getState(`[data-level="${level}"] .title`);

    sections.forEach((section) => {
        section.classList.contains("selected") &&
            section.classList.remove("selected");
        section.dataset.level === level && section.classList.add("selected");
    });

    document.body.classList.add("full");

    Flip.from(titleState, {
        duration: 0.3,
        ease: "linear",
        toggleClass: "hidden",
        onComplete: () => {
            gsap.to(".title", { scale: 0.9 });
        }
    });

    Flip.from(state, {
        duration: 0.3,
        ease: "linear",
        absolute: true
    })
        .set(`[data-level="${level}"] :is(.close,.preview,.buttons,.puzzle)`, {
            visibility: "visible",
            display: "grid"
        })
        .to(`[data-level="${level}"] :is(.close,.preview,.buttons,.puzzle)`, {
            opacity: 1,
            y: 0,
            stagger: 0.3
        })
        .to(
            `[data-level="${level}"] .puzzle > span`,
            {
                keyframes: {
                    filter: ["brightness(3)", "brightness(1)"],
                    scale: [0.875, 1]
                },
                stagger: {
                    grid: sizeGrid,
                    from: "edges",
                    amount: 0.3,
                    axis: "x"
                }
            },
            "<+0.5"
        );
}

/**
 * hide grid
 */
function hideGame(event) {
    const level = event.target.dataset.level;
    const sections = [...document.querySelectorAll(`section[data-level]`)];

    const state = Flip.getState(sections);
    const titleState = Flip.getState(".title");

    sections.forEach((s) => s.classList.remove("selected"));
    document.body.classList.remove("full");

    reset(level);

    gsap.to(".close,.preview,.buttons,.puzzle", {
        opacity: 0,
        y: -10,
        visibility: "hidden",
        display: "none"
    });

    Flip.from(titleState, {
        duration: 0.5,
        ease: "linear",
        toggleClass: "hidden",
        onComplete: () => {
            gsap.to(".title", { scale: 1 });
        }
    });

    Flip.from(state, {
        duration: 0.6,
        absolute: true
    });
}

/**
 * handle logic movement tiles
 */
function moveTile(event, level) {
    const tiles = [
        ...document.querySelectorAll(`[data-level="${level}"] .puzzle > span`)
    ];

    const state = Flip.getState(tiles);

    const clickedTile = event.target;
    const emptyTile = tiles[tiles.length - 1];
    const clickedTilePos = clickedTile.dataset.newPos;
    const emptyTilePos = emptyTile.dataset.newPos;
    const xClicked = parseInt(clickedTilePos.split(",")[0]);
    const yClicked = parseInt(clickedTilePos.split(",")[1]);
    const xEmpty = parseInt(emptyTilePos.split(",")[0]);
    const yEmpty = parseInt(emptyTilePos.split(",")[1]);

    function revert() {
        let emptyOrder = emptyTile.dataset.newOrder;
        let clickedOrder = clickedTile.dataset.newOrder;

        // swap order value
        [emptyOrder, clickedOrder] = [clickedOrder, emptyOrder];

        // revert style order
        clickedTile.style.order = clickedOrder;
        emptyTile.style.order = emptyOrder;

        // change data order
        emptyTile.dataset.newOrder = emptyOrder;
        clickedTile.dataset.newOrder = clickedOrder;
    }

    // Move up
    if (xClicked === xEmpty && yClicked + 1 === yEmpty) {
        revert();
        // change pos
        emptyTile.dataset.newPos = `${xEmpty},${yEmpty - 1}`;
        clickedTile.dataset.newPos = `${xClicked},${yClicked + 1}`;
    }

    // Move down
    if (xClicked === xEmpty && yClicked - 1 === yEmpty) {
        revert();
        // change pos
        emptyTile.dataset.newPos = `${xEmpty},${yEmpty + 1}`;
        clickedTile.dataset.newPos = `${xClicked},${yClicked - 1}`;
    }

    // Move left
    if (yClicked === yEmpty && xClicked + 1 === xEmpty) {
        revert();
        // change pos
        emptyTile.dataset.newPos = `${xEmpty - 1},${yEmpty}`;
        clickedTile.dataset.newPos = `${xClicked + 1},${yClicked}`;
    }

    // Move right
    if (yClicked === yEmpty && xClicked - 1 === xEmpty) {
        revert();
        // change pos
        emptyTile.dataset.newPos = `${xEmpty + 1},${yEmpty}`;
        clickedTile.dataset.newPos = `${xClicked - 1},${yClicked}`;
    }

    function checkWin() {
        return tiles.every((tile) => {
            tile.dataset.order === tile.dataset.newOrder;
        });
    }

    Flip.from(state, {
        duration: 0.2,
        ease: "linear",
        onComplete: () => {
            if (checkWin()) {
                gsap.to(tiles, { opacity: 1, duration: 0.2 });
                console.log("WIN");
            }
        }
    });
}

/**
 * shuffle the grid
 */
function shufflePuzzle(level) {
    const tiles = [
        ...document.querySelectorAll(`[data-level="${level}"] .puzzle > span`)
    ];

    const state = Flip.getState(tiles);
    const shuffleOrder = getRandomOrder(tiles.length);
    const coordinates = getGridCoordinates(Math.sqrt(tiles.length));

    tiles.forEach((tile, idx) => {
        tile.style.order = shuffleOrder[idx];

        tile.dataset.order = idx;
        tile.dataset.newOrder = shuffleOrder[idx];
        tile.dataset.newPos = coordinates[shuffleOrder[idx]];
    });

    // create empty tile
    tiles[tiles.length - 1].dataset.empty = true;

    Flip.from(state, {
        duration: 1,
        ease: "back.out(0.7)",
        onComplete: () => {
            gsap.to(tiles[tiles.length - 1], { opacity: 0, duration: 0.2 });
            console.log("game start");
        }
    });
}

/**
 * reset grid
 */
function reset(level) {
    const tiles = [
        ...document.querySelectorAll(`[data-level="${level}"] .puzzle > span`)
    ];
    const state = Flip.getState(tiles);
    const coordinates = getGridCoordinates(Math.sqrt(tiles.length));

    tiles.forEach((tile, idx) => {
        tile.style.order = idx + 1;
        tile.dataset.pos = coordinates[idx];
        tile.dataset.newOrder = idx;
        tile.dataset.newPos = coordinates[idx];
    });

    Flip.from(state, {
        duration: 0.5,
        ease: "back.out(1.7)",
        onComplete: () => {
            console.log("reset");
            gsap.to(tiles, { opacity: 1 });
        }
    });
}

/**
 *--------------------------------------------------------------------------
 * Helpers
 *--------------------------------------------------------------------------
 */

/**
 * create an array of coordinates for the grid
 */
function getGridCoordinates(gridSize) {
    let coord = [];

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            coord.push(`${j},${i}`);
        }
    }

    return coord;
}

/**
 * get a random interger
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * create array of random number with no duplicates
 */
function getRandomOrder(max) {
    const array = Array.from({ length: max }, (_, x) => x);
    return array.sort((a, b) => 0.5 - Math.random());
}
