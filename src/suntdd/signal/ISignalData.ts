
module suntdd {
    /**
     * 客户端按钮点击信息
     */
    export interface ISignalData {
        /**
         * 信号参数
         */
        args?: any;

        /**
         * 发送延时
         */
        delay?: number;

        /**
         * 信号阶段
         */
        period?: number;

        /**
         * 发射时间戳
         */
        emitTime?: number;

        /**
         * 是否在队列中
         */
        line?: boolean;

        /**
         * 是否只响应一次
         */
        once?: boolean;

        /**
         * 响应回调
         */
        handler?: suncom.IHandler;
    }
}