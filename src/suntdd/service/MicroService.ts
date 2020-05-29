
module suntdd {
    /**
     * export
     */
    export abstract class MicroService extends puremvc.Notifier {
        /**
         * 测试序号种子
         */
        protected $testSeqSeedId: number = 0;

        /**
         * 当前测试序号
         */
        protected $currentTestSeqId: number = 1;

        /**
         * 数据包列表
         */
        protected $packets: IMSWSPacket[] = [];

        /**
         * 客户端与服务端的时差
         */
        protected $timeDiff: number = suncom.Common.random(-8000, 8000);

        /**
         * 帧循环事件
         */
        protected $onEnterFrame(): void {
            while (this.$packets.length > 0) {
                const packet: IMSWSPacket = this.$packets[0];
                let success: boolean = false;
                if (packet.kind === MSWSPacketKindEnum.STATE) {
                    success = this.$notifyStatePacket(packet as IMSWSStatePacket);
                }
                else {
                    success = this.$notifyProtocalPacket(packet as IMSWSProtocalPacket);
                }
                if (success === false) {
                    break;
                }
                if (this.$packets.length > 0 && this.$packets[0].asNewMsg === true) {
                    break;
                }
            }
        }

        /**
         * 广播WebSocket状态消息
         */
        private $notifyStatePacket(packet: IMSWSStatePacket): boolean {
            suncom.Test.assertTrue(packet.kind === MSWSPacketKindEnum.STATE);

            const connection: sunnet.INetConnection = sunnet.M.connetionMap[packet.connName] || null;
            if (connection === null) {
                return false;
            }
            // 网络未连接时，不会下行任何状态数据包
            if (connection.state === sunnet.NetConnectionStateEnum.DISCONNECTED) {
                return false;
            }
            if (this.$notYet(packet) === true) {
                return false;
            }
            if (connection.state === sunnet.NetConnectionStateEnum.CONNECTING) {
                suncom.Test.assertTrue(packet.state === sunnet.MSWSStateEnum.CONNECTED || packet.state === sunnet.MSWSStateEnum.ERROR, `当前网络正在连接，仅允许下行CONNECTED或ERROR状态`);
            }
            else if (connection.state === sunnet.NetConnectionStateEnum.CONNECTED) {
                suncom.Test.assertTrue(packet.state === sunnet.MSWSStateEnum.CLOSE || packet.state === sunnet.MSWSStateEnum.ERROR, `当前网络己连接，仅允许下行CLOSE或ERROR状态`);
            }
            this.$packets.shift();
            this.$currentTestSeqId++;
            connection.testChangeState(packet.state);
            return true;
        }

        /**
         * 广播WebSocket协议消息
         */
        private $notifyProtocalPacket(packet: IMSWSProtocalPacket): boolean {
            suncom.Test.assertTrue(packet.kind === MSWSPacketKindEnum.PROTOCAL);
            if (this.$notYet(packet) === true) {
                return false;
            }
            if (packet.repeatTimes === 1) {
                this.$packets.shift();
                this.$currentTestSeqId++;
            }
            const connection: sunnet.INetConnection = sunnet.M.connetionMap[packet.connName] || null;
            suncom.Test.expect(connection).not.toBeNull();
            this.$initializePacketValue(packet);
            connection.testProtocal(packet.replyName, packet.data);
            if (packet.repeatTimes > 1) {
                packet.repeatTimes--;
                packet.waitCount = 0;
                delete packet.createTime;
            }
            return true;
        }

