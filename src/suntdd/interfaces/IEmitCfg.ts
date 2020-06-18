
module suntdd {
    /**
     * 信号发射行为配置
     */
    export interface IEmitCfg extends ICfg {
        /**
         * 信号ID
         */
        id: number;

        /**
         * 参数
         */
        args?: any;

        /**
         * 是否在队列中
         */
        line: boolean;

        /**
         * 发射延时，默认：0
         */
        delay?: number;
    }
}