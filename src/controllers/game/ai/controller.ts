import * as Phaser from 'phaser'
import {BaseController} from "../../base";
import {GameConfig} from "../../../config";
import {InputController} from "../../input/controller";
import {GameController} from "../controller";
import Game = Phaser.Game;
import {inject} from "inversify";

export class AIController extends BaseController {
	constructor(
		private _game: Game,
		private _ctrl: GameController,
		private _input: InputController,
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
