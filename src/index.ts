import "reflect-metadata";
import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import 'phaser-plugin-isometric/dist/phaser-plugin-isometric';
import Group = Phaser.Group;
import {GameConfig, getConfig, GameStates} from "./config";
import {UnitController} from "./controllers/game/unit/controller";
import {BaseController} from "./controllers/base";
import container from './inversify.config';
import Game = Phaser.Game;
import {BootState} from "./controllers/boot/state";
import {TitleState} from "./controllers/title/state";
import {PreloadState} from "./controllers/preload/state";
import {ContainerKeys} from "./inversify.config";
import {GameState} from "./controllers/game/state";
import {SystemSubject} from "./services/subject/system/service";
import {GameSubject} from "./services/subject/game/service";

class TbsGame {
  game: Phaser.Game;

  constructor() {
    this.game = new Phaser.Game(960, 640, Phaser.AUTO, "content", this);

    container.bind<Game>(Game).toConstantValue(this.game);
    
    this.game.state.add(GameStates.BOOT , new BootState(this.game));
    this.game.state.add(GameStates.PRELOAD, new PreloadState(this.game));
    this.game.state.add(GameStates.TITLE, new TitleState(this.game, container.getAll<BaseController>(ContainerKeys.CTRL_TITLE)));
    this.game.state.add(GameStates.GAME, new GameState(
        this.game, 
        container.getAll<BaseController>(ContainerKeys.CTRL_GAME), 
        container.get<GameConfig>(ContainerKeys.CONFIG),
        container.get<GameSubject>(GameSubject)
    ));
    
    //start the game!
    this.game.state.start(GameStates.BOOT);
  }
}

window.onload = () => {
  const game = new TbsGame();
};