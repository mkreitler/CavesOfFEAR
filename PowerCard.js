// Power card object.
game.PowerCard = new glob.NewGlobType(
  {
    // Class Definitions ------------------------------------------------------
    SUITS: {COMBAT_POWER: 0,
            WEAPON_POWER: 1,
            ARMOR_POWER:  2},
  },
  [
    game.ModuleCard,

    {
      DIGIT_COLOR: "white",
      
      // Instance Definitions ---------------------------------------------------
      createCopy: function() {
        var copy = new game.PowerCard({
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

      onDraw: function(ctxt) {
        var x, y, bounds;

        // Draw the value in the upper left corner.
        if (game.res.font && this.panel) {
          bounds = this.panel.getBoundsRef();
          x = bounds.x + bounds.w / 6;
          y = bounds.y + bounds.h / 10;
          game.res.font.draw(ctxt, "" + this.value, x, y, this.DIGIT_COLOR, 32, 0.5, 0.5);
        }
      },

      stringVal: function() {
        return "" + this.value;
      },

      isSkillCard: function() {
        return false;
      }
    }
  ]
);
