
module test {

    export class TestButtonClass extends suntdd.TestCase {

        private $btn100: Laya.View = new Laya.View();
        private $btn101: Laya.View = new Laya.View();
        private $btn102: Laya.View = new Laya.View();

        protected $beforeAll(): void {
            this.$btn100.on(Laya.Event.CLICK, this, () => {
                console.log("click 100");
            })
            this.$btn101.on(Laya.Event.CLICK, this, () => {
                console.log("click 101");
            })
            this.$btn102.on(Laya.Event.CLICK, this, () => {
                console.log("click 102");
            })
            this.$click(100);
            this.$click(100);
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 1000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `reg button 100`);
                suntdd.Test.regButton(100, this.$btn100, false);
            }, this);

            this.$wait(4, suncom.Handler.create(this, () => {
                console.log("recv 4");
            }));
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 3000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `emit 4`);
                suntdd.Test.emit(4);
            }, this);

            this.$click(101);
            this.$click(102);
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 4000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `reg button 101`);
                suncom.Logger.log(suncom.DebugMode.NORMAL, `reg button 102`);
                suntdd.Test.regButton(102, this.$btn102, true);
                suntdd.Test.regButton(101, this.$btn101, true);
            }, this);

            this.$wait(5, suncom.Handler.create(this, () => {
                console.log("recv 5");
            }));
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 6000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `emit 5`);
                suntdd.Test.emit(5);
            }, this);
        }
    }
}