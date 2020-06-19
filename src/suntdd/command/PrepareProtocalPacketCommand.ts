
module suntdd {
    /**
     * 初始化WebSocket协议数据包
     */
    export class PrepareProtocalPacketCommand extends puremvc.SimpleCommand {

        execute(packet: IMSWSProtocalPacket): void {
            if (packet.data === null) {
                return;
            }
            for (let i: number = 0; i < packet.hashFileds.length; i++) {
                this.$setFieldValue(packet.data, packet.hashFileds[i], suncom.Common.createHashId());
            }
            for (let i: number = 0; i < packet.timeFields.length; i++) {
                const timeFiled: suncom.IPCMIntString = packet.timeFields[i];
                const timestamp: number = new Date().valueOf() + M.timeDiff + timeFiled.arg1;
                this.$setFieldValue(packet.data, timeFiled.arg2, dcodeIO.Long.fromNumber(timestamp));
            }
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
    }
}