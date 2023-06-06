'use strict';

const INITIAL_GOLD = 0;
const INITIAL_BASIC_BUILDERS = 0;
const INITIAL_CLICK_BOOST = 1;
const INITIAL_BASIC_BUILDER_COST = 10;
const INITIAL_CLICK_BOOST_UPGRADE_COST = 50;
const COST_INCREMENT = 1.15;
const BOOST_MULTIPLIER = 2;
const POINTS_CHANGE_DISPLAY_TIME = 500;
const PURCHASE_MESSAGE_DISPLAY_TIME = 2000;
const FEEDBACK_DISPLAY_TIME = 2000;

class Game {
    constructor() {
        this.init();
    }

    init() {
        this.gold = INITIAL_GOLD;
        this.basicBuilders = INITIAL_BASIC_BUILDERS;
        this.clickBoost = INITIAL_CLICK_BOOST;
        this.basicBuilderCost = INITIAL_BASIC_BUILDER_COST;
        this.clickBoostUpgradeCost = INITIAL_CLICK_BOOST_UPGRADE_COST;
    }

    buyBasicBuilder() {
        if(this.gold < this.basicBuilderCost) return false;
        this.gold -= this.basicBuilderCost;
        this.basicBuilders++;
        this.basicBuilderCost = Math.round(this.basicBuilderCost * COST_INCREMENT);
        return true;
    }

    buyMaxBasicBuilders() {
        while(this.gold >= this.basicBuilderCost) {
            this.buyBasicBuilder();
        }
    }

    buyClickBoostUpgrade() {
        if(this.gold < this.clickBoostUpgradeCost) return false;
        this.gold -= this.clickBoostUpgradeCost;
        this.clickBoost *= BOOST_MULTIPLIER;
        this.clickBoostUpgradeCost *= BOOST_MULTIPLIER;
        return true;
    }

    buyMaxClickBoostUpgrades() {
        while(this.gold >= this.clickBoostUpgradeCost) {
            this.buyClickBoostUpgrade();
        }
    }

    build() {
        const pointsGain = this.clickBoost;
        this.gold += pointsGain;
        return pointsGain;
    }

    basicBuilderProduction() {
        const pointsGain = this.basicBuilders;
        this.gold += pointsGain;
        return pointsGain;
    }

    save() {
        localStorage.setItem('game', JSON.stringify(this));
    }

    load() {
        const savedData = JSON.parse(localStorage.getItem('game'));
        if (savedData) {
            Object.assign(this, savedData);
        }
    }
}

class Renderer {
    constructor(game, uiElements) {
        this.game = game;
        this.uiElements = uiElements;
        this.lastPointsChangeUpdate = Date.now();
        this.startRendering();
    }

    updateDisplay() {
        this.uiElements.currencyCounter.textContent = Math.floor(this.game.gold);
        this.uiElements.builderCost.textContent = this.game.basicBuilderCost;
        this.uiElements.upgradeCost.textContent = this.game.clickBoostUpgradeCost;
        this.uiElements.basicBuilderQuantity.textContent = this.game.basicBuilders;
        this.uiElements.clickBoostQuantity.textContent = this.game.clickBoost - 1;
        this.uiElements.basicBuilderBuyButton.disabled = this.game.gold < this.game.basicBuilderCost;
        this.uiElements.basicBuilderBuyMaxButton.disabled = this.game.gold < this.game.basicBuilderCost;
        this.uiElements.upgradeBuyButton.disabled = this.game.gold < this.game.clickBoostUpgradeCost;
        this.uiElements.upgradeBuyMaxButton.disabled = this.game.gold < this.game.clickBoostUpgradeCost;
    }

    displayPointsChange(pointsChange) {
        pointsChange = Math.round(pointsChange * 100) / 100;
        this.uiElements.pointsChangeDisplay.textContent = `+${pointsChange}`;
        this.uiElements.pointsChangeDisplay.style.opacity = 1;
        setTimeout(() => {
            this.uiElements.pointsChangeDisplay.style.opacity = 0;
        }, POINTS_CHANGE_DISPLAY_TIME);
    }

    displayPurchaseSuccess() {
        this.uiElements.purchaseMessage.style.opacity = 1;
        setTimeout(() => {
            this.uiElements.purchaseMessage.style.opacity = 0;
        }, PURCHASE_MESSAGE_DISPLAY_TIME);
    }

