
module suntdd {
    /**
     * 客户端按钮信息
     */
    export interface IButtonInfo {
        /**
         * 按钮对象
         */
        button: Laya.Button;

        /**
         * 是否为一次性按钮
         */
        once: boolean;
    }
}