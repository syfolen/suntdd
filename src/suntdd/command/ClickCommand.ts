
module suntdd {
    /**
     * 点击按钮
     * 说明：
     * 1. 按钮的点击会延时500毫秒执行
     */
    export class ClickCommand extends puremvc.SimpleCommand {

        execute(id: number): void {
            const cfg: IClickCfg = {
                id: id
            };
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.BUTTON_CLICK, cfg]);
        }
    }
}