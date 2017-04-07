import "reflect-metadata";

import {Container, interfaces} from 'inversify';
import {UnitController} from "./controllers/game/unit/controller";
import {GridController} from "./controllers/game/grid/controller";
import {ContextMenuController} from "./controllers/game/contextmenu/controller";
import {GameController} from "./controllers/game/controller";
import {InputController} from "./controllers/input/controller";
import {BaseController} from "./controllers/base";
import {GameConfig, getConfig} from "./config";
import {IMapBuilder} from "./services/map_builder/interface";
import {MapBuilder} from "./services/map_builder/service";
import Factory = interfaces.Factory;
import {ArmyCommandStrategyFactory} from "./services/army_command_strategy/factory/service";
import {IArmyCommandStrategyFactory} from "./services/army_command_strategy/factory/interface";
import {GameStateManager} from "./services/state/game/service";
import {InputStateManager} from "./services/state/input/service";
import {AIController} from "./controllers/game/ai/controller";

let container = new Container();

container.bind<GameConfig>('config').toConstantValue(getConfig());

container.bind<InputController>(InputController).toSelf().inSingletonScope();
container.bind<GameController>(GameController).toSelf().inSingletonScope();
container.bind<ContextMenuController>(ContextMenuController).toSelf().inSingletonScope();
container.bind<GridController>(GridController).toSelf().inSingletonScope();
container.bind<UnitController>(UnitController).toSelf().inSingletonScope();
container.bind<AIController>(AIController).toSelf().inSingletonScope();

container.bind<GameStateManager>(GameStateManager).toSelf().inSingletonScope();
container.bind<InputStateManager>(InputStateManager).toSelf().inSingletonScope();

container.bind<IMapBuilder>('IMapBuilder').to(MapBuilder).inSingletonScope();

container.bind<IArmyCommandStrategyFactory>('IArmyCommandStrategyFactory').to(ArmyCommandStrategyFactory).inSingletonScope();

container.bind<Factory<BaseController[]>>('controllers').toFactory<BaseController[]>((context: interfaces.Context) => {
	return () => [
		// the order of the controllers here determines the order in which init(), update(), etc... runs for the entire game
		context.container.get<InputController>(InputController),
		context.container.get<GameController>(GameController),
		context.container.get<ContextMenuController>(ContextMenuController),
		context.container.get<GridController>(GridController),
		context.container.get<UnitController>(UnitController),
		context.container.get<AIController>(AIController)
	];
});

export default container;