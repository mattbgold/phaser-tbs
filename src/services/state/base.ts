import * as Phaser from 'phaser'
import Signal = Phaser.Signal;
import {injectable} from "inversify";

@injectable()
export abstract class BaseStateManager {
	private _cache: {[key:string]: any} = {};
	protected signals: {[key: number]: Signal} = {};

	//TODO: localStorage
	set(key: string, obj: any):void {
		this._cache[key] = obj;
	}
	get(key: string) {
		return this._cache[key];
	}

	subscribe(event: number, callback: Function): void {
		this._createSignalIfNew(event);
		this.signals[event].add(callback);
	}

	dispatch(event: number, payload: any = null): void {
		this._createSignalIfNew(event);
		this.signals[event].dispatch(payload);
	}

	private _createSignalIfNew(event: number): void {
		if (!this.signals[event])
			this.signals[event] = new Signal();
	}
}