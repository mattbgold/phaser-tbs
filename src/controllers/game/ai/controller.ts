import * as Phaser from 'phaser'
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import Game = Phaser.Game;
import {inject} from "inversify";
import {GameStateManager} from "../../../services/state/game/service";
import {InputStateManager} from "../../../services/state/input/service";

export class AIController extends BaseController {
	constructor(
		private _game: Game,
		private _gameState: GameStateManager,
		private _inputState: InputStateManager,
		@inject('config') private _config: GameConfig
	) {
		super();
	}

	init() {

	}

	update() {

	}

	render() {

	}
}
