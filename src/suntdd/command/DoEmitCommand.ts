
module suntdd {
    /**
     * 执行信号发射
     */
    export class DoEmitCommand extends puremvc.SimpleCommand {
        /**
         * 发射配置
         */
        private $cfg: IEmitCfg = null;

        execute(cfg: IEmitCfg): void {
            this.$cfg = cfg;
            suncom.Test.expect(cfg.id).toBeGreaterThan(0);
            if (cfg.delay <= 0) {
                this.$doEmit();
            }
            else {
                suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 500, this.$doEmit, this);
            }
        }

        private $doEmit(): void {
            suncom.Test.expect(M.currentSignalId).interpret(`信号发射干扰`).toBe(0);

            M.currentSignalId = this.$cfg.id;

            const array: IWaitCfg[] = M.waitMap[this.$cfg.id] || null;
            if (array !== null) {
                for (let i: number = 0; i < array.length; i++) {
                    const item: IWaitCfg = array[i];
                    if (item.once === true && item.done === true) {
                        continue;
                    }
                    if (item.once === true) {
                        item.done = true;
                    }
                    if (item.canceled === true) {
                        continue;
                    }
                    const handler: suncom.IHandler = item.handler || null;
                    if (handler === null) {
                        continue;
                    }
                    handler.runWith(this.$cfg.args);
                }
            }

            M.currentSignalId = 0;
        }
    }
}