
module suntdd {
    /**
     * 消息枚举
     * export
     */
    export namespace NotifyKey {
        /**
         * 发射信号 { id: number, args: any, line: boolean, delay: number }
         * @line: 是否进入队列
         */
        export const EMIT: string = "suntdd.NotifyKey.EMIT";

        /**
         * 等待信号 { id: number, handler: suncom.IHandler, line: boolean, once: boolean }
         * @line: 是否进入队列
         */
        export const WAIT: string = "suntdd.NotifyKey.WAIT";

        /**
         * 执行信号发射 { cfg: IEmitCfg }
         */
        export const DO_EMIT: string = "suntdd.NotifyKey.DO_EMIT";

        /**
         * 取消事件 { id: number }
         * 说明：
         * 1. 详见 TestCase.cancel() 注释
         */
        export const CANCEL: string = "suntdd.NotifyKey.CANCEL";

        /**
         * 点击按钮 { id: number }
         */
        export const CLICK: string = "suntdd.NotifyKey.CLICK";

        /**
         * 执行按钮点击 { cfg: IClickCfg }
         */
        export const DO_CLICK: string = "suntdd.NotifyKey.DO_CLICK";

        /**
         * 注册按钮 { id: number, button: Laya.Button, once: boolean }
         */
        export const REG_BUTTON: string = "suntdd.NotifyKey.REG_BUTTON";

        /**
         * 添加信号等待 { cfg: IWaitCfg }
         */
        export const ADD_WAIT: string = "suntdd.NotifyKey.ADD_WAIT";

        /**
         * 添加新行为 { kind: TestActionKindEnum, cfg: ICfg }
         */
        export const ADD_ACTION: string = "suntdd.NotifyKey.ADD_ACTION";

        /**
         * 获取WebSocket连接信息 { out: IMSWSInfo }
         * export
         */
        export const GET_WEBSOCKET_INFO: string = "suntdd.NotifyKey.GET_WEBSOCKET_INFO";

        /**
         * 测试服务器连接状态 { state: MSWSStateEnum }
         * export
         */
        export const TEST_WEBSOCKET_STATE: string = "suntdd.NotifyKey.TEST_WEBSOCKET_STATE";

        /**
         * 测试服务器协议数据 { data: any }
         * export
         */
        export const TEST_WEBSOCKET_PROTOCAL: string = "suntdd.NotifyKey.TEST_WEBSOCKET_PROTOCAL";

        /**
         * 测试WebSocket上行协议 { name: number }
         * export
         */
        export const TEST_WEBSOCKET_SEND_DATA: string = "suntdd.NotifyKey.TEST_WEBSOCKET_SEND_DATA";

        /**
         * 准备协议数据包 { packet: IMSWSProtocalPacket }
         */
        export const PREPARE_PROTOCAL_PACKET: string = "suntdd.NotifyKey.PREPARE_PROTOCAL_PACKET";

        /**
         * 序列化网络状态包 { packet: IMSWSStatePacket }
         */
        export const SERIALIZE_WEBSOCKET_STATE_PACKET: string = "suntdd.NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET";

        /**
         * 列化化协议数据包 { packet: IMSWSProtocalPacket, data: any, timeFields?: string[], hashFields?: string[] }
         */
        export const SERIALIZE_WEBSOCKET_PROTOCAL_PACKET: string = "suntdd.NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET";
    }
}