
module suntdd {
    /**
     * 微服务器
     * 说明：
     * 1. 此服务一旦实例化则自运运行且不可停止
     * export
     */
    export class MicroService extends suncore.BaseService {
        /**
         * 测试行为集合
         */
        private $actions: ITestActionCfg[] = [];

        constructor() {
            super(0);
            M.timeDiff = suncom.Mathf.random(-8000, 8000);
            if (suncore.System.isModuleStopped(suncore.ModuleEnum.SYSTEM) === true) {
                throw Error(`微服务器未运行，因为SYSTEM时间轴未开启`);
            }
        }

        /**
         * export
         */
        protected $onRun(): void {
            this.facade.registerCommand(NotifyKey.EMIT, EmitCommand);
            this.facade.registerCommand(NotifyKey.WAIT, WaitCommand);
            this.facade.registerCommand(NotifyKey.CLICK, ClickCommand);
            this.facade.registerCommand(NotifyKey.CANCEL, CancelCommand);
            this.facade.registerCommand(NotifyKey.DO_EMIT, DoEmitCommand);
            this.facade.registerCommand(NotifyKey.DO_CLICK, DoClickCommand);
            this.facade.registerCommand(NotifyKey.REG_BUTTON, RegButtonCommand);

            this.facade.registerCommand(NotifyKey.PREPARE_PROTOCAL_PACKET, PrepareProtocalPacketCommand);
            this.facade.registerCommand(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET, SerializeWebSocketStatePacketCommand);
            this.facade.registerCommand(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET, SerializeWebSocketProtocalPacketCommand);

            this.facade.registerObserver(NotifyKey.ADD_WAIT, this.$addWait, this);
            this.facade.registerObserver(NotifyKey.ADD_ACTION, this.$addAction, this);
            this.facade.registerObserver(NotifyKey.TEST_WEBSOCKET_SEND_DATA, this.$onWebSocketSendData, this);
        }

        /**
         * export
         */
        protected $onStop(): void {
            this.facade.removeCommand(NotifyKey.EMIT);
            this.facade.removeCommand(NotifyKey.WAIT);
            this.facade.removeCommand(NotifyKey.CLICK);
            this.facade.removeCommand(NotifyKey.CANCEL);
            this.facade.removeCommand(NotifyKey.DO_EMIT);
            this.facade.removeCommand(NotifyKey.DO_CLICK);
            this.facade.removeCommand(NotifyKey.REG_BUTTON);

            this.facade.removeCommand(NotifyKey.PREPARE_PROTOCAL_PACKET);
            this.facade.removeCommand(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET);
            this.facade.removeCommand(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET);

            this.facade.removeObserver(NotifyKey.ADD_WAIT, this.$addWait, this);
            this.facade.removeObserver(NotifyKey.ADD_ACTION, this.$addAction, this);
            this.facade.removeObserver(NotifyKey.TEST_WEBSOCKET_SEND_DATA, this.$onWebSocketSendData, this);
        }

        /**
         * 自动化测试实现
         */
        protected $frameLoop(): void {
            let protocalNotified: boolean = false;

            while (this.$actions.length > 0) {
                const action: ITestActionCfg = this.$actions[0];

                let result: TestActionResultEnum = TestActionResultEnum.NONE;

                switch (action.kind) {
                    // 信号等待
                    case TestActionKindEnum.SIGNAL_WAIT:
                        result = this.$doWait(action.cfg as IWaitCfg);
                        break;
                    // 信号发射
                    case TestActionKindEnum.SIGNAL_EMIT:
                        result = this.$doEmit(action.cfg as IEmitCfg);
                        break;
                    // 按钮点击
                    case TestActionKindEnum.BUTTON_CLICK:
                        result = this.$doClick(action.cfg as IClickCfg);
                        break;
                    // 网络状态下行
                    case TestActionKindEnum.WS_STATE:
                        result = this.$notifyStatePacket(action.cfg as IMSWSStatePacket);
                        break;
                    // 网络协议数据下行
                    case TestActionKindEnum.WS_PROTOCAL:
                        result = this.$notifyProtocalPacket(action.cfg as IMSWSProtocalPacket);
                        break;
                    // 其它
                    default:
                        suncom.Test.notExpected();
                        break;
                }

                if (result & TestActionResultEnum.NOT_YET) {
                    break;
                }
                if (result & TestActionResultEnum.COMPLETE) {
                    this.$actions.shift();
                }
                if (result & TestActionResultEnum.SUSPEND) {
                    break;
                }
                if (action.kind === TestActionKindEnum.WS_PROTOCAL) {
                    protocalNotified = true;
                }

                // 若己下行过协议数据，且当前协议数据包视为新包，则跳出
                if (protocalNotified === true && this.$actions.length > 0) {
                    const next: ITestActionCfg = this.$actions[0];
                    if (next.kind === TestActionKindEnum.WS_PROTOCAL) {
                        const packet: IMSWSProtocalPacket = next.cfg as IMSWSProtocalPacket;
                        if (packet.asNewMsg === true) {
                            break;
                        }
                    }
                }
            }

            if (this.$actions.length > 0) {
                return;
            }
            if (M.currentTestCase === null) {
                const cfg: ITestCaseCfg = M.tccQueue.shift() || null;
                M.currentTestCase = cfg === null ? null : new cfg.taskCls(cfg.tcId);
            }
            else if (M.currentTestCase.status === TestCaseStatusEnum.EXECUTE) {
                M.currentTestCase.done();
            }
            else if (M.currentTestCase.status === TestCaseStatusEnum.FINISH) {
                suncom.Test.expect(this.$actions.length).toBe(0);
                M.currentTestCase = null;
            }
        }

