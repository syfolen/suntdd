
module test {

    export class TestWaitClass extends suntdd.TestCase {

        protected $beforeAll(): void {
            this.$wait(1);
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 1000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `emit 1`);
                suntdd.Test.emit(1);
            }, this);

            this.$wait(2, suncom.Handler.create(this, () => {
                console.log("recv 2");
            }));
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 2000, () => {
                suncom.Logger.log(suncom.DebugMode.NORMAL, `emit 2`);
                suntdd.Test.emit(2);
            }, this);

            this.$wait(3, suncom.Handler.create(this, () => {
                console.log("recv 3, once");
            }), false, true);
            this.$wait(3, suncom.Handler.create(this, (x: number, y: number) => {
                console.log("recv 3, x:" + x, ", y:" + y);
            }), false, false);
            this.$emit(3, void 0, 3000);
            this.$emit(3, [1, 2], 1000);
            this.$emit(3);
        }
    }
}