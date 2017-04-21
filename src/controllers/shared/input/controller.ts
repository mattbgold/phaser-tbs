import * as Phaser from 'phaser';
import {injectable, inject} from "inversify";
import Game = Phaser.Game;
import Signal = Phaser.Signal;
import Point3 = Phaser.Plugin.Isometric.Point3;
import {BaseController} from "../../base";
import Key = Phaser.Key;
import {InputEvent, InputSubject} from "../../../services/subject/input";
import {GameConfig} from "../../../config";

@injectable()
export class InputController extends BaseController {
	private _isMouseDown: boolean;
	private _keyMap: {[key:number]: Key};
	
	constructor(
		private _game: Game, 
        private _inputSubject: InputSubject,
	    @inject('config') private _config: GameConfig
	) {
		super();
	}

	create() {
		this._game.input.mouse.capture = true;
		
		this._keyMap = {};
		for(let inputEvent in InputEvent) {
			let keyEvent = parseInt(inputEvent);
			let key = this._config.keyConfig[InputEvent[keyEvent]];
			if(!!key) {
				this._keyMap[keyEvent] = this._initKey(Phaser.Keyboard[key]);
			}
		}
	}

	update() {
		//record the position of the mouse in ISO projection
		this._game.iso.unproject(this._game.input.activePointer.position, this._inputSubject.cursorPos);

		//fire mouse events
		if(!this._isMouseDown && this._isMouseDownNow()) {
			this._isMouseDown = true;
			this._inputSubject.dispatch(InputEvent.MouseDown, this._inputSubject.cursorPos);
		} else if (this._isMouseDown && !this._isMouseDownNow()) {
			this._isMouseDown = false;
			this._inputSubject.dispatch(InputEvent.MouseUp, this._inputSubject.cursorPos);
			this._inputSubject.dispatch(InputEvent.Tap, this._inputSubject.cursorPos); //TODO: only tap if short time has passed and up pos is near down pos
		}

		for(let inputKeyEvent in this._keyMap) {
			let keyEvent = parseInt(inputKeyEvent);

			let key: Key = this._keyMap[keyEvent];
			if(!key.justDown && key.isDown) {
				this._inputSubject.dispatch(keyEvent);
			}
		}
	}
	
	private _initKey(keyCode: number): Key {
		let key = this._game.input.keyboard.addKey(keyCode);
		this._game.input.keyboard.addKeyCapture([keyCode]);
		
		return key;
	}

	private _isMouseDownNow(): boolean {
		return (this._game.input.activePointer.leftButton.isDown || this._game.input.activePointer.leftButton.isDown);
	}
}