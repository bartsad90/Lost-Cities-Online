class Card {
  constructor(value, color) {
    this.value = value;
    this.color = color;

    //* both source and destination have to be arrays in order for find() and push() to work
    this.moveToFrom = function moveToFrom(target, source) {
      //const movedCard = source.find(this);
      const sourceIsArray = Array.isArray(source);
      !sourceIsArray ? source = source[`${this.color}`] : source
      const indexOfMovedCard = source.indexOf(this);
      target.push(this);
      source.splice(indexOfMovedCard, 1);
    };
  }
}

//activePlayer
let actPl = 1;
let draggedCard;
const colorsTemplate = ["white", "red", "yellow", "green", "blue"];

//set to 'advanced' if you want to add purple cards to the game
const mode = "basic";
const deck = [];
let value = 1;
const hPlayer1 = [];
const hPlayer2 = [];
let hands = {
  hPlayer1,
  hPlayer2,
};

//[] use a constructor to create stacks
//?add some methods to the class
const discardPiles = {
  white: [],
  red: [],
  yellow: [],
  green: [],
  blue: [],
};
const sPlayer1 = {
  white: [],
  red: [],
  yellow: [],
  green: [],
  blue: [],
};
const sPlayer2 = {
  white: [],
  red: [],
  yellow: [],
  green: [],
  blue: [],
};

const stacks = {
  sPlayer1,
  sPlayer2
}

setMode(mode, colorsTemplate);
const totalCardsInFullDeck = colorsTemplate.length * 12;
createDeckTemplate(deck, totalCardsInFullDeck);
createNewDeck(colorsTemplate, deck);
dealStartingHands(deck, hands, actPl);
renderPlayerHand(hands, actPl);
actPl = switchActPl(actPl);
renderPlayerHand(hands, actPl);
actPl = switchActPl(actPl);
renderDiscardPiles(discardPiles, colorsTemplate);
renderDeckArea(deck);

function createDeckTemplate(deck, totalCardsInFullDeck) {
  for (let i = 1; i <= totalCardsInFullDeck; i++) {
    const card = new Card(null, null);
    deck.push(card);
  }
}

function createNewDeck(colorsTemplate, deck) {
  //* cards with value: 1 are bet cards. There are three per color.

  colorsTemplate.forEach((color) => {
    for (let i = 1; i <= 3; i++) {
      const card = new Card(1, color);
      insertCardAtRandomIndex(card, deck);
    }
    for (let value = 2; value <= 10; value++) {
      const card = new Card(value, color);
      insertCardAtRandomIndex(card, deck);
    }
  });
  console.log("New deck created. Deck: ", deck);
}

function insertCardAtRandomIndex(card, deck) {
  //deck.length - 1 ===  the last index in a zero-indexed array in case the RNG creates 1.
  let randomIndex = (Math.random() * (deck.length - 1)).toFixed(0);
  while (randomIndex < deck.length) {
    if (deck[randomIndex].value === null) {
      deck.splice(randomIndex, 1, card);
      break;
    }
    if (randomIndex === deck.length - 1) {
      randomIndex = 0;
    } else {
      randomIndex++;
    }
  }
}

function setMode(mode, colorsTemplate) {
  const isPurple = colorsTemplate.some((color) => color === "purple");
  if (mode === "advanced" && !isPurple) {
    console.log(`Advanced mode chosen. Purple added to the deck`);
    colorsTemplate.push("purple");
  } else if (mode === "advanced" && !isPurple) {
    const indexOfPurple = colorsTemplate.indexOf("purple");
    colorsTemplate.splice(indexOfPurple, 1);
    console.log(`Advanced mode chosen`);
  } else if (mode === "basic" && isPurple) {
    const indexOfPurple = colorsTemplate.indexOf("purple");
    colorsTemplate.splice(indexOfPurple, 1);
    console.log("Basic mode chosen. Purple removed from the deck");
  } else {
    console.log("Basic mode chosen");
  }
}

