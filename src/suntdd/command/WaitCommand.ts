
module suntdd {
    /**
     * 等待信号
     */
    export class WaitCommand extends puremvc.SimpleCommand {

        /**
         * @line: 是否进入队列
         * @once: 是否只响应一次
         */
        execute(id: number, handler: suncom.IHandler, line: boolean, once: boolean): void {
            const cfg: IWaitCfg = {
                id: id,
                handler: handler,
                line: line,
                once: once
            };
            if (line === true) {
                this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.SIGNAL_WAIT, cfg]);
            }
            else {
                this.facade.sendNotification(NotifyKey.ADD_WAIT, cfg);
            }
        }
    }
}