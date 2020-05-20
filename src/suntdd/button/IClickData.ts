
module suntdd {
    /**
     * 客户端按钮点击信息
     */
    export interface IClickData {
        /**
         * 点击事件
         */
        event: Laya.Event;

        /**
         * 点击时间
         */
        clickTime: number;
    }
}