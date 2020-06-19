
module suntdd {
    /**
     * 微服务器WebSocket连接状态枚举
     * export
     */
    export enum MSWSConnectionStateEnum {
        /**
         * 己连接
         * export
         */
        CONNECTED,

        /**
         * 连接中
         * export
         */
        CONNECTING,

        /**
         * 己断开
         * export
         */
        DISCONNECTED
    }
}