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
    this.config = container.get<GameConfig>('config');
    this.controllers = <BaseController[]>factory();
  }

  preload () {
    //assets
    this.game.load.image("tile", "./assets/images/cube.png");
    this.game.load.spritesheet('explosion', './assets/images/sprites/explosion.png',130, 130, 39);
    for(let name in this.config.units) {
      let asset = this.config.units[name].asset;
      this.game.load.image(`${asset}_0`, `./assets/images/${asset}_0.png`);
      this.game.load.image(`${asset}_1`, `./assets/images/${asset}_1.png`);
      this.game.load.image(`${asset}_2`, `./assets/images/${asset}_2.png`);
      this.game.load.image(`${asset}_3`, `./assets/images/${asset}_3.png`);
    }

    //game engine settings
    this.game.time.advancedTiming = true;

    //plugins
    this.game.plugins.add(Phaser.Plugin.Isometric);

    //game settings
    this.game.iso.anchor.setTo(0.5, 0.2);
    //TODO: move to controller preload()
    this.game['isoGridGroup'] = this.game.add.group();
    this.game['isoUnitsGroup'] = this.game.add.group();
  }

  create() {
    this.game.stage.backgroundColor = '#aaccff';

    this.controllers.forEach(_ => _.init());
  }

  render() {
    this.controllers.forEach(_ => _.render());
  }

  update() {
    this.controllers.forEach(_ => _.update());
  }
}

window.onload = () => {
  const game = new TbsGame();
};