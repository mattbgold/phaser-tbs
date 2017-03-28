import * as Phaser from 'phaser'
import Game = Phaser.Game;
import {GameConfig} from "../../config";

export class GameController {
	game: Game;
	state: any; //global state obj accessible to other controllers
	config: GameConfig;

	constructor(game:Game, config: GameConfig) {
		this.config = config;
		this.game = game;
	}
}