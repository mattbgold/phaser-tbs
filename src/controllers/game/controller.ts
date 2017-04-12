import * as Phaser from 'phaser'
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import {GameConfig} from "../../config";
import Signal = Phaser.Signal;
import {BaseController} from "../base";
import {IMapBuilder} from "../../services/map_builder/interface";
import {GameEvent, GameSubject} from "../../services/subject/game/service";
import {ContainerKeys} from "../../inversify.config";

@injectable()
export class GameController extends BaseController {
	constructor(
		private _game: Game,
		private _gameSubject: GameSubject,
		@inject(ContainerKeys.CONFIG) private _config: GameConfig,
		@inject(ContainerKeys.MAP_BUILDER) private _mapBuilder: IMapBuilder
	) {
		super();
	}

	preload() {
		this._gameSubject.subscribe(GameEvent.LoadMap, this._loadMap);
		this._gameSubject.subscribe(GameEvent.TurnComplete, this._onTurnComplete);
	}
	
	create() {
		this._game.stage.backgroundColor = '#aaccff';

		  for(let i in [0, 1, 2, 3, 4, 5, 6, 7 ,8 ,9, 10]) {
		  	this._gameSubject.subscribe(parseInt(i), _ => console.log(GameEvent[parseInt(i)], _));
		  }
	}
	
	render() {
		this._game.debug.text(this._game.time.fps || '--', 2, 14, "#a7aebe");
	}

	private _loadMap = (mapName: string): void => {
		this._mapBuilder.load(mapName);
		this._gameSubject.numberOfPlayers = 4; //TODO: fix this
	};
	
	private _onTurnComplete = (playerNum: number): void => {
		let nextPlayer =  playerNum === (this._gameSubject.numberOfPlayers - 1) ? 0 : (playerNum + 1);

		this._gameSubject.dispatch(GameEvent.TurnStart, nextPlayer);
	};
}