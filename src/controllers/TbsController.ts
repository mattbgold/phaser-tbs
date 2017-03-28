import * as Phaser from 'phaser'
import Game = Phaser.Game;

export class TbsController {
	gridSize: number;
	game: Game;

	constructor(gridSize: number, game:Game) {
		this.gridSize = gridSize;
		this.game = game;
	}
}