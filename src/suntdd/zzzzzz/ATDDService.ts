
module suntdd {
    /**
     * export
     */
    export class ATDDService extends MicroService {
        /**
         * 测试行为集
         */
        private $actions: ITestActionCfg[] = [];

        /**
         * 按钮集合
         */
        private $buttonMap: { [id: number]: IButtonInfo } = {};

        /**
         * 信号监听集合
         */
        private $signalMap: { [id: number]: ISignalData } = {};

        /**
         * 启动回调
         * export
         */
        constructor() {
            super(0);
            this.facade.registerObserver(suncom.NotifyKey.TEST_RECV, this.$onTestRecv, this);
            this.facade.registerObserver(suncom.NotifyKey.TEST_EVENT, this.$onTestEvent, this);
            this.facade.registerObserver(suncom.NotifyKey.REMOVE_ALL_BUTTONS_AND_SIGNALS, this.$onRemoveAllButtonsAndSignals, this);
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        }

        /**
         * 停止回调
         * export
         */
        destroy(): void {
            if (this.$destroyed === true) {
                return;
            }
            super.destroy();
            this.facade.removeObserver(suncom.NotifyKey.TEST_RECV, this.$onTestRecv, this);
            this.facade.removeObserver(suncom.NotifyKey.TEST_EVENT, this.$onTestEvent, this);
            this.facade.removeObserver(suncom.NotifyKey.REMOVE_ALL_BUTTONS_AND_SIGNALS, this.$onRemoveAllButtonsAndSignals, this);
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        }

        /**
         * 帧循环事件
         */
        protected $onEnterFrame(): void {
            if (this.$actions.length > 0) {
                const cfg: ITestActionCfg = this.$actions[0];
                if (cfg.seqId === this.$currentTestSeqId && this.$doTestAction(cfg) === true) {
                    const index: number = this.$actions.indexOf(cfg);
                    if (index > -1) {
                        this.$actions.splice(index, 1);
                        this.$currentTestSeqId++;
                    }
                    return;
                }
            }
            super.$onEnterFrame();

            if (this.$actions.length === 0 && this.$packets.length === 0) {
                this.facade.sendNotification(suncom.NotifyKey.TEST_CASE_DONE);
            }
        }

        private $onRemoveAllButtonsAndSignals(): void {
            this.$buttonMap = {};
            this.$signalMap = {};
        }

        /**
         * 测试协议上行
         */
        private $onTestRecv(cmd: number): void {
            if (suncom.Global.debugMode & suncom.DebugMode.TEST) {
                if (suncom.Test.ENABLE_MICRO_SERVER === true) {
                    if (this.$packets.length > 0) {
                        const packet: IMSWSPacket = this.$packets[0];
                        const protocal: { Name: string } = sunnet.ProtobufManager.getInstance().getProtocalByCommand(cmd);
                        if (packet.waitName === protocal.Name && packet.waitTimes > 0) {
                            packet.waitCount++;
                            if (packet.waitCount === packet.waitTimes) {
                                this.$onEnterFrame();
                            }
                        }
                    }
                }
            }
        }

        /**
         * 执行测试动作
         */
        private $doTestAction(cfg: ITestActionCfg): boolean {
            if (cfg.kind === suncom.TestActKindEnum.BUTTON_CLICK) {
                return this.$doClickButton(cfg);
            }
            else if (cfg.kind === suncom.TestActKindEnum.SIGNAL_EMIT) {
                return this.$doEmitSignal(cfg);
            }
            suncom.Test.expect(cfg.kind).toBe(suncom.TestActKindEnum.SIGNAL_WAIT);
            return false;
        }

