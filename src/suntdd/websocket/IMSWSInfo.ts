
module suntdd {
    /**
     * 微服务器信息接口
     * export
     */
    export interface IMSWSInfo {
        /**
         * 连接名称
         * export
         */
        name: string;

        /**
         * 连接状态
         * export
         */
        state: MSWSConnectionStateEnum;
    }
}