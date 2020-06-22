

Laya.init(800, 600, Laya.WebGL);

setTimeout(() => {
    suncom.Global.debugMode = 0xFFFFFF;

    puremvc.Facade.getInstance().registerCommand(suncore.NotifyKey.START_TIMELINE, suncore.StartTimelineCommand);
    puremvc.Facade.getInstance().sendNotification(suncore.NotifyKey.START_TIMELINE, [suncore.ModuleEnum.SYSTEM, false]);

    suncom.DBService.put(-1, new suntdd.MicroService()).run();
    new test.TestInitClass(1);
}, 500);