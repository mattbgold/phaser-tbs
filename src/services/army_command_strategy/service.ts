import * as Phaser from 'phaser';
import {IArmyCommandStrategy} from "./interface";
import {GameController} from "../../controllers/game/controller";
import Game = Phaser.Game;
import {GameStateManager} from "../state/game/service";

export class ArmyCommandStrategy implements IArmyCommandStrategy {
	constructor(
		private _playerNum: number, 
		private _gameState: GameStateManager
	) {
	
	}
	
	executeTurn() {
		
	};
}