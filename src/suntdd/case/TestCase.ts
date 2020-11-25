
module suntdd {
    /**
     * 测试用例抽象类
     * 说明：
     * 1. 同一时间只会有一个测试用例被运行
     * export
     */
    export abstract class TestCase extends puremvc.Notifier {
        /**
         * 测试用例编号
         * export
         */
        protected $caseId: number;

        /**
         * 测试用例状态
         */
        private $status: TestCaseStatusEnum = TestCaseStatusEnum.PREPARE;

        /**
         * @caseId: 测试用例ID
         * export
         */
        constructor(caseId: number) {
            super(0);
            this.$caseId = caseId;
            M.currentTestCase = this;
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, this, this.$doPrepare);
        }

        /**
         * 完成测试
         */
        done(): void {
            this.$afterAll();
            this.$status = TestCaseStatusEnum.FINISH;
        }

        /**
         * 准备测试用例
         */
        private $doPrepare(): void {
            this.$status = TestCaseStatusEnum.EXECUTE;
            this.$beforeAll();
        }

        /**
         * 新增测试用例
         * @regOption: 默认为：APPEND
         * export
         */
        protected $addTest(tcId: number, taskCls: new (tcId: number) => TestCase, regOption: TestCaseRegOptionEnum = TestCaseRegOptionEnum.APPEND): void {
            const cfg: ITestCaseCfg = {
                tcId: tcId,
                taskCls: taskCls
            };
            if (regOption === TestCaseRegOptionEnum.APPEND) {
                M.tccQueue.push(cfg);
            }
            else {
                M.tccQueue.unshift(cfg);
            }
        }

        /**
         * 测试描述
         * export
         */
        protected $describe(str: string): void {
            suncom.Logger.log(suncom.DebugMode.TDD, str);
        }

        /**
         * 在所有脚本执行以前
         * export
         */
        protected $beforeAll(): void {

        }

        /**
         * 在所有脚本执行以后
         * export
         */
        protected $afterAll(): void {

        }

        /**
         * 发射信号
         * @delay: 信号发射延时
         * export
         */
        protected $emit(id: number, args?: any, delay: number = 0): void {
            this.facade.sendNotification(NotifyKey.EMIT, [id, args, true, delay]);
        }

        /**
         * 等待信号
         * @handler: 若line为false，则必须为handler指定值
         * @line: 是否进入队列，若为false，则必须指定handler，默认：true
         * @once: 是否只响应一次，若line为true，则once必然为true，默认为：true
         * export
         */
        protected $wait(id: number, handler: suncom.Handler = null, line: boolean = true, once: boolean = true): void {
            if (line === true) {
                once = true;
            }
            else {
                suncom.Test.expect(handler).interpret(`当参数line为false时必须指定handler`).toBeInstanceOf(suncom.Handler);
            }
            this.facade.sendNotification(NotifyKey.WAIT, [id, handler, line, once]);
        }

        /**
         * 点击按钮
         * 说明：
         * 1. 按钮的点击会延时500毫秒执行
         * export
         */
        protected $click(id: number): void {
            this.facade.sendNotification(NotifyKey.CLICK, id);
        }

        /**
         * 功能有二：
         * 1. 取消信号的监听
         * 2. 注销按钮的注册
         * 说明：
         * 1. 在队列中的信号监听无法取消
         * export
         */
        protected $cancel(id: number): void {
            this.facade.sendNotification(NotifyKey.CANCEL, id);
        }

        /**
         * 序列化WebSocket状态数据包
         * export
         */
        protected $serializeWebSocketStatePacket(packet: suntdd.IMSWSStatePacket): void {
            this.facade.sendNotification(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET, packet);
        }

        /**
         * 序列化WebSocket协议数据包
         * export
         */
        protected $serializeWebSocketProtocalPacket(packet: suntdd.IMSWSProtocalPacket, data?: any, timeFields?: string[], hashFields?: string[]): void {
            packet.data = data;
            this.facade.sendNotification(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET, [packet, timeFields, hashFields]);
        }

        /**
         * 测试用例状态
         */
        get status(): TestCaseStatusEnum {
            return this.$status;
        }
    }
}