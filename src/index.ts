import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import 'phaser-plugin-isometric/dist/phaser-plugin-isometric';
import Group = Phaser.Group;
import {BaseUnit} from "./game_objects/unit";
import {GameController} from "./controllers/game/controller";
import {GameConfig, getConfig} from "./config";
import {UnitController} from "./controllers/game/unit/controller";
import {GridController} from "./controllers/game/grid/controller";

class TbsGame {
  game: Phaser.Game;
  controller: GameController;
  cursorPos: any;
  isoGroup: Group;
  unit: BaseUnit; //TODO: remove me
  config: GameConfig;
  unitController: UnitController;
  gridController: GridController;

  constructor() {
    this.game = new Phaser.Game(960, 640, Phaser.AUTO, "content", this);
    this.config = getConfig();
    let ctrl = new GameController(this.game, this.config);
    this.unitController = new UnitController(ctrl);
    this.gridController = new GridController(ctrl);
  }

  preload () {
    //assets
    this.game.load.image("tile", "./assets/images/cube.png");
    this.game.load.image("unit", "./assets/images/unit.png");

    //game engine settings
    this.game.time.advancedTiming = true;

    //plugins
    this.game.plugins.add(Phaser.Plugin.Isometric);

    //game settings
    this.game.iso.anchor.setTo(0.5, 0.2);
  }

  create() {
    this.game.input.mouse.capture = true;
    // Create a group for our tiles.
    this.isoGroup = this.game.add.group();

    // Let's make a load of tiles on a grid.
    this.gridController.init();

    this.spawnUnits();

    // Provide a 3D position for the cursor
    this.cursorPos = new Phaser.Plugin.Isometric.Point3();
  }

  render() {
    this.game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#a7aebe");
  }

  update() {
    // Update the cursor position.
    // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
    // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

    // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
    this.isoGroup.forEach(tile =>  {
      var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
      // If it does, do a little animation and tint change.
      if (!tile.hover && inBounds) {
        tile.hover = true;
        tile.tint = 0x86bfda;
        this.game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);

        if(this.game.input.activePointer.leftButton.isDown) {
          this.unitController.move(this.unit, tile.isoX/this.config.cellSize, tile.isoY/this.config.cellSize);
        }
      }
      // If not, revert back to how it was.
      else if (tile.hover && !inBounds) {
        tile.hover = false;
        tile.tint = 0xffffff;
        this.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }
    });
  }

  private spawnUnits(): void {
    this.unit = this.unitController.create({
      name: 'test',
      asset: 'unit',
      x: 4,
      y: 8
    });
  }
}

window.onload = () => {
  const game = new TbsGame();
};