        /**
         * 微服务器接收用户上行的数据
         */
        private $onWebSocketSendData(name: string): void {
            for (let i: number = 0; i < this.$actions.length; i++) {
                const action: ITestActionCfg = this.$actions[i];
                if (action.kind === TestActionKindEnum.WS_PROTOCAL) {
                    const packet: IMSWSProtocalPacket = action.cfg as IMSWSProtocalPacket;
                    if (packet.waitName === name && packet.waitTimes > 0 && packet.waitCount < packet.waitTimes) {
                        packet.waitCount++;
                    }
                    break;
                }
            }
        }

        /**
         * 添加新行为
         */
        private $addAction(kind: TestActionKindEnum, cfg: ICfg): void {
            const action: ITestActionCfg = {
                kind: kind,
                cfg: cfg
            };
            this.$actions.push(action);
        }

        /**
         * 添加信号等待
         */
        private $addWait(cfg: IWaitCfg): void {
            let array: IWaitCfg[] = M.waitMap[cfg.id] || null;
            if (array === null) {
                array = M.waitMap[cfg.id] = [];
            }
            let index: number = -1;
            for (let i: number = 0; i < array.length; i++) {
                if (array[i] === cfg) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                array.push(cfg);
            }
        }

        /**
         * 下行协议数据
         */
        private $notifyProtocalPacket(packet: IMSWSProtocalPacket): TestActionResultEnum {
            if (this.$notYet(packet) === true) {
                return TestActionResultEnum.NOT_YET;
            }
            this.facade.sendNotification(NotifyKey.PREPARE_PROTOCAL_PACKET, packet);
            this.facade.sendNotification(NotifyKey.TEST_WEBSOCKET_PROTOCAL, [packet.replyName, packet.data]);

            if (packet.repeatTimes === 1) {
                return TestActionResultEnum.COMPLETE;
            }
            packet.repeatTimes--;
            packet.waitCount = 0;
            delete packet.createTime;
            return TestActionResultEnum.SUSPEND;
        }

        /**
         * 下行网络状态
         */
        private $notifyStatePacket(packet: IMSWSStatePacket): TestActionResultEnum {
            const out: IMSWSInfo = {
                name: packet.connName,
                state: MSWSConnectionStateEnum.DISCONNECTED
            };
            this.facade.sendNotification(NotifyKey.GET_WEBSOCKET_INFO, out);
            // 网络未连接时，不会下行任何状态数据包
            if (out.state === MSWSConnectionStateEnum.DISCONNECTED) {
                return TestActionResultEnum.NOT_YET;
            }
            if (this.$notYet(packet) === true) {
                return TestActionResultEnum.NOT_YET;
            }
            if (out.state === MSWSConnectionStateEnum.CONNECTING) {
                suncom.Test.assertTrue(packet.state === MSWSStateEnum.CONNECTED || packet.state === MSWSStateEnum.ERROR, `当前网络正在连接，仅允许下行CONNECTED或ERROR状态`);
            }
            else if (out.state === MSWSConnectionStateEnum.CONNECTED) {
                suncom.Test.assertTrue(packet.state === MSWSStateEnum.CLOSE || packet.state === MSWSStateEnum.ERROR, `当前网络己连接，仅允许下行CLOSE或ERROR状态`);
            }
            this.facade.sendNotification(NotifyKey.TEST_WEBSOCKET_STATE, packet.state);
            return TestActionResultEnum.COMPLETE & TestActionResultEnum.SUSPEND;
        }

        /**
         * 数据包未就绪
         */
        private $notYet(packet: IMSWSPacket): boolean {
            if (packet.waitName !== null && packet.waitCount < packet.waitTimes) {
                return true;
            }
            if (packet.createTime === void 0) { packet.createTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM); }
            if (packet.createTime + packet.delay > suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            if (packet.asNewMsg === true && packet.createTime === suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            return false;
        }

        /**
         * 执行按钮点击
         */
        private $doClick(cfg: IClickCfg): TestActionResultEnum {
            if (cfg.actTime === void 0) {
                // 按钮不存在
                if (M.buttonMap[cfg.id] === void 0) {
                    return TestActionResultEnum.NOT_YET;
                }

                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.facade.sendNotification(NotifyKey.DO_CLICK, cfg);

                return TestActionResultEnum.NONE;
            }
            else if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            // 按钮点击尚未执行
            else {
                return TestActionResultEnum.NOT_YET;
            }
        }

        /**
         * 执行信号发射
         */
        private $doEmit(cfg: IEmitCfg): TestActionResultEnum {
            if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            if (cfg.actTime === void 0) {
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.facade.sendNotification(NotifyKey.DO_EMIT, cfg);
            }
            else {
                // 信号尚未发射
                return TestActionResultEnum.NOT_YET;
            }
            return TestActionResultEnum.NONE;
        }

        /**
         * 执行信号等待
         */
        private $doWait(cfg: IWaitCfg): TestActionResultEnum {
            if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            if (cfg.actTime === void 0) {
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.$addWait(cfg);
            }
            else {
                // 尚未监听到信号
                return TestActionResultEnum.NOT_YET;
            }
            return TestActionResultEnum.NONE;
        }
    }
}