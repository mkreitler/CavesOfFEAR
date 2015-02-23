game.modules.statePlayDemo = {

  init: function(args) {
    this.STACK_STAGGER_PERIOD = 3;    // Number of cards placed before height resets to top of stack bounds
    this.STACK_START_FACTOR = 4 / 5;  // How far down the screen the stacks start

    this.stacks = [];
    this.curCard = null;
    this.equationGrid = null;
    this.comboStartCard = null;
    this.comboEndCard = null;

    this.createStacks();
  },

  mouseDown: function(x, y) {
    var iStack, iCard;

    this.curCard = null;

    for (iStack=0; iStack<this.stacks.length; ++iStack) {
      for (iCard=this.stacks[iStack].cards.length - 1; iCard>=0; --iCard) {
        if (this.stacks[iStack].cards[iCard].isVisible() && this.stacks[iStack].cards[iCard].mouseDown(x, y)) {
          this.curCard = this.stacks[iStack].cards[iCard];
          iStack = this.stacks.length;
          break;
        }
      }
    }

    if (this.curCard &&
        this.curCard.isSkillCard() &&
        this.curCard.isCombo()) {
      this.equationGrid.setComboMode();
    }

    return this.curCard ? true : false;
  },

  mouseDrag: function(x, y) {
    var bHandled = false;

    if (this.curCard) {
      bHandled = this.curCard.mouseDrag(x, y);
    }

    return bHandled;
  },

  mouseUp: function(x, y) {
    var bHandled = false,
        rBounds = null,
        hitCard = null,
        overlaps = null,
        bReturnToStack = true;

    if (this.curCard) {
      bHandled = this.curCard.mouseUp(x, y);

      if (bHandled) {
        if (this.curCard.isSkillCard() &&
            this.curCard.isCombo()) {
          // If dropped on another skill card, promote that segment
          // of the expression into a parenthetical sub-expression.
          overlaps = this.equationGrid.getOverlappedSkillCard(this.curCard);
          hitCard = overlaps.best;

          if (hitCard && this.equationGrid.canCombo(hitCard)) {
            this.equationGrid.promote(hitCard,
                                      this.comboStartCard,
                                      this.comboEndCard);

            // Always return the "Focus" card to the stack, because
            // it's either been played incorrectly, or it adds
            // "Combo Start" and "Combo End" cards to the line.
            bReturnToStack = true;
          }
        }
        else {
          // Return this card to the stack, or add this card
          // to the board and replace it in the stack.
          rBounds = this.curCard.getBoundsRef();
          if (rBounds.y + rBounds.h < this.curCard.stack.y) {
            if (this.equationGrid.addToLine(this.curCard)) {
              this.replaceInStack(this.curCard);
              bReturnToStack = false;
            }
          }
        }

        if (bReturnToStack) {
            // Return to stack.
            this.curCard.returnToStack();
        }
      }
    }

    this.equationGrid.clearComboMode();
    this.curCard = null;

    return bHandled;
  },

  // Implementation -----------------------------------------------------------
  createStacks: function() {
    this.powerStack = {
      x: glob.Graphics.getWidth() / 20,
      y: glob.Graphics.getHeight() * this.STACK_START_FACTOR,
      cards: []
    };
    this.stacks.push(this.powerStack);

    this.skillStack = {
      x: glob.Graphics.getWidth() * (0.5 + 1 / 20),
      y: glob.Graphics.getHeight() * this.STACK_START_FACTOR,
      cards: []
    };
    this.stacks.push(this.skillStack);
  },

  createGrid: function() {
    this.equationGrid = new game.EquationGrid({
      bounds: new glob.Math.rect2(0, 0, glob.Graphics.getWidth(), this.STACK_START_FACTOR * glob.Graphics.getHeight()),
      rows: Math.floor(this.STACK_START_FACTOR * glob.Graphics.getHeight() / game.spriteSheets.skillCards.getCellHeight()),
    })
  },

  replaceInStack: function(card) {
    var iCard = 0;

    for (iCard=0; card && iCard<card.stack.cards.length; ++iCard) {
      if (card.stack.cards[iCard] === card) {
        // Found the card. Replace it.
        card.stack.cards[iCard] = card.createCopy();
        card.stack = null;
        break;
      }
    }
  },

  createCards: function() {
    var iCard = 0,
        card = null;

    for (iCard=0; iCard<game.SkillCard.SUITS.NUM_SUITS; ++iCard) {
      card = new game.SkillCard({
        parent: null,
        spriteSheet: game.spriteSheets.skillCards,
        frameIndex: iCard,
        bDraggable: true,
        x: this.skillStack.x + iCard * game.cardOffsetX(),
        y: this.skillStack.y + iCard % this.STACK_STAGGER_PERIOD * game.cardOffsetY(),
        value: iCard,
        stack: this.skillStack,
        // TODO: add remaining args.
      });

      // Keep "COMBO_START" and "COMBO_END" cards out of
      // the stack.
      if (iCard < game.SkillCard.SUITS.COMBO_START) {
        this.skillStack.cards.push(card);
      }
      else if (iCard === game.SkillCard.SUITS.COMBO_START) {
        this.comboStartCard = card;
      }
      else if (iCard === game.SkillCard.SUITS.COMBO_END) {
        this.comboEndCard = card;
      }
    }

    // Hide cards associated with parenthetical operations.
    // for (iCard=game.SkillCard.SUITS.COMBO_START;
    //      iCard<=game.SkillCard.SUITS.COMBO_END;
    //      ++iCard) {
    //   this.skillStack.cards[iCard].setVisible(false);
    // }

    for (iCard=0; iCard<game.COF.MAX_POWER; ++iCard) {
      this.powerStack.cards.push(new game.PowerCard({
        parent: null,
        spriteSheet: game.spriteSheets.powerCards,
        frameIndex: game.PowerCard.SUITS.COMBAT_POWER,
        bDraggable: true,
        x: this.powerStack.x + iCard * game.cardOffsetX(),
        y: this.powerStack.y + iCard % this.STACK_STAGGER_PERIOD * game.cardOffsetY(),
        value: iCard + 1,
        stack: this.powerStack,
        // TODO: add remaining args.
      }));
    }
  },

  enter: function() {
    // TODO: fill in.
    if (this.skillStack.cards.length === 0) {
      this.createCards();
      this.createGrid();
    }
  },

  exit: function() {
    // TODO: fill in.
  },

  draw: function(ctxt) {
    var iCard = 0;

    this.clearBackground(ctxt);

    this.equationGrid.draw(ctxt);

    // TEMP:
    // Draw power cards.
    for (iCard=0; iCard<this.powerStack.cards.length; ++iCard) {
      if (!this.curCard || this.powerStack.cards[iCard] !== this.curCard) {
        this.powerStack.cards[iCard].draw(ctxt);
      }
    }

    // Draw skill cards.
    for (iCard=0; iCard<this.skillStack.cards.length; ++iCard) {
      if (!this.curCard || this.skillStack.cards[iCard] !== this.curCard) {
        this.skillStack.cards[iCard].draw(ctxt);
      }
    }

    if (this.curCard) {
      this.curCard.draw(ctxt);
    }
  }
};

