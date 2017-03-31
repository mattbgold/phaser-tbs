import * as Phaser from 'phaser'
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import {GameConfig} from "../../config";
import Signal = Phaser.Signal;
import {BaseController} from "../base";

@injectable()
export class GameController extends BaseController {
	game: Game;
	config: GameConfig;

	private _cache: {[key:string]: any} = {};
	
	constructor(game:Game, @inject('config')config: GameConfig) {
		super();
		
		this.config = config;
		this.game = game;
		
		for(let i in [0,1,2,3,4, 5, 6, 7, 8]) {
			this.subscribe(parseInt(i), _ => console.log(GameEvent[parseInt(i)], _));
		}
	}

	init(){ }

	update() {
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