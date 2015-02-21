// Skill card object.
game.SkillCard = new glob.NewGlobType(
  {
    // Class Definitions ------------------------------------------------------
    // The SUIT acts as an index into OPERATORS when analyzing the equation.
    // The SUITs should line up with the game.Operator.SYMBOLS string.
    SUITS: {CHAIN_SKILL:  0,
            FEINT_SKILL:  1,
            FLURRY_SKILL: 2,
            DEFLECT_SKILL:3,
            FOCUS_SKILL:  4,
            COMBO_SKILL:  5,
            COMBO_START:  6,
            COMBO_END:    7,
            NUM_SUITS:    8},
    // SUITS: {CHAIN_SKILL:  0,
    //         FEINT_SKILL:  1,
    //         FLURRY_SKILL: 2,
    //         DEFLECT_SKILL:3,
    //         FOCUS_SKILL:  4,
    //         COMBO_SKILL:  5},
  },
  [
    // Instance Definitions ---------------------------------------------------
    game.ModuleCard,

    {
      stringVal: function() {
        var strVal = game.Operator.SYMBOLS.substring(this.value, this.value + 1);

        if (!strVal) {
          if (this.value === game.SkillCard.SUITS.COMBO_START) {
            strVal = game.Operator.OPEN_PARENTHESIS;
          }
          else if (this.value === game.SkillCard.SUITS.COMBO_END) {
            strVal = game.Operator.CLOSE_PARENTHESIS;
          }
        }

        return strVal;
      },

      isCombo: function() {
        return this.value === game.SkillCard.SUITS.COMBO_SKILL;
      },

      isParenthesis: function() {
        return this.value === game.SkillCard.SUITS.COMBO_START ||
               this.value === game.SkillCard.SUITS.COMBO_END;
      },

      createCopy: function() {
        var copy = new game.SkillCard({
          parent: null,
          spriteSheet: this.panel.spriteSheet,
          frameIndex: this.panel.frameIndex,
          bDraggable: this.panel.bDraggable,
          x: this.stackX,
          y: this.stackY,
          value: this.value,
          stack: this.stack,
        });

        copy.panel.unregister();

        return copy;
      },
    }
  ]
);

