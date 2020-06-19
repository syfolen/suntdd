
module suntdd {
    /**
     * 发射信号
     */
    export class EmitCommand extends puremvc.SimpleCommand {

        /**
         * @line: 是否进入队列
         * @delay: 信号发射延时
         */
        execute(id: number, args: any, line: boolean, delay: number): void {
            const cfg: IEmitCfg = {
                id: id,
                args: args,
                line: line,
                delay: delay
            };
            if (line === false) {
                this.facade.sendNotification(NotifyKey.DO_EMIT, cfg);
            }
            else {
                this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.SIGNAL_EMIT, cfg]);
            }
        }
    }
}