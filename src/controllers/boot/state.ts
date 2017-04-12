import * as Phaser from 'phaser';
import State = Phaser.State;
import Game = Phaser.Game;
import {GameStates} from "../../config";

export class BootState extends Phaser.State {
	constructor(private _game: Game) {
		super(_game);
	}

	preload() {
		//game engine settings
		this._game.time.advancedTiming = true;

		//plugins
		this._game.plugins.add(Phaser.Plugin.Isometric);

		//game settings
		this._game.iso.anchor.setTo(0.5, 0.2);
	}

	create() {
		this._game.state.start(GameStates.PRELOAD);
	}
}