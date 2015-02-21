game.Operator = new glob.NewGlobType(
  {
    // Class Definition /////////////////////////////////////////////////////////
    SYMBOLS: "+-*/^",
    OPEN_PARENTHESIS: "(",
    CLOSE_PARENTHESIS: ")",

    getSymbolExecOrder: function(symbol) {
      return Math.round((game.Operator.SYMBOLS.indexOf(symbol) + 1) / 2) - 1;      
    }
  },
  {
    // Instance Definition ////////////////////////////////////////////////////
    operation: null,
    card: null,
    leftNode: null,
    rightNode: null,

    init: function(args) {
      this.operation = args.operation;
      this.card = args.card;
      this.leftNode = args.leftNode;
      this.rightNode = args.rightNode;
    }
  }
);