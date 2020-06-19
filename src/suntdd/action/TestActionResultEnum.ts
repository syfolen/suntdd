
module suntdd {
    /**
     * 测试行为结果枚举
     */
    export enum TestActionResultEnum {
        /**
         * 无
         */
        NONE = 0x1,

        /**
         * 尚未完成
         */
        NOT_YET = 0x2,

        /**
         * 己完成
         */
        COMPLETE = 0x4,

        /**
         * 终止任务
         */
        SUSPEND = 0x8
    }
}