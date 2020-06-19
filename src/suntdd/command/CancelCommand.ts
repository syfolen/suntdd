
module suntdd {
    /**
     * 详见 TestCase.cancel() 注释
     */
    export class CancelCommand extends puremvc.SimpleCommand {

        execute(id: number): void {
            delete M.buttonMap[id];

            const cfgs: IWaitCfg[] = M.waitMap[id] || null;
            if (cfgs === null) {
                return;
            }

            for (let i: number = 0; i < cfgs.length; i++) {
                const cfg: IWaitCfg = cfgs[i];
                if (cfg.line === true) {
                    continue;
                }
                cfg.canceled = true;
            }
        }
    }
}