
module suntdd {
    /**
     * 序列化WebSocket状态包
     */
    export class SerializeWebSocketStatePacketCommand extends SerializeWebSocketPacketCommand {

        execute(packet: IMSWSStatePacket): void {
            this.$initializePacket(packet);
            suncom.Test.expect(packet.state).interpret("必须指定WebSocket状态包的状态值").not.toBeUndefined();
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.WS_STATE, packet])
        }
    }
}