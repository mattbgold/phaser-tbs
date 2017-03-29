import * as Phaser from 'phaser';
import Game = Phaser.Game;
import Signal = Phaser.Signal;
import Point3 = Phaser.Plugin.Isometric.Point3;
import {BaseController} from "../base";

export class InputController extends BaseController {
	private _isDown: boolean;

	cursorPos: Point3 = new Point3();

	constructor(private _game: Game){
		super();
	}

	init() {
		// for(let i in [0,1,2,3]) {
		// 	this.subscribe(parseInt(i), _ => console.log(InputEvent[parseInt(i)], _));
		// }
	}

	update() {
		//record the position of the mouse in ISO projection
		this._game.iso.unproject(this._game.input.activePointer.position, this.cursorPos);

		//fire mouse events
		if(!this._isDown && this._isDownNow()) {
			this._isDown = true;
			this.signals[InputEvent.MouseDown].dispatch(this.cursorPos);
		} else if (this._isDown && !this._isDownNow()) {
			this._isDown = false;
			this.signals[InputEvent.MouseUp].dispatch(this.cursorPos);
			this.signals[InputEvent.Tap].dispatch(this.cursorPos); //TODO: only tap if short time has passed and up pos is near down pos
		}
	}

	private _isDownNow(): boolean {
		return (this._game.input.activePointer.leftButton.isDown || this._game.input.activePointer.leftButton.isDown);
	}
}

export enum InputEvent {
	MouseDown,
	MouseUp,
	Tap,
	DoubleTap
}