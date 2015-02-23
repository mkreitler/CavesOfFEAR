// This embodies the mathematical engine for the game.
//
// P
//
// P + 3
//
//   +
//  / \
// P   3
//
// P + 3 * 4
//
//     +
//    / \
//   P   *
//      / \
//     3   4
//
//
// P + 3 * 4 + 1
//
//       +
//      / \
//     P   +
//        / \
//       *   1
//      / \
//     3   4
//
// P + 3 * (4 + 1)
//
//       +
//      / \
//     P   *
//        / \
//       3   +
//          / \
//         4   1
//

game.EquationGrid = new glob.NewGlobType(
  {
    // Class Definition /////////////////////////////////////////////////////////
  },
  {
    // Instance Definition ////////////////////////////////////////////////////
    LAST_LINE_SPACER: 40,
    OPERATOR_ORDER: "+-*/^(",
    UNDEFINED_ORDER: 99,
    COMBO_HEIGHT_OFFSET: 25,

    line: [],
    tree: null,
    bounds: null,
    bLineIsValid: true,
    rows: 0,
    expression: "",
    bComboMode: false,
    insertionIndeces: {left:-1, right:-1},

    buildTreeFromLine: function() {
      var newTree = null,
          expressions = [];

      if (this.isLineExpressionComplete()) {
        this.maxDepth = 0;
        this.expression = this.expressionFromLine();
        newTree = this.treeFromLine(this.line, 0, this.UNDEFINED_ORDER);
      }

      return newTree;
    },

    isValidExpressionStart: function(card) {
      return card instanceof game.PowerCard ||
             (card.isSkillCard() && card.value === game.SkillCard.SUITS.COMBO_START);
    },

    isValidExpressionEnd: function(card) {
      return card instanceof game.PowerCard ||
             (card.isSkillCard() && card.value === game.SkillCard.SUITS.COMBO_END);
    },

    isLineExpressionComplete: function() {
      return this.isLineValidExpression() &&
             this.isValidExpressionStart(this.line[0]) &&
             this.isValidExpressionEnd(this.line[this.line.length - 1]);
    },

    treeFromLine: function(subLine, curDepth, lastOrder) {
      // Parse the line in reverse order of operations:
      //   -- From right to left
      //   -- Ignore expressions enclosed in '()'
      //   -- Parse '+' and '-' first
      //   -- Parse '*' and '/' next
      //   -- Parse '^' last
      //   -- FOR NOW: do not deal with parentheses
      var i = 0,
          iLowest = subLine.length,
          curChar = null,
          curOrder = -1,
          lowOrder = this.UNDEFINED_ORDER,
          lowOp = null,
          node = null,
          leftSide = null,
          curCard = null,
          rightSide = null,
          bFoundSubExpression = false,
          expressionDepth = 0;

      for (i=subLine.length - 1; i>=0; --i) {
        curChar = subLine[i].stringVal();
        if (curChar === game.Operator.OPEN_PARENTHESIS) {
          expressionDepth += 1;
          bFoundSubExpression = true;
        }
        else if (curChar === game.Operator.CLOSE_PARENTHESIS) {
          expressionDepth -= 1;
        }
        else if (game.Operator.SYMBOLS.indexOf(curChar) >= 0 &&
                 expressionDepth === 0) {
          // Check the order of the operator.
          curOrder = game.Operator.getSymbolExecOrder(curChar);
          if (curOrder < lowOrder) {
            lowOrder = curOrder;
            iLowest = i;
            lowOp = curChar;
          }
        }
      }

      if (lowOrder === this.UNDEFINED_ORDER) {
        if (bFoundSubExpression) {
          // The entire expression must be surrounded by
          // parentheses. Strip them away and re-process
          // this line.
          glob.assert(subLine[0].value === game.SkillCard.SUITS.COMBO_START &&
                      subLine[subLine.length - 1].value === game.SkillCard.SUITS.COMBO_END,
                      "Malformed subexpression in tree!");
          subLine[0].setDepth(curDepth + 1);
          subLine[subLine.length - 1].setDepth(curDepth + 1);
          subLine = glob.Util.subArray(subLine, 1, subLine.length - 2);
          node = this.treeFromLine(subLine, curDepth + 1, lastOrder);
        }
        else {
          // No operator found. Assume this is a value leaf node.
          curCard = subLine[0];
          curCard.setDepth(curDepth);

          node = new game.Operand({
            value: parseInt(subLine[0].stringVal()),
            card: curCard,
            depth: curDepth,
          });
        }
      }
      else {
        // Split the string at the lowest-order operator
        // and fill both sides with parsed results.
        leftSide = glob.Util.subArray(subLine, 0, iLowest - 1);
        rightSide = glob.Util.subArray(subLine, iLowest + 1);

        if (lowOrder > lastOrder) {
          curDepth += 1;
        }

        curCard = subLine[iLowest];
        glob.assert(curCard != null, "Invalid card during tree creation!");

        curCard.setDepth(curDepth);

        node = new game.Operator({
          operation: lowOp,
          card: curCard,
          depth: curDepth,
          leftNode: this.treeFromLine(leftSide, curDepth, lowOrder),
          rightNode: this.treeFromLine(rightSide, curDepth, lowOrder),
        });
      }

      return node;
    },

    expressionFromLine: function() {
      var eq = "",
          i = 0;

      if (this.bLineIsValid) {
        for (i=0; i<this.line.length; ++i) {
          eq += this.line[i].stringVal();
        }
      }

      return eq;
    },

    isLineValidExpression: function() {
      var i = 0,
          curChar = null,
          bLastWasPower = false,
          bLastWasSkill = false,
          bIsValid = true;

      for (i=0; bIsValid && i<this.line.length; ++i) {
        curChar = this.line[i].stringVal();
        if (curChar === game.Operator.OPEN_PARENTHESIS ||
            curChar === game.Operator.CLOSE_PARENTHESIS) {
          // We can just ignore parentheses in this case,
          // so there's nothing to do, here.
        }
        else if (this.line[i] instanceof game.SkillCard) {
          bIsValid = !bLastWasSkill;
          bLastWasPower = false;
          bLastWasSkill = true;
        }
        else if (this.line[i] instanceof game.PowerCard) {
          bIsValid = !bLastWasPower;
          bLastWasPower = true;
          bLastWasSkill = false;
        }
      }

      this.bLineIsValid = bIsValid;

      return bIsValid;
    },

    init: function(args) {
      // args:
      //   bounds
      //   rows

      this.bounds = args.bounds;
      this.rows = Math.floor(args.rows);
    },

    // Add parentheses to the operands on either side
    // of the given skillCard.
    promote: function(promotedCard, comboStartCard, comboEndCard) {
      return this.addParenthesesToLine(promotedCard, comboStartCard, comboEndCard);
    },

    setComboMode: function() {
      this.bComboMode = true;
    },

    clearComboMode: function() {
      this.bComboMode = false;
    },

    // Finds the skill card on the playfield that overlaps this card.
    // If mulitple cards overlap, returns a list plus the best candidate
    // as determined by overlap area.
    getOverlappedSkillCard: function(overlappingCard) {
      var i = 0,
          overlapRect = null,
          rOverlapBounds = overlappingCard.getBoundsRef(),
          bestOverlapArea = 0,
          testOverlapArea = 0,
          result = {overlaps: [], best: null};

      for (i=0; i<this.line.length; ++i) {
        if (this.line[i] !== overlappingCard &&
            this.line[i].isSkillCard() &&
            this.line[i].value < game.SkillCard.SUITS.COMBO_SKILL) {
          overlapRect = glob.Math.clip(this.line[i].treeBounds, rOverlapBounds);
          if (overlapRect) {
            result.overlaps.push(this.line[i]);

            testOverlapArea = overlapRect.w * overlapRect.h;
            if (testOverlapArea > bestOverlapArea) {
              bestOverlapArea = testOverlapArea;
              result.best = this.line[i];
            }
          }
        }
      }

      return result;
    },

    getInsertionIndeces: function(promotedCard) {
      // Find the promoted card in the line.
      var i = 0,
          startIndex = 0,
          leftIndex = -1,
          rightIndex = this.line.length,
          parenCount = 0,
          leftOrder = -1,
          rightOrder = -1,
          curOrder = promotedCard ? game.Operator.getSymbolExecOrder(promotedCard.stringVal()) : -1;
          bParenOnLeft = false,
          bParenOnRight = false,
          bInserted = false;

      for (i=0; i<this.line.length; ++i) {
        if (this.line[i] === promotedCard) {
          startIndex = i;
          break;
        }
      }

      // Look to the left for the first number not
      // enclosed in its own set of parentheses.
      for (i=startIndex-1; i>=0; --i) {
        if (this.line[i].isSkillCard()) {
          if (this.line[i].value === game.SkillCard.SUITS.COMBO_END) {
              parenCount -= 1;
          }
          else if (this.line[i].value === game.SkillCard.SUITS.COMBO_START) {
            parenCount += 1;
            if (parenCount === 0) {
              leftIndex = i;
              break;
            }
          }
        }
        else { // Power card
          if (parenCount === 0) {
            leftIndex = i;
            break;
          }
        }
      }

      // Look to the right for the first number
      // not enclosed in its own set of parentheses.
      for (i=startIndex+1; i<this.line.length; ++i) {
        if (this.line[i].isSkillCard()) {
          if (this.line[i].value === game.SkillCard.SUITS.COMBO_END) {
            parenCount -= 1;
            if (parenCount === 0) {
              rightIndex = i;
              break;
            }
          }
          else if (this.line[i].value === game.SkillCard.SUITS.COMBO_START) {
            parenCount += 1;
          }
        }
        else { // Power card
          if (parenCount === 0) {
            rightIndex = i;
            break;
          }
        }
      }

      bParenOnLeft = leftIndex > 0 &&
                     this.line[leftIndex - 1].isParenthesis() &&
                     this.line[leftIndex - 1].value === game.SkillCard.SUITS.COMBO_START;
      bParenOnRight = rightIndex < this.line.length - 1 &&
                      this.line[rightIndex + 1].isParenthesis() &&
                      this.line[rightIndex + 1].value === game.SkillCard.SUITS.COMBO_END;
      leftOrder = leftIndex > 0 ? game.Operator.getSymbolExecOrder(this.line[leftIndex - 1].stringVal()) : -1;
      rightOrder = rightIndex < this.line.length - 1 ? game.Operator.getSymbolExecOrder(this.line[rightIndex + 1].stringVal()) : -1;

      if (bParenOnLeft && bParenOnRight) {
        // Already surrounded by parentheses.
        leftIndex = -1;
        rightIndex = -1;
      }
      else if (leftOrder >= 0 && rightOrder >= 0 &&
               leftOrder < curOrder && curOrder >= rightOrder) {
        // No need for parentheses.
        leftIndex = -1;
        rightIndex = -1;
      }
      else if (leftIndex === 0 && rightIndex === this.line.length - 1) {
        // Parentheses bracket entire expression and therefore have
        // no effect.
        leftIndex = -1;
        rightIndex = -1;
      }

      this.insertionIndeces.left = leftIndex;
      this.insertionIndeces.right = rightIndex;

      return this.insertionIndeces;
    },

    addParenthesesToLine: function(promotedCard, comboStartCard, comboEndCard) {
      this.getInsertionIndeces(promotedCard);

      // Insert "combo start" and "combo end" cards.
      if (this.insertionIndeces.left >= 0 && this.insertionIndeces.right >= 0) {
        bInserted = this.insertIntoLine(comboStartCard,
                                        this.insertionIndeces.left,
                                        comboEndCard,
                                        this.insertionIndeces.right);
      }

      return bInserted;
    },

    canCombo: function(card) {
      var bCanCombo = false;

      if (card.isSkillCard() &&
          !card.isCombo() &&
          !card.isParenthesis()) {
        this.getInsertionIndeces(card);
        bCanCombo = this.insertionIndeces.left >= 0 &&
                    this.insertionIndeces.right >= 0;
      }

      return bCanCombo;
    },

    repositionCards: function() {
      var i = 0,
          card = null;

      for (i=0; i<this.line.length; ++i) {
        card = this.line[i];
        card.setPos(i * game.cardOffsetX(), // card.getBoundsRef().w,
                    Math.round(this.bounds.y + (this.rows - 1) * this.bounds.h / this.rows +
                    glob.Graphics.getHeight() / this.LAST_LINE_SPACER));
      }
    },

    insertIntoLine: function(leftCard, leftIndex, rightCard, rightIndex) {
      var bSuccess = false;

      glob.assert(this.line, "Invalid line in EquationGrid.addToLine!");
      glob.assert(leftCard != null && rightCard != null, "Can't insert null card into line!");
      glob.assert(leftIndex >= 0 && leftIndex <= this.line.length && rightIndex >= 0 && rightIndex <= this.line.length,
                  "Invalid insertion point!");

      leftCard = leftCard.createCopy();
      rightCard = rightCard.createCopy();

      this.line.splice(leftIndex, 0, leftCard);
      this.line.splice(rightIndex + 2, 0, rightCard);
      this.repositionCards();

      this.tree = this.buildTreeFromLine();
      bSuccess = this.bLineIsValid;

      if (!this.bLineIsValid) {
        this.line.splice(rightIndex + 2, 1);
        this.line.splice(leftIndex, 1);
        this.repositionCards();
      
        this.tree = this.buildTreeFromLine();
        glob.assert(this.bLineIsValid, "Couldn't reconstruct tree after bad promotion!");
      }

      return bSuccess;
    },

    addToLine: function(card) {
      glob.assert(this.line, "Invalid line in EquationGrid.addToLine!");
      glob.assert(card != null, "Can't add null card to line!");

      card.setPos(this.line.length * game.cardOffsetX(), // card.getBoundsRef().w,
                  Math.round(this.bounds.y + (this.rows - 1) * this.bounds.h / this.rows +
                  glob.Graphics.getHeight() / this.LAST_LINE_SPACER));
      this.line.push(card);

      this.tree = this.buildTreeFromLine();

      if (!this.bLineIsValid) {
        this.line.pop();
      }

      return this.bLineIsValid;
    },

    draw: function(ctxt) {
      var i = 0,
          rowHeight = Math.round(this.bounds.h / this.rows),
          heightOffset = 0,
          boundsRef = null,
          lastDepth = -1,
          colDelta = 0,
          colX = 0;
          rowY = 0;

      ctxt.strokeStyle = this.bLineIsValid ? "#444444" : "red";
      ctxt.lineWidth = 2;
      ctxt.beginPath();
      for (i=0; i<this.rows; ++i) {
        rowY = this.bounds.y + i * rowHeight;
        ctxt.moveTo(this.bounds.x, rowY);
        ctxt.lineTo(this.bounds.x + this.bounds.w, rowY);
      }
      ctxt.closePath();
      ctxt.stroke();

      for (i=0; i<this.line.length; ++i) {
        // Draw the tree element.
        if (!this.line[i].isParenthesis()) {
          heightOffset = rowHeight;
          if (this.line[i].getDepth() >= 0) {

            if (lastDepth >= 0) {
              if (lastDepth != this.line[i].getDepth()) {
                colX += boundsRef.w;
              }
              else {
                colX += game.cardOffsetX();
              }
            }

            boundsRef = this.line[i].getBoundsRef();
            colDelta = colX - boundsRef.x;
            this.line[i].setTreeOffset(colDelta, heightOffset);
            this.line[i].draw(ctxt);
            this.line[i].clearTreeOffset(colDelta, heightOffset);

            lastDepth = this.line[i].getDepth();
          }
        }

        // Draw the line element.
        // Since this version of the card is drawn last,
        // this is the version whose bounding rectangle
        // will be used for collision tests.
        heightOffset = 0;
        if (this.bComboMode &&
            this.canCombo(this.line[i])) {
          heightOffset += this.COMBO_HEIGHT_OFFSET;
        }
        this.line[i].setLineHeightOffset(heightOffset);
        this.line[i].draw(ctxt);
        this.line[i].clearLineHeightOffset(heightOffset);
      }
    },
  }
);
