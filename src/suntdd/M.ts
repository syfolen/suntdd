
module suntdd {
    /**
     * 数据中心
     */
    export namespace M {
        /**
         * 服务端时差
         */
        export let timeDiff: number = 0;

        /**
         * 是否正在发射信号
         */
        export let currentSignalId: number = 0;

        /**
         * 测试用例配置列表 
         */
        export const tccQueue: ITestCaseCfg[] = [];

        /**
         * 信号监听集合
         */
        export const waitMap: { [id: number]: IWaitCfg[] } = {};

        /**
         * 按钮集合
         */
        export const buttonMap: { [id: number]: IButtonCfg } = {};
    }
}