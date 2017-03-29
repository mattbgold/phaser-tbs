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
import {Controller} from "./controllers/interface";
import {InputController} from "./controllers/input/controller";

class TbsGame {
  game: Phaser.Game;
  controllers: Controller[] = [];
  unit: BaseUnit; //TODO: remove me
  config: GameConfig;

  constructor() {
    this.game = new Phaser.Game(960, 640, Phaser.AUTO, "content", this);
    this.config = getConfig();
    let ctrl = new GameController(this.game, this.config);
    let input = new InputController(this.game);
    this.controllers.push(ctrl);
    this.controllers.push(new UnitController(ctrl, input));
    this.controllers.push(new GridController(ctrl, input));
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

    this.controllers.forEach(_ => _.init());

    this.spawnUnits();
  }

  render() {
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#a7aebe");
  }

  update() {
    this.controllers.forEach(_ => _.update());
  }

  //TODO: delete me
  private spawnUnits(): void {
    var unitController = <UnitController>(this.controllers.find(c => c instanceof UnitController));
    this.unit = unitController.createUnit({
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