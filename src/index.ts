import "reflect-metadata";
import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import 'phaser-plugin-isometric/dist/phaser-plugin-isometric';
import Group = Phaser.Group;
import {GameConfig, getConfig} from "./config";
import {UnitController} from "./controllers/game/unit/controller";
import {BaseController} from "./controllers/base";
import container from './inversify.config';
import Game = Phaser.Game;
import {interfaces} from 'inversify';
import Factory = interfaces.Factory;

class TbsGame {
  game: Phaser.Game;
  controllers: BaseController[] = [];
  config: GameConfig;

  constructor() {
    this.game = new Phaser.Game(960, 640, Phaser.AUTO, "content", this);

    container.bind<Game>(Game).toConstantValue(this.game);

    let factory = container.get<Factory<BaseController[]>>('controllers');
    this.controllers = <BaseController[]>factory();
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

    this._spawnUnits();
  }

  render() {
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#a7aebe");
  }

  update() {
    this.controllers.forEach(_ => _.update());
  }

  //TODO: delete me at some point
  private _spawnUnits(): void {
    var unitController = <UnitController>(this.controllers.find(c => c instanceof UnitController));
    let config = getConfig();
    unitController.loadUnits(config.army.map(x => config.units[x]));
  }
}

window.onload = () => {
  const game = new TbsGame();
};