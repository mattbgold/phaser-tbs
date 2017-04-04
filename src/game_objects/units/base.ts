import * as Phaser from 'phaser';;
import Sprite = Phaser.Sprite;
import Game = Phaser.Game;
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
import {Stats} from "../../models/stats";
import {Unit} from "../../models/unit";

export abstract class BaseUnit implements Unit {
	spr: IsoSprite;

	name: string;
	asset: string;

	belongsToPlayer: number;

	x: number;
	y: number;

	hp: number;

	stats: Stats;

	abilities: any[];
	
	constructor(model: Unit, spr: IsoSprite) {
		this.spr = spr;
		this.spr.anchor.set(.5, .5);
		
		this.init(model);
	}
	
	init(unit: Unit) {
		this.name = unit.name;
		this.asset = unit.asset;
		this.belongsToPlayer = unit.belongsToPlayer;
		this.x = unit.x;
		this.y = unit.y;
		this.stats = unit.stats;
		this.abilities = unit.abilities;

		this.hp = unit.stats.hp;
	}
	
	setXPosition(x): void {
		let sign = Math.sign(this.x - x);
		if (sign !== 0)
			this.spr.scale.x = sign;
		this.x = x;
	}
	setYPosition(y): void {
		let sign = Math.sign(y - this.y);
		if (sign !== 0)
			this.spr.scale.x = sign;
		this.y = y;
	}

	pointToUnit(other: BaseUnit): void {
		let sign = Math.sign(this.spr.x - other.spr.x);
		if (sign !== 0)
			this.spr.scale.x = sign;
	}

	get isDead(): boolean {
		return this.hp <= 0;
	}
}