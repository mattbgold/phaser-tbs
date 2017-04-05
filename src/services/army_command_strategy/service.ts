import * as Phaser from 'phaser';
import {IArmyCommandStrategy} from "./interface";
import {GameController} from "../../controllers/game/controller";
import Game = Phaser.Game;

export class ArmyCommandStrategy implements IArmyCommandStrategy {
	constructor(private _playerNum: number, private _game: Game) {
	}
	
	executeTurn() {
		
	};
}