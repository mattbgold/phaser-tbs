import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import Signal = Phaser.Signal;
import {BaseController} from "../../base";
import {SystemSubject} from "../../../services/subject/system";

@injectable()
export class SystemController extends BaseController {
	constructor(
		private _game: Game,
		private _systemSubject: SystemSubject
	) {
		super();
	}

	create() {
	}

	update() {
	}
}