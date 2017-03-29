import * as Phaser from 'phaser';
import {Controller} from "../interface";
import Game = Phaser.Game;
import Signal = Phaser.Signal;
import Point3 = Phaser.Plugin.Isometric.Point3;

export class InputController implements Controller {
	private _isDown: boolean;
	private _isUp: boolean;

	cursorPos: Point3 = new Point3();
	signals: {[key: number]: Signal};

	constructor(private _game: Game){
		this.signals = {};
	}

	init() {

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

	subscribe(event: InputEvent, callback: Function) {
		if (!this.signals[event])
			this.signals[event] = new Signal();

		this.signals[event].add(callback);
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