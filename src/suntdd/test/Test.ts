
module suntdd {
    /**
     * 测试类
     */
    export namespace Test {

        /**
         * 发射信号
         * @delay: 信号发射延时
         */
        export function emit(id: number, args?: any, delay: number = 0): void {
            puremvc.Facade.getInstance().sendNotification(NotifyKey.EMIT, [id, args, false, delay]);
        }

        /**
         * 注册按钮
         * @once: 是否为一次性的按钮，默认为：true
         * 说明：
         * 1. 通过 TestCase.cancel() 方法可以取消按钮的注册
         */
        export function regButton(id: number, button: any, once: boolean = true): void {
            puremvc.Facade.getInstance().sendNotification(NotifyKey.REG_BUTTON, [id, button, once]);
        }
    }
}