        /**
         * 数据包未就绪
         */
        private $notYet(packet: IMSWSPacket): boolean {
            if (packet.seqId !== this.$currentTestSeqId) {
                return true;
            }
            if (packet.waitName !== null && packet.waitCount < packet.waitTimes) {
                return true;
            }
            if (packet.createTime === void 0) { packet.createTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM); }
            if (packet.createTime + packet.delay > suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            if (packet.asNewMsg === true && packet.createTime + packet.delay === suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            return false;
        }

        /**
         * 初始化数据
         */
        private $initializePacket(packet: IMSWSPacket): void {
            if (packet.delay === void 0) { packet.delay = 0; }
            if (packet.connName === void 0) { packet.connName = "default"; }
            if (packet.asNewMsg === void 0) { packet.asNewMsg = true; }
            if (packet.waitName === void 0) { packet.waitName = null; }
            if (packet.waitTimes === void 0) { packet.waitTimes = 1; }
            suncom.Test.expect(packet.seqId).toBeGreaterThan(0);
            packet.waitCount = 0;
            suncom.Test.expect(packet.delay).interpret("消息下行延时必须大于或等于0").toBeGreaterOrEqualThan(0);
            suncom.Test.expect(packet.waitTimes).interpret("消息上行等待次数必须大于0").toBeGreaterThan(0);
        }

        /**
         * 初始化数据包的默认值
         */
        private $initializePacketDefaultValue(packet: IMSWSProtocalPacket, timeFields: string[] = [], hashFields: string[] = []): void {
            if (packet.data === null) {
                return;
            }
            packet.hashFileds = hashFields;
            packet.timeFields = [];
            for (let i: number = 0; i < timeFields.length; i++) {
                const value: dcodeIO.Long = this.$getFieldValue(packet.data, timeFields[i], dcodeIO.Long.fromNumber(0));
                packet.timeFields.push({
                    arg1: value.toNumber(),
                    arg2: timeFields[i]
                });
            }
        }

        /**
         * 初始化数据包的值
         */
        private $initializePacketValue(packet: IMSWSProtocalPacket): void {
            if (packet.data === null) {
                return;
            }
            for (let i: number = 0; i < packet.hashFileds.length; i++) {
                this.$setFieldValue(packet.data, packet.hashFileds[i], suncom.Common.createHashId());
            }
            for (let i: number = 0; i < packet.timeFields.length; i++) {
                const timeFiled: suncom.IPCMIntString = packet.timeFields[i];
                this.$setFieldValue(packet.data, timeFiled.arg2, dcodeIO.Long.fromNumber(new Date().valueOf() + this.$timeDiff + timeFiled.arg1));
            }
        }

        /**
         * 获取指定字段的值
         */
        private $getFieldValue(data: any, field: string, defaultValue: any): any {
            const array: string[] = field.split(".");
            while (array.length > 0) {
                data = data[array.shift()];
            }
            return data === void 0 ? defaultValue : data;
        }

        /**
         * 设置指定字段的值
         */
        private $setFieldValue(data: any, field: string, value: any): void {
            const array: string[] = field.split(".");
            while (array.length > 1) {
                data = data[array.shift()];
            }
            data[array.shift()] = value;
        }

        /**
         * 序列化WebSocket协议包
         * @timeFileds: 若有值，则视为时间偏移
         * @hashFileds: 无论是否有值，哈希值均会被重写
         */
        protected $serializeWebSocketProtocalPacket(packet: IMSWSProtocalPacket, timeFields?: string[], hashFields?: string[]): void {
            if (suncom.Global.debugMode & suncom.DebugMode.TEST) {
                packet.kind = MSWSPacketKindEnum.PROTOCAL;
                packet.seqId = this.$createTestSeqId();
                this.$packets.push(packet);
                this.$initializePacket(packet);
                if (packet.data === void 0) { packet.data = null; }
                if (packet.replyName === void 0) { packet.replyName = null; }
                if (packet.repeatTimes === void 0) { packet.repeatTimes = 1; }
                this.$initializePacketDefaultValue(packet, timeFields, hashFields);
                suncom.Test.expect(packet.repeatTimes).interpret("消息的下行次数必须大于或等于1").toBeGreaterOrEqualThan(1);
            }
        }

        /**
         * 序列化WebSocket状态包
         */
        protected $serializeWebSocketStatePacket(packet: IMSWSStatePacket): void {
            if (suncom.Global.debugMode & suncom.DebugMode.TEST) {
                packet.kind = MSWSPacketKindEnum.STATE;
                packet.seqId = this.$createTestSeqId();
                this.$packets.push(packet);
                this.$initializePacket(packet);
                suncom.Test.expect(packet.state).interpret("必须指定WebSocket状态包的状态值").not.toBeUndefined();
            }
        }

        /**
         * 设置测试序号
         */
        protected $createTestSeqId(): number {
            this.$testSeqSeedId++;
            return this.$testSeqSeedId;
        }
    }
}