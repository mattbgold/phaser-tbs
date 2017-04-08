import {injectable} from "inversify";
import * as Phaser from 'phaser';
import Signal = Phaser.Signal;

@injectable()
export abstract class BaseController {
	preload(): void { }
	create(): void { }	
	update(): void { }
	render(): void { }
}