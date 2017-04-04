import * as Phaser from 'phaser'
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import {GameConfig} from "../../config";
import Signal = Phaser.Signal;
import {BaseController} from "../base";
import {IMapBuilder} from "../../services/map_builder/interface";

@injectable()
export class GameController extends BaseController {
	private _cache: {[key:string]: any} = {};

	constructor(
		private _game: Game,
		@inject('config') private _config: GameConfig,
		@inject('IMapBuilder') private _mapBuilder: IMapBuilder
	) {
		super();
	}

	init() {
		  for(let i in [0,1,2,3,4, 5, 6, 7, 8]) {
		  	this.subscribe(parseInt(i), _ => console.log(GameEvent[parseInt(i)], _));
		  }
		
		this._mapBuilder.load('demo');
	}

	update() {
	}
	
	render() {
		this._game.debug.text(this._game.time.fps || '--', 2, 14, "#a7aebe");
	}
	
	set(key: string, obj: any):void {
		this._cache[key] = obj;
	}
	get(key: string) {
		return this._cache[key];
	}
}

export enum GameEvent {
	GridCellActivated,
	UnitSelected,
	UnitMoveActionSelected,
	UnitMove,
	UnitMoveCompleted,
	UnitAttackActionSelected,
	UnitAttack,
	UnitAttackCompleted,
	CancelAction
}