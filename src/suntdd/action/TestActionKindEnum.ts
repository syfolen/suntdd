
module suntdd {
    /**
     * 测试动作类型枚举
     */
    export enum TestActionKindEnum {
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
         * WebSocket连接状态包
         */
        WS_STATE,

        /**
         * WebSocket协议数据包
         */
        WS_PROTOCAL,
    }
}