    displayFeedback(feedbackX, feedbackY, textContent) {
        const feedback = this.uiElements.feedbackPool.pop() || document.createElement("div");
        feedback.textContent = textContent;
        feedback.style.left = `${feedbackX}px`;
        feedback.style.top = `${feedbackY}px`;
        this.uiElements.gameContainer.appendChild(feedback);
        setTimeout(() => {
            this.uiElements.gameContainer.removeChild(feedback);
            this.uiElements.feedbackPool.push(feedback);
        }, FEEDBACK_DISPLAY_TIME);
    }

    displayBuildFeedback() {
        const buttonRect = document.getElementById('build-button').getBoundingClientRect();
        const containerRect = this.uiElements.gameContainer.getBoundingClientRect();
        const feedbackX = (Math.random() * (buttonRect.width + 100) - 100) + buttonRect.left - containerRect.left; 
        const feedbackY = (Math.random() * (buttonRect.height + 1) - 60) + buttonRect.top - containerRect.top;  
        this.displayFeedback(feedbackX, feedbackY, "+1");
    }

    displayBasicBuilderProduction() {
        const buttonRect = this.uiElements.basicBuilderBuyButton.getBoundingClientRect();
        const containerRect = this.uiElements.gameContainer.getBoundingClientRect();
        const feedbackX = Math.random() * (buttonRect.right - buttonRect.left) + buttonRect.left - containerRect.left;
        const feedbackY = Math.random() * (buttonRect.bottom - buttonRect.top) + buttonRect.top - containerRect.top;
        this.displayFeedback(feedbackX, feedbackY, `+${this.game.basicBuilders}`);
    }

    renderLoop() {
        const now = Date.now();
        this.updateDisplay();
        if (now - this.lastPointsChangeUpdate >= 1000) {
            this.displayBasicBuilderProduction();
            this.game.basicBuilderProduction();
            this.lastPointsChangeUpdate = now;
        }
        requestAnimationFrame(() => this.renderLoop());
    }

    startRendering() {
        this.renderLoop();
    }
}

const uiElements = {
    audio: document.getElementById('bg-music'),
    currencyCounter: document.getElementById('currency-counter'),
    builderCost: document.getElementById('basic-builder-cost'),
    upgradeCost: document.getElementById('click-boost-cost'),
    basicBuilderQuantity: document.getElementById('basic-builder-quantity'),
    clickBoostQuantity: document.getElementById('click-boost-quantity'),
    basicBuilderBuyButton: document.getElementById('basic-builder-buy-button'),
    basicBuilderBuyMaxButton: document.getElementById('basic-builder-buy-max-button'),
    upgradeBuyButton: document.getElementById('upgrade-buy-button'),
    upgradeBuyMaxButton: document.getElementById('upgrade-buy-max-button'),
    pointsChangeDisplay: document.getElementById('points-change'),
    purchaseMessage: document.getElementById('purchase-message'),
    gameContainer: document.querySelector('.game-container'),
    feedbackPool: []
};

for (let i = 0; i < 100; i++) {
    const feedback = document.createElement("div");
    feedback.classList.add("build-feedback");
    uiElements.feedbackPool.push(feedback);
}

const game = new Game();
const renderer = new Renderer(game, uiElements);

document.getElementById('build-button').addEventListener('click', () => {
    game.build();
    renderer.displayBuildFeedback();
    if (uiElements.audio.paused) {
        uiElements.audio.play();
    }
});

uiElements.basicBuilderBuyButton.addEventListener('click', () => {
    if (game.buyBasicBuilder()) {
        renderer.displayPurchaseSuccess();
    }
});

uiElements.basicBuilderBuyMaxButton.addEventListener('click', () => {
    let purchaseMade = false;
    while(game.buyBasicBuilder()) {
        purchaseMade = true;
    }
    if (purchaseMade) {
        renderer.displayPurchaseSuccess();
    }
});

uiElements.upgradeBuyButton.addEventListener('click', () => {
    if (game.buyClickBoostUpgrade()) {
        renderer.displayPurchaseSuccess();
    }
});

uiElements.upgradeBuyMaxButton.addEventListener('click', () => {
    let purchaseMade = false;
    while(game.buyClickBoostUpgrade()) {
        purchaseMade = true;
    }
    if (purchaseMade) {
        renderer.displayPurchaseSuccess();
    }
});

document.getElementById('save-button').addEventListener('click', () => {
    game.save();
});

document.getElementById('load-button').addEventListener('click', () => {
    game.load();
    renderer.updateDisplay();  
});
