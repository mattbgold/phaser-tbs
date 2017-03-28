import * as Phaser from 'phaser';
import {Unit} from "../models/unit";
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

//TODO: make abstract
export class BaseUnit implements Unit {
	spr: IsoSprite;

	name: string;
	asset: string;

	x: number;
	y: number;

	//TODO: move to Stats model
	attack: number;
	defense: number;
	speed: number;
	hp:number;

	abilities: any[];
	
	constructor(model: Unit, spr: IsoSprite) {
		this.spr = spr;
		this.spr.anchor.set(.5, .7);
		
		this.init(model);
	}
	
	init(unit: Unit) {
		this.name = unit.name;
		this.asset = unit.asset;
		this.x = unit.x;
		this.y = unit.y;
		this.attack = unit.attack;
		this.defense = unit.defense;
		this.speed = unit.speed;
		this.hp = unit.hp;
		this.abilities = unit.abilities;
	}
	
	setXPosition(x): void {
		this.spr.scale.x = Math.sign(this.x - x);
		this.x = x;
	}
	setYPosition(y): void {
		this.spr.scale.x = Math.sign(y - this.y) || 1;
		this.y = y;
	}
}