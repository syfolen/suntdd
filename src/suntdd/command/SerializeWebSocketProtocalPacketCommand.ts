
module suntdd {
    /**
     * 序列化WebSocket协议包
     */
    export class SerializeWebSocketProtocalPacketCommand extends SerializeWebSocketPacketCommand {

        /**
         * @timeFileds: 若有值，则视为时间偏移
         * @hashFileds: 无论是否有值，哈希值均会被重写
         */
        execute(packet: IMSWSProtocalPacket, timeFields?: string[], hashFields?: string[]): void {
            this.$initializePacket(packet);
            if (packet.data === void 0) { packet.data = null; }
            if (packet.replyName === void 0) { packet.replyName = null; }
            if (packet.repeatTimes === void 0) { packet.repeatTimes = 1; }
            this.$initializePacketDefaultValue(packet, timeFields, hashFields);
            suncom.Test.expect(packet.repeatTimes).interpret("消息的下行次数必须大于或等于1").toBeGreaterOrEqualThan(1);
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.WS_PROTOCAL, packet])
        }
    }
}