function dealStartingHands(deck, hands, actPl) {
  const cardsDealtTotal = 14;
  for (i = 1; i <= cardsDealtTotal; i++) {
    drawCardFrom(deck, hands, actPl);
    actPl = switchActPl(actPl);
  }
  console.log("Starting hands: ", hands, "deck: ", deck);
}

function switchActPl(actPl) {
  actPl === 1 ? actPl++ : (actPl = 1);
  //console.log(`Player switched. It's now player ${actPl} turn`)
  return actPl;
}

function drawCardFrom(source, hands, actPl) {
  //the index 0 suggests the top of the deck
  const card = source[0];
  let playerHand;
  actPl === 1 ? (playerHand = hands.hPlayer1) : (playerHand = hands.hPlayer2);
  deck.splice(0, 1);
  playerHand.push(card);
}

function renderPlayerHand(hands, actPl) {
  let handData;
  actPl === 1 ? (handData = hands.hPlayer1) : (handData = hands.hPlayer2);
  const playerHandBox = document.querySelector(`.js-player-hand-box-${actPl}`);
  let innerHtml = "";
  handData.forEach((card) => {
    innerHtml += `<div 
    class="card js-card player-hand" 
    data-player="${actPl}"
    data-color="${card.color}"
    data-value="${card.value}"
    draggable="true"
    id="${card.color}-${card.value}"
    >
    ${card.value}
    </div> `;
  });
  playerHandBox.innerHTML = innerHtml;
  playerHandBox.removeEventListener("dragover", (event) => {
    event.preventDefault();
    playerHandBox.classList.add("dragover");
  });

  playerHandBox.removeEventListener("drop", (event) => dropHandler(event, playerHandBox))
  
  addDragoverListener(playerHandBox);
  addDropListener(playerHandBox);

  document.querySelectorAll(".js-card").forEach((cardElement) => {
    addDragstartListener(cardElement);
  });
  console.log("Player hand rendered for player: ", actPl);
}

function renderDiscardPiles(discardPiles, colorsTemplate) {
  console.log("Rendering discard piles");
  console.log("discardPiles: ", discardPiles);
  let innerHTML = "";
  const discardArea = document.querySelector(".js-discard-area");

  colorsTemplate.forEach((color) => {
    innerHTML += `<div
    class="discard-pile
    js-discard-pile"
    data-color="${color}"
    id="discard-${color}"
    >
      <div class="inner-pile-${color}">
      </div>
    </div>`;
  });

  discardArea.innerHTML = innerHTML;

  //discardArea.removeEventListener("drop", (event) => {
  //dropHandler(event, discardArea);
  //  });
  addDragoverListener(discardArea);
  addDropListener(discardArea);

  colorsTemplate.forEach((color) => {
    innerHTML = "";
    const innerPile = document.querySelector(`.inner-pile-${color}`);
    const discardPile = discardPiles[`${color}`];
    discardPile.forEach((card) => {
      innerHTML += `<div 
      class="card js-card" 
      data-source="discard"
      data-color="${card.color}"
      data-value="${card.value}"
      draggable="true"
      id="discard-inner-${color}"
      >
      ${card.value}
      </div> `;
    });
    innerPile.innerHTML = innerHTML;

    //! Needs testing
    //Chooses only the first element with the id, so that only the top card gets the 'dragstart' listener
    //@ If it doesn't add the right listener to the top card:
    //@  discardPile.indexOf(card) === 0 ? addDragstartListener(cardElement) : cardElement

    cardElement = document.querySelector(`#discard-inner-${color}`);
    cardElement ? addDragstartListener(cardElement) : color;
  });
}

