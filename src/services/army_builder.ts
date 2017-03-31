import {Unit} from "../models/unit";
import {GameConfig} from "../config";
import {BaseUnit} from "../game_objects/units/base";
import {ScoutUnit} from "../game_objects/units/scout";
import {AssaultUnit} from "../game_objects/units/assault";
import {TankUnit} from "../game_objects/units/tank";

export class ArmyBuilder {
	private _units: Unit[];

	//this class is used to build armies in the army selection phase, then used to get the list of units to put into the grid.
	// also used to place units in that begin phase
	constructor(private _config: GameConfig) {
		this._units = [];
	}

	add(unit: Unit) {
		this._units.push(unit);
	}
	
	remove(unit: Unit) {
		this._units.splice(this._units.map(x => x.name).indexOf(unit.name), 1);
	}

	getList(): Unit[] {
		return this._units;
	}

	build() {
		
	}
}

