
module suntdd {
    /**
     * 信号等待行为配置
     */
    export interface IWaitCfg extends ICfg {
        /**
         * 信号ID
         */
        id: number;

        /**
         * 回调执行器
         */
        handler: suncom.IHandler;

        /**
         * 是否在队列中
         */
        line: boolean;

        /**
         * 是否只响应一次
         */
        once: boolean;

        /**
         * 是否己执行，默认为：false
         */
        done?: boolean;
    }
}