
module suntdd {

    export interface ITestActionCfg {
        /**
         * 测试ID
         */
        id: number;

        /**
         * 序列号
         */
        seqId: number;

        /**
         * 测试动作类型
         */
        kind: suncom.TestActKindEnum;

        /**
         * 自定义数据
         */
        data: any;
    }
}