function renderDeckArea(deck) {
  const deckCardCount = deck.length;
  renderDeckCardCount(deckCardCount);
  deckElement = document.querySelector(".js-deck");
  //! remove listeners to avoid listeners from stacking
  //[] create a dropHandler/dragstartHandler function so that syntax from removeEventListener is DRY
  deckElement.removeEventListener("dragover", (event) => {
    event.preventDefault();
    htmlElement.classList.add("dragover");
  });

  deckElement.classList.add("card");
  const topCard = deck[0];
  deckElement.dataset.color = topCard.color;
  deckElement.dataset.value = topCard.value;
  deckElement.dataset.source = "deck";

  deckElement.innerHTML = "deck";
  addDragstartListener(deckElement);
}

function renderDeckCardCount(deckCardCount) {
  console.log("rendering card counter");
  cardCounterElement = document.querySelector(".js-deck-card-counter");
  cardCounterElement.innerHTML = `Cards in deck: ${deckCardCount}`;
}

function addDragstartListener(htmlElement) {
  htmlElement.addEventListener("dragstart", (event) => {
    dragstartHandler(event, htmlElement);
  })
}
function dragstartHandler(event, htmlElement) {
  event.dataTransfer.clearData();
    const draggedCardData = JSON.stringify({
      color: htmlElement.dataset.color,
      value: htmlElement.dataset.value,
      source: htmlElement.dataset.player || htmlElement.dataset.source,
    });
    console.log("dragstart: ", draggedCardData);
    event.dataTransfer.setData("text", draggedCardData);
}

function addDropListener(htmlElement) {
  htmlElement.addEventListener("drop", (event) => {
    dropHandler(event, htmlElement)
  });
}

function dropHandler(event, htmlElement) {
  console.log("drop");
  let target = findTarget(htmlElement);
  const draggedCard = JSON.parse(event.dataTransfer.getData("text"));
  console.log("draggedCard: ", draggedCard);
  const source = findSource(draggedCard.source);
  console.log("source: ", source);
  console.log("target: ", target);
  console.log(target === discardPiles);
  console.log(`${draggedCard.color}`);
  console.log(target[`${draggedCard.color}`]);
  
  //? Is there a way to state: 'if target is strictly equal to a subset of the sacks object'?
  if (target === discardPiles 
      || target === stacks.sPlayer1 
      || target === stacks.sPlayer2) 
   {target = target[`${draggedCard.color}`];}

  console.log("target: ", target)
  const foundCard = findCardInArray(draggedCard, source);

  foundCard
  ? foundCard.moveToFrom(target, source)
  : console.log(`Card not found`);
  console.log('target: ', target, 'source: ', source);
  renderDeckArea(deck);
  renderDiscardPiles(discardPiles, colorsTemplate);
  renderPlayerHand(hands, actPl);
  renderPlayerStacks(stacks, colorsTemplate);
  htmlElement.classList.remove("dragover");
  actPl = switchActPl(actPl);
}

function findSource(sourceData) {
  let source;
  if (sourceData === "deck") {
    source = deck;
  } else if (sourceData === "1" || sourceData === "2") {
    source = hands[`hPlayer${sourceData}`];
  } else if (sourceData === "discard") {
    source = discardPiles;
  }
  return source;
}

function findCardInArray(card, array) {
  console.log(card);
  console.log(array);
  if (!Array.isArray(array)) {array = array[`${card.color}`]}
  const searchedCard = array.find(
    (element) =>
      element.color === card.color &&
    Number(element.value) === Number(card.value)
  );
  console.log("Card found: ", searchedCard);
  return searchedCard;
}

function addDragoverListener(htmlElement) {
  htmlElement.addEventListener("dragover", (event) => {
  event.preventDefault();
  htmlElement.classList.add("dragover");
});
}

