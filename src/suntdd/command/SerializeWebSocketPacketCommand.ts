
module suntdd {
    /**
     * WebSocket数据包封包抽象类
     */
    export abstract class SerializeWebSocketPacketCommand extends puremvc.SimpleCommand {

        /**
         * 初始化数据
         */
        protected $initializePacket(packet: IMSWSPacket): void {
            if (packet.delay === void 0) { packet.delay = 0; }
            if (packet.connName === void 0) { packet.connName = "default"; }
            if (packet.asNewMsg === void 0) { packet.asNewMsg = true; }
            if (packet.waitName === void 0) { packet.waitName = null; }
            if (packet.waitTimes === void 0) { packet.waitTimes = 1; }
            packet.waitCount = 0;
            suncom.Test.expect(packet.delay).interpret("消息下行延时必须大于或等于0").toBeGreaterOrEqualThan(0);
            suncom.Test.expect(packet.waitTimes).interpret("消息上行等待次数必须大于0").toBeGreaterThan(0);
        }

        /**
         * 初始化数据包的默认值
         */
        protected $initializePacketDefaultValue(packet: IMSWSProtocalPacket, timeFields: string[] = [], hashFields: string[] = []): void {
            if (packet.data === null) {
                return;
            }
            packet.hashFileds = hashFields;
            packet.timeFields = [];
            for (let i: number = 0; i < timeFields.length; i++) {
                const value: number = this.$getFieldValue(packet.data, timeFields[i], 0);
                packet.timeFields.push({
                    arg1: value,
                    arg2: timeFields[i]
                });
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
    }
}