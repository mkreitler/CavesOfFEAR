game.Operand = new glob.NewGlobType(
  {
    // Class Definition /////////////////////////////////////////////////////////
  },
  {
    // Instance Definition ////////////////////////////////////////////////////
    value: 0,
    card: null,

    init: function(args) {
      this.value = args.value;
      this.card = args.card;
    },

    getValue: function() {
      return this.value;
    }
  }
);