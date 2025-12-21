class Card {
  constructor(value, color) {
    this.value = value;
    this.color = color;
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

//const discardALL = []

const discardPiles = {
  discardW: [],
  discardR: [],
  discardY: [],
  discardG: [],
  discardB: [],
};

const player1area = {
  p1White: [],
  p1Red: [],
  p1Yellow: [],
  p1Green: [],
  p1Blue: []
}

const player2area = {
  p2White: [],
  p2Red: [],
  p2Yellow: [],
  p2Green: [],
  p2Blue: []
}


setMode(mode, colorsTemplate);
const totalCardsInFullDeck = colorsTemplate.length * 13;
createDeckTemplate(deck, totalCardsInFullDeck);
createNewDeck(value, colorsTemplate, deck);
dealStartingHands(deck, hands, actPl);
renderPlayerHand(hands, actPl);
actPl = switchActPl(actPl);
renderPlayerHand(hands, actPl);
renderDiscardPiles(discardPiles);


function createDeckTemplate(deck, totalCardsInFullDeck) {
  for (let i = 1; i <= totalCardsInFullDeck; i++) {
    const card = new Card(null, null);
    deck.push(card);
  }
}

function createNewDeck(value, colorsTemplate, deck) {
  colorsTemplate.forEach((color) => {
    for (let i = 1; i <= 3; i++) {
      const card = new Card("bet", color);
      insertCardAtRandomIndex(card, deck);
    }
    for (let value = 1; value <= 10; value++) {
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
  return actPl;
}

function drawCardFrom(source, hands, actPl) {
  //the index 0 suggests the top of the deck
  const card = deck[0];
  let playerHand;
  actPl === 1 ? (playerHand = hands.hPlayer1) : (playerHand = hands.hPlayer2);
  deck.splice(0, 1);
  playerHand.push(card);
}

function moveCardTo(card, target, hand, actPl) {
  //! how card is declared is dependent on drag-and-drop solutions
  //[] Find out if using id/data in html may be of use
  //[] use some card functions as methods for card/hand objects 
  //@ const card = pickCardFromHand(hand.actPl);
}

function renderPlayerHand(hands, actPl) {
  let handData;
  actPl === 1 ? handData = hands.hPlayer1 : handData = hands.hPlayer2
  const playerHandBox = document.querySelector(`.js-p${actPl}-area`);
  let innerHtml = '';
  handData.forEach((card) => {
    innerHtml += `<div 
    class="card js-card" 
    data-player="${actPl}"
    data-color="${card.color}"
    data-value="${card.value}"
    draggable="true"
    id="${card.color}-${card.value}"
    >
    ${card.value}
    </div> `
  })
  playerHandBox.innerHTML = innerHtml;
  console.log('Player hand rendered for player: ', actPl)
  addDragAndDropEventListeners(handData, discardPiles, draggedCard)
}

function renderDiscardPiles(discardPiles, draggedCard) {
  const discardArea = document.querySelector(".js-discard-area");
  // since discardPiles is an object, Object.entries returns an array so that forEach and indexOf methods are available
  const discardPilesArray = Object.entries(discardPiles);
  console.log(discardPilesArray)
  let innerHTML = ""
  discardPilesArray.forEach((pile) => {
    const indexOfPile = discardPilesArray.indexOf(pile);
    innerHTML += `<div
    class="discard-pile
    js-discard-pile"
    data-color="${discardPilesArray[indexOfPile][0]}"
    id="target"
    ></div>`
  })
  discardArea.innerHTML = innerHTML;
  document.querySelectorAll(".discard-pile").

  //? delete to make DRY and to avoid conflicts
  forEach((discardPileELement) => {
    addDropEventListener(discardPileELement, discardPiles, draggedCard)
  })
}

function addDragAndDropEventListeners(handData, discardPiles, draggedCard) {
  handData.forEach((card) => {
    const cardElement = 
    document.getElementById(`${card.color}-${card.value}`)
    cardElement.addEventListener("dragstart", (ev) => {
      const cardElementData = cardElement.outerHTML;
      ev.dataTransfer.setData("html", cardElementData);
      console.log(cardElementData)
      draggedCard = card; //stores card in a variable outside of the scope to access it with a different event listener 
      //! sometimes returns undefined
      //TODO: figure out why line 214 returns undefined
      console.log(card)
      const discardPilesArray = Object.entries(discardPiles);
      document.querySelectorAll(".discard-pile").
      forEach((discardPileELement) => {
        addDropEventListener(discardPileELement, discardPiles, draggedCard, handData)
      })
    })
  })
}

function addDropEventListener(discardPileELement, discardPiles, draggedCard, handData) {
  discardPileELement.addEventListener("dragover", (ev) => {
    console.log("dragover");
    ev.preventDefault();
  })
  discardPileELement.addEventListener("drop", (ev) => {
    const cardElementData = ev.dataTransfer.getData("html");
    discardPileELement.innerHTML = cardElementData;
    console.log(draggedCard)
    console.log(discardPiles);
    draggedCard = handData.find(card => (card.color === draggedCard.color 
    && card.value === draggedCard.value))
    console.log(draggedCard)

    discardPiles.discardR.push(draggedCard);
    console.log(discardPiles);

    const draggedCardIndex = handData.indexOf(draggedCard)
    handData.splice(draggedCardIndex, 1)
    console.log('card deleted from hand. draggedCard: ', draggedCard, 'draggedCardIndex: ', draggedCardIndex, 'handData: ', handData);
  })
}


//-------------------------------------


/*
const p1 = document.getElementById("p1");
p1.addEventListener("dragstart", dragstartHandler);
const target = document.getElementById("target");

// Cancel dragover so that drop can fire
target.addEventListener("dragover", (ev) => {
  ev.preventDefault();
});
target.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  ev.target.append(data);
});
*/