function findTarget(htmlElement) {
  let target;
  console.log("htmlElement: ", htmlElement);
  console.log(htmlElement.classList.contains("js-discard-area"));

  if (htmlElement.classList.contains("js-player-hand-box-1")) {
    target = hands.hPlayer1;
  } else if (htmlElement.classList.contains("js-player-hand-box-2")) {
    target = hands.hPlayer2;
  } else if (htmlElement.classList.contains("js-discard-area")) {
    target = discardPiles;
  } else if (htmlElement.classList.contains("js-player-stack-box-1")) {
    target = stacks.sPlayer1;
  } else if (htmlElement.classList.contains("js-player-stack-box-2")) {
    target = stacks.sPlayer2;
  }
  console.log('target: ', target);
  return target;
}

renderPlayerStacks(stacks, colorsTemplate);

function renderPlayerStacks(stacks, colorsTemplate) {
  console.log("Rendering stacks");
  console.log("stacks: ", stacks);
  const stackElements = document.querySelectorAll(".js-player-stack-box");
  console.log(stackElements);
  
  let playerStack = 'sPlayer1';
  stackElements.forEach((stackElement) => {
    // playerNumber is equal to index + 1 to avoid representing player 1 as player 0, since arrays are zero-indexed 
    let playerNumber;
    playerStack === 'sPlayer1' ? playerNumber = 1 : playerNumber = 2; 
    let innerHTML = "";
    colorsTemplate.forEach((color) => {
      innerHTML += `<div
      class="stack-pile
      js-stack-pile"
      data-color="${color}"
      data-player="${playerNumber}"
      id="stack-p${playerNumber}-${color}"
      >
      <div class="stack-p${playerNumber}-inner-pile-${color}">
      </div>
      </div>`;
    });
    stackElement.innerHTML = innerHTML;
    addDragoverListener(stackElement);
    addDropListener(stackElement);
    playerStack = 'sPlayer2'
  })
  
  //discardArea.removeEventListener("drop", (event) => {
    //dropHandler(event, discardArea);
    //  });
    
    playerStack = 'sPlayer1';
    stackElements.forEach((stackElement) => {
      let playerNumber;
      playerStack === 'sPlayer1' ? playerNumber = 1 : playerNumber = 2; 
      colorsTemplate.forEach((color) => {
        innerHTML = "";
      const innerPile = document.querySelector(`.stack-p${playerNumber}-inner-pile-${color}`);
      const stack = stacks[`${playerStack}`][`${color}`];
      stack.forEach((card) => {
        innerHTML += `<div 
        class="card js-card" 
        data-source="stack"
        data-color="${card.color}"
        data-value="${card.value}"
        data-player="${playerNumber}"
        draggable="true"
        id="stack-p${playerNumber}-inner-pile-${color}"
        >
        ${card.value}
        </div>`;
      });
      innerPile.innerHTML = innerHTML;

      //   cardElement = document.querySelector(`#discard-inner-${color}`);
      //   cardElement ? addDragstartListener(cardElement) : color;
    });
    playerStack = 'sPlayer2'
  })
}
//! how card is declared is dependent on drag-and-drop solutions

//[] create stacks
//* use renderDiscardPiles as a template 
//[] create an object stacks for each player, which has the same structure as discardPiles

//[x] Find out if using id/data in html may be of use
//[x]] using card methods may be better than html id/data
//[x] use some card functions as methods for card/hand objects
//[x] create a single universal AddDropListener function for all elements:
//[x] - hands
//[x] - discard piles
//[x] - stacks

//[x] create a single universal AddDragStartListener function for all card elements in:
//[x] - hands
//[x] - discard piles
//[x] - deck

//[x] fix deck to hands transfer
//[x] in renders: remove the drop listener before adding new ones in order avoid listener stacking 
    //[x] create a dropHandler/dragstartHandler function so that syntax from removeEventListener is DRY
//[x] fix target determination

//[] create a gameData object which will be an argument for all functions if necessary. This will enable accessing data through gameData.property syntax without using multiple arguments

//[] eliminate the need for draggedCard as a global variable by using json.stringify/parse, dataTransfer.setData, dataTransfer.getData + card.moveFromTo()

//[] get rid of 'null' cards

//[x] fix not finding cards on drop events
