
module suntdd {
    /**
     * 执行按钮点击
     */
    export class DoClickCommand extends puremvc.SimpleCommand {
        /**
         * 行为配置
         */
        private $click: IClickCfg = null;

        /**
         * 按钮配置
         */
        private $button: IButtonCfg = null;

        execute(click: IClickCfg): void {
            this.$click = click;
            this.$button = M.buttonMap[click.id] || null;
            suncom.Test.expect(this.$button).not.toBeNull();
            if (this.$button.once === true) {
                delete M.buttonMap[click.id];
            }
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 500, this.$doClick, this);
        }

        private $doClick(): void {
            const event: Laya.Event = new Laya.Event();
            event.setTo(Laya.Event.CLICK, this.$button.button, this.$button.button);
            this.$button.button.event(Laya.Event.CLICK, event);

            this.$click.done = true;
        }
    }
}