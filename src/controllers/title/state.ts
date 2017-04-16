import * as Phaser from 'phaser';
import State = Phaser.State;
import {BaseController} from "../base";
import Game = Phaser.Game;
import {GameStates} from "../../config";

export class TitleState extends Phaser.State {
	constructor(private _game: Game, private _controllers: BaseController[]) {
		super(_game);
	}
	
	preload() {
		this._controllers.forEach(_ => _.preload());
	}
	
	create() {
		this._controllers.forEach(_ => _.create());
		
		//TODO: temp hack to start the game immediately
		this._game.state.start(GameStates.GAME, false, false, 'demo3');
	}
	
	update() {
		this._controllers.forEach(_ => _.update());
	}
	
	render() {
		this._controllers.forEach(_ => _.render());
	}
}