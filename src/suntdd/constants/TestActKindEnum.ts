
module suntdd {
    /**
     * 测试动作类型枚举
     */
    export enum TestActKindEnum {
        /**
         * 无
         */
        NONE,

        /**
         * 按钮点击
         */
        BUTTON_CLICK,

        /**
         * 信号发送
         */
        SIGNAL_EMIT,

        /**
         * 信号监听
         */
        SIGNAL_WAIT,

        /**
         * WebSocket连接状态下行
         */
        WS_STATE_NOTIFY,

        /**
         * WebSocket协议数据包下行
         */
        WS_PROTOCAL_NOTIFY,

        /**
         * 协议序列化
         */
        PROTOCAL_SERIALIZE
    }
}