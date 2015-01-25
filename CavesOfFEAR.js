// Testbed for the mathematics gameplay in CavesOfFEAR.

// TODO:
// Cards
// EquationTree
//   Operator Node
//   Operand Node
// PlayDemo state

game = {
  res: {font: null,
        numFont: null,
        powerCards: null,
        skillCards: null,
        
      },

    spriteSheets: { powerCards: null,
                    skillCards: null,
                  },

    CARD_TYPE: {NONE: 0, SKILL: 1, POWER: 2},

    bFirstSession: true,
};

game.COF = new glob.NewGlobType(
  // Class Definitions --------------------------------------------------------
  {
    TITLE_FONT_SIZE: 100,
    TITLE_OPTION_SIZE: 33,
  },
  [
  // Instance Definitions -----------------------------------------------------
    glob.GameState.stateMachine,
    glob.Transitions.InLinear,
    glob.Transitions.OutLinear,

    {
      init: function() {
        // Request some resources.
        // game.res.font = glob.Resources.loadFont("res/VTCGoblinHandSC.ttf", "moonshadow");
        // game.res.numFont = glob.Resources.loadFont("res/VTCGoblinHandSC.ttf", "moonshadow");
        // game.res.numFont = glob.Resources.loadFont("res/moonshadow.ttf", "moonshadow");
        game.res.font = glob.Resources.loadFont("res/moonshadow.ttf", "moonshadow");
        game.res.numFont = game.res.font;
        game.res.powerCards = glob.Resources.loadImage("res/powerCards.png");
        game.res.skillCards = glob.Resources.loadImage("res/skillCards.png");

        // Start resource download.
        glob.Resources.EZstartDownloadState(this, this.titleState);

        this.menuLabels = { title: null,
                            startDemo: null
                          };

        this.bFirstPlay = true;
        this.transTimer = 0;

        glob.Messenger.addListener(this);
      },

      // Title State ----------------------------------------------
      titleState: {
        enter: function() {
          if (this.bFirstPlay) {
            this.setUpGame();
          }

          this.registerMenu();
        },

        exit: function() {
          this.deregisterMenu();
        },

        update: function(dt) {
          for (key in this.menuLabels) {
            if (this.menuLabels[key]) {
              this.menuLabels[key].update(dt);
            }
          }
        },

        draw: function(ctxt) {
          var key = null,
              alpha = glob.Graphics.getGlobalAlpha();

          glob.Graphics.setGlobalAlpha(1.0);

          glob.Graphics.clearTo(glob.Graphics.BLACK);

          glob.Graphics.setGlobalAlpha(alpha);

          for (key in this.menuLabels) {
            if (this.menuLabels[key]) {
              this.menuLabels[key].draw(ctxt);
            }
          }
        },

        onStartDemo: function() {
          // this.startTransOutLinear(this.startSoloSession, this.transOutDraw.bind(this), this.transOutUpdate.bind(this), game.COF.TRANSITION_PERIOD, true);
        },
      },

      // Implementation =======================================================
      registerMenu: function() {
        for (key in this.menuLabels) {
          if (this.menuLabels[key]) {
            this.menuLabels[key].listenForInput();
          }
        }
      },

      deregisterMenu: function() {
        glob.GUI.flushAll();
      },

      // Transition Management ------------------------------------------------
      transOutDraw: function(ctxt) {
        glob.Graphics.setGlobalAlpha(this.transParam);
        this.titleState.draw.call(this, ctxt);
        glob.Graphics.setGlobalAlpha(1.0);
      },

      transOutUpdate: function(dt) {
        glob.Graphics.setScreenOffset(0, Math.round(-glob.Graphics.getHeight() * (1.0 - this.transParam)));
      },

      transInDraw: function(ctxt) {
        glob.Graphics.setGlobalAlpha(this.transParam);
        this.titleState.draw.call(this, ctxt);
        glob.Graphics.setGlobalAlpha(1.0);
      },

      transInUpdate: function(dt) {
        glob.Graphics.setScreenOffset(0, Math.round(glob.Graphics.getHeight() * (1.0 - this.transParam)));
      },

      startSoloSession: function() {
        this.setState(null);
        this.currentSession = new game.Session(this);
      },

      setUpGame: function() {
        var args = null;

        this.bFirstPlay = false;

        args = {
                  x: glob.Graphics.getWidth() / 2,
                  y: glob.Graphics.getHeight() / 2 - 4 * game.COF.TITLE_FONT_SIZE / 2,
                  font: game.res.font,
                  fontSize: game.COF.TITLE_FONT_SIZE,
                  text: game.Strings.TITLE,
                  activeColor: glob.Graphics.GRAY,
                  selectedColor: glob.Graphics.YELLOW,
                  onClickedCallback: null,
                  hAlign: 0.5,
                  vAlign: 0.5,
                  parent: this,
                };
        this.menuLabels.Title = new glob.GUI.Label(args);

        args.activeColor = glob.Graphics.WHITE;
        args.fontSize = game.COF.TITLE_OPTION_SIZE;

        args.y += 4 / 2 * game.COF.TITLE_FONT_SIZE;
        args.text = game.Strings.OPT_START_DEMO;
        args.onClickedCallback = this.titleState.onStartDemo.bind(this);
        this.menuLabels.soloGame = new glob.GUI.Label(args);

        game.spriteSheets.powerCards = new glob.SpriteSheetGlob(game.res.powerCards, 1, 10);
        game.spriteSheets.skillCards = new glob.SpriteSheetGlob(game.res.skillCards, 1, 4);
      },
    },
  ]
);

// Create the game ////////////////////////////////////////////////////////////
var caves = new game.COF();


