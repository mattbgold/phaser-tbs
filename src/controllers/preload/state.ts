import * as Phaser from 'phaser';
import State = Phaser.State;
import {BaseController} from "../base";
import Game = Phaser.Game;
import {multiInject} from "inversify";
import {GameStates} from "../../config";

export class PreloadState extends Phaser.State {
	constructor(private _game: Game) {
		super(_game);
	}
	
	
	preload() {
		
	}

	create() {
		this._game.state.start(GameStates.TITLE);
	}

	update() {
		
	}

	render() {
		
	}
}