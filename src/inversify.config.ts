import "reflect-metadata";

import {Container, interfaces} from 'inversify';
import {UnitController} from "./controllers/game/unit/controller";
import {GridController} from "./controllers/game/grid/controller";
import {ContextMenuController} from "./controllers/game/contextmenu/controller";
import {GameController} from "./controllers/game/controller";
import {InputController} from "./controllers/input/controller";
import {BaseController} from "./controllers/base";
import {GameConfig, getConfig} from "./config";
import Factory = interfaces.Factory;
import {ArmyBuilder} from "./services/army_builder";

let container = new Container();

container.bind<GameConfig>('config').toConstantValue(getConfig());

container.bind<UnitController>(UnitController).toSelf().inSingletonScope();
container.bind<GridController>(GridController).toSelf().inSingletonScope();
container.bind<ContextMenuController>(ContextMenuController).toSelf().inSingletonScope();
container.bind<GameController>(GameController).toSelf().inSingletonScope();
container.bind<InputController>(InputController).toSelf().inSingletonScope();

container.bind<ArmyBuilder>(ArmyBuilder).toSelf().inSingletonScope();

container.bind<Factory<BaseController[]>>('controllers').toFactory<BaseController[]>((context: interfaces.Context) => {
	return () => [
			context.container.get<UnitController>(UnitController),
			context.container.get<GridController>(GridController),
			context.container.get<ContextMenuController>(ContextMenuController),
			context.container.get<GameController>(GameController),
			context.container.get<InputController>(InputController)
		]
});

export default container;