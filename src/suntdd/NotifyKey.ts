
module suntdd {
    /**
     * 消息枚举
     */
    export namespace NotifyKey {
        /**
         * 发射信号 { id: number, args: any, line: boolean, delay: number }
         * @line: 是否进入队列
         */
        export const EMIT: string = "suntdd.NotifyKey.EMIT";

        /**
         * 等待信号 { id: number, handler: suncom.IHandler, line: boolean, once: boolean }
         * @line: 是否进入队列
         */
        export const WAIT: string = "suntdd.NotifyKey.WAIT";

        /**
         * 取消事件 { id: number }
         * 说明：
         * 1. 详见 TestCase.cancel() 注释
         */
        export const CANCEL: string = "suntdd.NotifyKey.CANCEL";

        /**
         * 点击按钮
         */
        export const CLICK: string = "suntdd.NotifyKey.CLICK";

        /**
         * 注册按钮
         */
        export const REG_BUTTON: string = "suntdd.NotifyKey.REG_BUTTON";
    }
}