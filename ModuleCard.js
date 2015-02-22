// Base functionality for all cards.

game.ModuleCard = {
  init: function(args) {
    // Panel args:
    //   parent
    //   spriteSheet
    //   frameIndex
    //   bDraggable
    //   x
    //   y
    //   mouseDelegate
    //   data
    //   onMouseDownSound
    //   onMouseUpSound
    //
    //   suit
    //   value

    this.panel = new glob.GUI.Panel(args);
    this.treeBounds = new glob.Math.rect2(0, 0, 0, 0);

    this.panel.unlistenForInput();
    this.panel.unlistenForUpdates();

    this.value = args.value;
    this.stack = args.stack;
    this.stackX = args.x;
    this.stackY = args.y;

    this.depth = -1;
  },

  setDepth: function(newDepth) {
    this.depth = newDepth;
  },

  setTreeOffset: function(colDelta, rowHeight) {
    var rBounds = this.panel.getBoundsRef();

    this.panel.setPos(rBounds.x + colDelta, rBounds.y - (rowHeight * (this.depth + 1)));

    // Not the most efficient technique to copy these bounds every
    // frame. Doesn't hurt with so few cards, but still...
    this.treeBounds.copyFrom(rBounds);
  },

  clearTreeOffset: function(colDelta, rowHeight) {
    var rBounds = this.panel.getBoundsRef();

    this.panel.setPos(rBounds.x - colDelta, rBounds.y + (rowHeight * (this.depth + 1)));
  },

  setLineHeightOffset: function(heightOffset) {
    var rBounds = this.panel.getBoundsRef();

    this.panel.setPos(rBounds.x, rBounds.y - heightOffset);

    this.treeBounds.copyFrom(rBounds);
  },

  clearLineHeightOffset: function(heightOffset) {
    var rBounds = this.panel.getBoundsRef();

    this.panel.setPos(rBounds.x, rBounds.y + heightOffset);

    this.treeBounds.copyFrom(rBounds);
  },

  getBoundsRef: function() {
    return this.panel ? this.panel.getBoundsRef() : null;
  },

  setPos: function(x, y) {
    glob.assert(this.panel, "Invalid panel in setPos");

    this.panel.setPos(x, y);
  },

  // Override!
  stringVal: function() {
    return "";
  },

  // Override!
  isSkillCard: function() {
    return true;
  },

  // Override!
  isCombo: function() {
    return false;
  },

  // Override!
  isParenthesis: function() {
    return false;
  },

  // Override!
  isVisible: function() {
    return this.panel.isVisible();
  },

  // Override!
  setVisible: function(bVisible) {
    if (bVisible) {
      this.panel.show();
    }
    else {
      this.panel.hide();
    }
  },

  intersectsCard: function(other) {
    return glob.Math.clip(this.treeBounds, other.treeBounds);
  },

  makeAutonomous: function() {
    glob.assert(this.panel, "Invalid panel in makeAutonomous!");

    this.panel.listenForUpdates();
    this.panel.listenForInput();
  },

  // Override this!
  createCopy: function() {
    return null;
  },

  returnToStack: function() {
    if (this.panel) {
      this.panel.setPos(this.stackX, this.stackY);
    }
  },

  draw: function(ctxt) {
    if (this.panel.isVisible()) {
      this.panel.draw(ctxt);
      this.onDraw(ctxt);
    }
  },

  onDraw: function(ctxt) {
    // Default: do nothing.
  },

  mouseDown: function(x, y) {
    return this.panel ? this.panel.mouseDown(x, y) : false;
  },

  mouseDrag: function(x, y) {
    return this.panel ? this.panel.mouseDrag(x, y) : false;
  },

  mouseUp: function(x, y) {
    return this.panel ? this.panel.mouseUp(x, y) : false;
  },
};
