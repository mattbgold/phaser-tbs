import * as Phaser from 'phaser';
import {injectable} from "inversify";
import Game = Phaser.Game;
import Signal = Phaser.Signal;
import Point3 = Phaser.Plugin.Isometric.Point3;
import {BaseController} from "../base";
import Key = Phaser.Key;

@injectable()
export class InputController extends BaseController {
	private _isMouseDown: boolean;
	private _attackKey: Key; //TODO: move all shortcut keys to a map
	private _isAttackKeyDown: boolean;

	cursorPos: Point3 = new Point3();

	constructor(private _game: Game){
		super();
	}

	init() {
		 // for(let i in [0,1,2,3]) {
		 // 	this.subscribe(parseInt(i), _ => console.log(InputEvent[parseInt(i)], _));
		 // }
		this._attackKey = this._initKey(Phaser.Keyboard.A);
	}

	update() {
		//record the position of the mouse in ISO projection
		this._game.iso.unproject(this._game.input.activePointer.position, this.cursorPos);

		//fire mouse events
		if(!this._isMouseDown && this._isMouseDownNow()) {
			this._isMouseDown = true;
			this.dispatch(InputEvent.MouseDown, this.cursorPos);
		} else if (this._isMouseDown && !this._isMouseDownNow()) {
			this._isMouseDown = false;
			this.dispatch(InputEvent.MouseUp, this.cursorPos);
			this.dispatch(InputEvent.Tap, this.cursorPos); //TODO: only tap if short time has passed and up pos is near down pos
		}

		//attack key event
		if(!this._isAttackKeyDown && this._attackKey.isDown) {
			this._isAttackKeyDown = true;
			this.dispatch(InputEvent.KeyAttack);
		} else if (this._isAttackKeyDown && !this._attackKey.isDown) {
			this._isAttackKeyDown = false;
		}
	}

	private _initKey(keyCode: number): Key {
		let key = this._game.input.keyboard.addKey(keyCode);
		this._game.input.keyboard.addKeyCapture([keyCode])

		return key;
	}

	private _isMouseDownNow(): boolean {
		return (this._game.input.activePointer.leftButton.isDown || this._game.input.activePointer.leftButton.isDown);
	}
}

export enum InputEvent {
	MouseDown,
	MouseUp,
	Tap,
	DoubleTap,

	KeyAttack
}