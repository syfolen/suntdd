
module suntdd {
    /**
     * 行为接口
     */
    export interface ITestActionCfg {
        /**
         * 行为类型
         */
        kind: TestActionKindEnum;

        /**
         * 行为配置
         */
        cfg: ICfg;
    }
}