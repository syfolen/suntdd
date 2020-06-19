
module suntdd {
    /**
     * 行为配置接口
     */
    export interface ICfg {
        /**
         * 激活时间，0为未激活，默认为：0
         */
        actTime?: number;

        /**
         * 是否己执行
         */
        done?: boolean;

        /**
         * 是否己取消
         */
        canceled?: boolean;
    }
}