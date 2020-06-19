
module suntdd {
    /**
     * 注册按钮
     */
    export class RegButtonCommand extends puremvc.SimpleCommand {

        execute(id: number, button: any, once: boolean): void {
            suncom.Test.expect(button).anything();
            suncom.Test.expect(M.buttonMap[id]).toBeUndefined();

            const cfg: IButtonCfg = {
                button: button,
                once: once
            };
            M.buttonMap[id] = cfg;
        }
    }
}