        /**
         * 执行发射信号
         */
        private $doEmitSignal(cfg: ITestActionCfg): boolean {
            const data: ISignalData = cfg.data;
            if (data.emitTime === void 0) {
                data.emitTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM) + data.delay;
            }
            if (suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM) < data.emitTime) {
                return false;
            }
            if (data.period === 0) {
                data.period = 1;
                this.$emitSignalEx(cfg.id, data.args, data);
            }
            return data.period === 2;
        }

        /**
         * 执行按钮点击事件
         */
        private $doClickButton(cfg: ITestActionCfg): boolean {
            const info: IButtonInfo = this.$buttonMap[cfg.id] || null;
            if (info === null) {
                return false;
            }
            const data: IClickData = cfg.data;
            if (data.clickTime === 0) {
                data.clickTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM) + 500;
            }
            if (data.clickTime > suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return false;
            }
            if (info.once === true) {
                delete this.$buttonMap[cfg.id];
            }
            const event: Laya.Event = data.event;
            event.setTo(event.type, info.button, info.button);
            info.button.event(event.type, event);
            return true;
        }

        /**
         * 响应测试事件
         */
        private $onTestEvent(id: number, kind: suncom.TestActKindEnum, arg0: any, arg1: any, arg2: any): void {
            if (suncom.Global.debugMode & suncom.DebugMode.TEST) {
                switch (kind) {
                    case suncom.TestActKindEnum.BUTTON_REGISTER:
                        this.$registerButton(id, arg0, arg1);
                        break;
                    case suncom.TestActKindEnum.BUTTON_CLICK:
                        this.$clickButton(id, kind, arg0);
                        break;
                    case suncom.TestActKindEnum.SIGNAL_EMIT:
                        this.$emitSignal(id, kind, arg0, arg1, arg2);
                        break;
                    case suncom.TestActKindEnum.SIGNAL_WAIT:
                        this.$waitSignal(id, kind, arg0, arg1, arg2);
                        break;
                    case suncom.TestActKindEnum.WS_STATE_NOTIFY:
                        this.$serializeWebSocketStatePacket(arg0);
                        break;
                    case suncom.TestActKindEnum.PROTOCAL_SERIALIZE:
                        this.$serializeWebSocketProtocalPacket(arg0, arg1, arg2);
                        break;
                    default:
                        suncom.Test.notExpected();
                }
            }
        }

        /**
         * 等待信号
         */
        private $waitSignal(id: number, kind: suncom.TestActKindEnum, handler: suncom.IHandler, line: boolean, once: boolean): void {
            suncom.Test.expect(this.$signalMap[id]).interpret("一个信号不允许同时存在多个回调").toBeUndefined();
            const data: ISignalData = {
                line: line,
                once: once,
                handler: handler
            };
            if (line === false) {
                suncom.Test.expect(handler).interpret("队列外的信号必须指定回调执行器").toBeInstanceOf(suncom.Handler);
                this.$signalMap[id] = data;
            }
            else {
                suncom.Test.expect(once).interpret("在队列中等待的信号必须是一次性的").toBe(true);
                const cfg: ITestActionCfg = this.$createTestActionCfg(id, kind);
                cfg.data = data;
            }
        }

        /**
         * 发射信号
         * @line: 为true时进入队列，为false时立即发射，默认为：false
         */
        private $emitSignal(id: number, kind: suncom.TestActKindEnum, args: any, line: boolean, delay: number): void {
            const data: ISignalData = {
                args: args,
                delay: delay,
                period: 0
            };
            if (line === false) {
                suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, delay, () => {
                    this.$emitSignalEx(id, args, data);
                }, this);
            }
            else {
                const cfg: ITestActionCfg = this.$createTestActionCfg(id, kind);
                cfg.data = data;
            }
        }

        /**
         * 立即执行发射信号
         */
        private $emitSignalEx(id: number, args: any, data: ISignalData): void {
            // 响应队列中的回调
            if (this.$actions.length > 0) {
                const cfg: ITestActionCfg = this.$actions[0];
                if (cfg.id === id && cfg.seqId === this.$currentTestSeqId && cfg.kind === suncom.TestActKindEnum.SIGNAL_WAIT) {
                    suncom.Test.expect(this.$signalMap[id]).interpret("一个信号不允许同时存在多个回调").toBeUndefined();
                    const handler: suncom.IHandler = cfg.data.handler || null;
                    if (handler === null || handler.runWith(args) !== false) {
                        data.period = 2;
                        this.$actions.shift();
                        this.$currentTestSeqId++;
                    }
                }
            }

            // 响应外部回调
            const sData: ISignalData = this.$signalMap[id] || null;
            if (sData !== null) {
                const handler: suncom.IHandler = sData.handler || null;
                if (handler === null || handler.runWith(args) !== false) {
                    data.period = 2;
                    if (sData.once === true) {
                        delete this.$signalMap[id];
                    }
                }
            }
        }

        /**
         * 点击按钮
         */
        private $clickButton(id: number, kind: suncom.TestActKindEnum, event: string | Laya.Event): void {
            if (typeof event === "string") {
                event = new Laya.Event().setTo(event, null, null);
            }
            const data: IClickData = {
                event: event,
                clickTime: 0
            };
            const cfg: ITestActionCfg = this.$createTestActionCfg(id, kind);
            cfg.data = data;
        }

        /**
         * 注册按钮
         */
        private $registerButton(id: number, button: any, once: boolean): void {
            suncom.Test.expect(id).toBeGreaterThan(0);
            suncom.Test.expect(button).anything();
            suncom.Test.assertTrue(once === true || once === false);
            this.$buttonMap[id] = {
                button: button,
                once: once
            };
        }

        /**
         * 新建测试行为配置
         */
        private $createTestActionCfg(id: number, kind: suncom.TestActKindEnum): ITestActionCfg {
            const cfg: ITestActionCfg = {
                id: id,
                seqId: this.$createTestSeqId(),
                kind: kind,
                data: null
            };
            this.$actions.push(cfg);
            return cfg;
        }
    }
}