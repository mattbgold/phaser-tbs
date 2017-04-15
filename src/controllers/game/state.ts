import * as Phaser from 'phaser';
import State = Phaser.State;
import {BaseController} from "../base";
import Game = Phaser.Game;
import {GameConfig} from "../../config";
import {GameSubject, GameEvent} from "../../services/subject/game";

export class GameState extends Phaser.State {
	private _mapToLoad: string;
	
	constructor(
		private _game: Game, 
		private _controllers: BaseController[],
	    private _config: GameConfig,
	    private _gameSubject: GameSubject
	) {
		super(_game);
	}

	init(mapToLoad: string) {
		this._mapToLoad = mapToLoad;
	}

	preload() {
		this._game['isoGridGroup'] = this._game.add.group();
		this._game['isoUnitsGroup'] = this._game.add.group();

		//assets
		this._game.load.image("tile", "../../assets/images/cube.png");
		this._game.load.image('tile_water', '../../assets/images/cube.png');
		this._game.load.spritesheet('explosion', '../../assets/images/sprites/explosion.png',130, 130, 39);
		for(let name in this._config.units) {
		 	let asset = this._config.units[name].asset;
		 	this._game.load.image(`${asset}_0`, `../../assets/images/${asset}_0.png`);
		 	this._game.load.image(`${asset}_1`, `../../assets/images/${asset}_1.png`);
		 	this._game.load.image(`${asset}_2`, `../../assets/images/${asset}_2.png`);
		 	this._game.load.image(`${asset}_3`, `../../assets/images/${asset}_3.png`);
		 }
		
		this._controllers.forEach(_ => _.preload());
	}

	create() {
		this._gameSubject.dispatch(GameEvent.LoadMap, this._mapToLoad);
		this._controllers.forEach(_ => _.create());
	}

	update() {
		this._controllers.forEach(_ => _.update());
	}

	render() {
		this._controllers.forEach(_ => _.render());
	}
}