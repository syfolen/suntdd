
module suntdd {
    /**
     * 验收测试服务
     * 说明：
     * 1. 此服务一旦实例化则自运运行且不可停止
     * export
     */
    export class NewATDDService extends puremvc.Notifier {
        /**
         * 测试行为集合
         */
        private $actions: ITestActionCfg[] = [];

        /**
         * 当前测试序号
         */
        private $currentTestSeqId: number = 1;

        /**
         * 信号监听集合
         */
        private $waitMap: { [id: number]: IWaitCfg[] } = {};

        /**
         * 按钮集合
         */
        private $buttonMap: { [id: number]: IButtonInfo } = {};

        constructor() {
            super(0);
            Laya.timer.frameLoop(1, this, this.$onFrameLoop);
            this.facade.registerObserver(NotifyKey.EMIT, this.$onEmit, this);
            this.facade.registerObserver(NotifyKey.WAIT, this.$onWait, this);
            this.facade.registerObserver(NotifyKey.CANCEL, this.$onCancel, this);
            this.facade.registerObserver(NotifyKey.CLICK, this.$onClick, this);
            this.facade.registerObserver(NotifyKey.REG_BUTTON, this.$onRegButton, this);
        }

        /**
         * 注册按钮
         */
        private $onRegButton(id: number, button: any, once: boolean): void {
            suncom.Test.expect(button).anything();
            suncom.Test.expect(this.$buttonMap[id]).toBeUndefined();

            const cfg: IButtonCfg = {
                button: button,
                once: once
            };
            this.$buttonMap[id] = cfg;
        }

        /**
         * 点击按钮
         * 说明：
         * 1. 按钮的点击会延时500毫秒执行
         */
        private $onClick(id: number): void {
            const cfg: IClickCfg = {
                id: id
            };
            this.$addAction(TestActKindEnum.BUTTON_CLICK, cfg);
        }

        /**
         * 详见 TestCase.cancel() 注释
         */
        private $onCancel(id: number): void {
            delete this.$buttonMap[id];

            const cfgs: IWaitCfg[] = this.$waitMap[id] || null;
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

        /**
         * 等待信号
         * @line: 是否进入队列
         * @once: 是否只响应一次
         * { id: number, handler: suncom.IHandler, line: boolean, once: boolean }
         */
        private $onWait(id: number, handler: suncom.IHandler, line: boolean, once: boolean): void {
            const cfg: IWaitCfg = {
                id: id,
                handler: handler,
                line: line,
                once: once
            };
            if (line === true) {
                this.$addAction(TestActKindEnum.SIGNAL_WAIT, cfg);
            }
            else {
                this.$addWait(cfg);
            }
        }

        /**
         * 添加信号等待
         */
        private $addWait(cfg: IWaitCfg): void {
            let array: IWaitCfg[] = this.$waitMap[cfg.id] || null;
            if (array === null) {
                array = this.$waitMap[cfg.id] = [];
            }
            array.push(cfg);
        }

        /**
         * 发射信号
         * @line: 是否进入队列
         * { id: number, args: any, line: boolean, delay: number }
         */
        private $onEmit(id: number, args: any, line: boolean, delay: number): void {
            const cfg: IEmitCfg = {
                id: id,
                args: args,
                line: line,
                delay: delay
            };
            if (line === false) {
                this.$doEmit(cfg);
            }
            else {
                this.$addAction(TestActKindEnum.SIGNAL_EMIT, cfg);
            }
        }

        private $doEmit(cfg: IEmitCfg): boolean {
            if (cfg.actTime === void 0) {
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            }
            if (cfg.actTime + cfg.delay < suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return false;
            }
            const array: IWaitCfg[] = this.$waitMap[cfg.id] || null;
            if (array === null) {
                return true;
            }
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
                handler.runWith(cfg.args);
            }
            return true;
        }

        /**
         * 自动化测试实现
         */
        private $onFrameLoop(): void {
            while (this.$actions.length > 0) {
                const action: ITestActionCfg = this.$actions[0];

                let done: boolean = false;
                if (action.kind === TestActKindEnum.SIGNAL_WAIT) {
                    this.$addWait(action.cfg as IWaitCfg);
                }
                else if (action.kind === TestActKindEnum.SIGNAL_EMIT) {
                    done = this.$doEmit(action.cfg as IEmitCfg);
                }
                else if (action.kind === TestActKindEnum.WS_STATE_NOTIFY) {

                }
            }
        }

        /**
         * 添加新行为
         */
        private $addAction(kind: TestActKindEnum, cfg: ICfg): void {
            const action: ITestActionCfg = {
                kind: kind,
                cfg: cfg
            };
            this.$actions.push(action);
        }

        /**
         * 下行网络状态包
         */
        private $notifyWebSocketStatePacket(): void {

        }

        /**
         * 下行网络协议数据包
         */
        private $notifyWebSocketProtocalPacket(): void {

        }

        /**
         * 未就绪
         */
        private $notYet(): boolean {
            return false;
        }

        /**
         * 按钮是否允许点击
         */
        private $isButtonReady(id: number): boolean {
            return this.$buttonMap[id] !== void 0;
        }
    }
}