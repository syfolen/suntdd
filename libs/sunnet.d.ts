
declare module sunnet {
    /**
     * 微服务器WebSocket状态枚举
     */
    enum MSWSStateEnum {
        /**
         * 己连接
         */
        CONNECTED,

        /**
         * 服务器关闭连接
         */
        CLOSE,

        /**
         * 网络异常断开
         */
        ERROR
    }

    /**
     * MsgQId枚举（谨慎修改）
     * 说明：
     * 1. 请勿轻易修改此处的数据，否则可能会影响suncore中MsgQ的业务
     */
    enum MsgQIdEnum {
        /**
         * 发送数据
         */
        NSL_SEND_DATA = 1,

        /**
         * 接收数据
         */
        NSL_RECV_DATA = 2
    }

    /**
     * 网络状态枚举
     */
    enum NetConnectionStateEnum {
        /**
         * 己连接
         */
        CONNECTED = 0,

        /**
         * 正在连接
         */
        CONNECTING,

        /**
         * 己断开
         */
        DISCONNECTED
    }

    /**
     * 时序命令类型枚举
     */
    enum SequentialCommandTypeEnum {
        /**
         * 网络消息命令
         */
        MSG,

        /**
         * GUI消息命令
         */
        GUI
    }

    /**
     * 服务端时间更新标记枚举
     */
    enum ServerTimeUpdateFlagEnum {
        /**
         * 重置
         */
        RESET,

        /**
         * 更新
         */
        UPDATE
    }

    /**
     * 网络环境模拟等级枚举
     */
    enum VirtualNetworkLevelEnum {
        /**
         * 无任何模拟
         */
        NONE,

        /**
         * 好
         */
        GOOD,

        /**
         * 差
         */
        BAD,

        /**
         * 极差
         */
        UNSTABLE
    }

    /**
     * 微服务器WebSocket数据包
     * 说明：
     * 1. 若不默认任何配置项，则消息以逐帧的形式进行派发
     * 2. 若指定的网络连接不正在，则数据包不会被处理
     */
    interface IMSWSPacket {
        /**
         * 下行延时，默认为：0
         */
        delay?: number;

        /**
         * 是否为新消息，若为false，则紧随上一条消息下行，否则在下一帧下行，默认为：true
         */
        asNewMsg?: boolean;

        /**
         * 等待消息名字，默认为：null
         * 说明：
         * 1. 该消息会在客户端上行与此名字一致的消息后再开始下行
         */
        waitName?: string;

        /**
         * 等待次数，不小于1，默认为：1
         * 说明：
         * 1. 该消息会在指定名字的消息上行达到指定次数时再开始下行
         */
        waitTimes?: number;
    }

    /**
     * 微服务器WebSocket协议包
     */
    interface IMSWSProtocalPacket extends IMSWSPacket {
        /**
         * 回复的消息名字，默认为：null
         */
        replyName?: string;

        /**
         * 下行的数据内容，默认为：null
         */
        data?: any;

        /**
         * 下行重复次数，默认为：1
         */
        repeatTimes?: number;
    }

    /**
     * 微服务器WebSocket状态包
     */
    interface IMSWSStatePacket extends IMSWSPacket {
        /**
         * WebSocket状态
         */
        state: MSWSStateEnum;
    }

    /**
     * 网络连接对象接口
     */
    interface INetConnection extends suncom.IEventSystem {
        /**
         * 网络连接状态
         */
        readonly state: NetConnectionStateEnum;

        /**
         * 获取消息管道对象
         */
        readonly pipeline: INetConnectionPipeline;

        /**
         * 请求连接
         * @byDog: 是否由检测狗发起，默认为false
         */
        connect(ip: string, port: number, byDog: boolean): void;

        /**
         * 关闭 websocket
         * @byError: 是否因为网络错误而关闭，默认为：false
         */
        close(byError?: boolean): void;

        /**
         * 发送数据
         * @bytes: 只能是Uint8Array，默认为：null
         * @ip: 目标地址，默认为：null
         * @port: 目标端口，默认为：0
         */
        sendBytes(cmd: number, bytes?: Uint8Array, ip?: string, port?: number): void;

        /**
         * 测试连接状态
         */
        testChangeState(state: MSWSStateEnum): void;

        /**
         * 测试数据包上行
         */
        testPacket(cmd: number): void;

        /**
         * 测试协议下行
         */
        testProtocal(name: string, data: any): void;
    }

    /**
     * 网络消息拦截器接口
     */
    interface INetConnectionInterceptor extends puremvc.INotifier {

        /**
         * 数据发送拦截接口
         */
        send(cmd: number, bytes: Uint8Array, ip: string, port: number): Array<any>;

        /**
         * 数据接收拦截接口
         */
        recv(cmd: number, srvId: number, bytes: Uint8Array, data: any): Array<any>;
    }

    /**
     * 消息处理管道接口
     */
    interface INetConnectionPipeline extends INetConnectionInterceptor {

        /**
         * 新增责任处理者
         * 说明：
         * 1. 当网络发送数据时，后添加的拦截器先执行
         * 2. 当网络接收数据时，先添加的拦截器先执行
         */
        add(arg0: string | (new (connection: INetConnection) => INetConnectionInterceptor), arg1?: new (connection: INetConnection) => INetConnectionInterceptor): void;

        /**
         * 移除责任处理责
         * @cls: 需要被移除的类型
         */
        remove(cls: new (connection: INetConnection) => INetConnectionInterceptor): void;
    }

    /**
     * 时序命令定义接口
     */
    interface ISequentialCommandDfn {
        /**
         * 类型
         */
        type: SequentialCommandTypeEnum;

        /**
         * 名称
         */
        name: number | string;
    }

    /**
     * 时序消息定义（仅指网络消息）
     * 说明：
     * 1. 来自GUI的消息是不需要记录的
     */
    interface ISequentialMessageDfn {
        /**
         * 名字
         */
        name: string;

        /**
         * 数据
         */
        data?: any;
    }

    /**
     * 时序接口
     */
    interface ISequentialSlice extends puremvc.Notifier {

        /**
         * 释放时序片断
         */
        release(): void;
    }

    /**
     * 时间时序接口
     */
    interface ISequentialTimeSlice extends ISequentialSlice {
        /**
         * 时间流逝的倍率
         */
        timeMultiple: number;

        /**
         * 对象的生命时长
         */
        readonly timeLen: number;

        /**
         * 对象过去的时间
         */
        readonly pastTime: number;

        /**
         * 更新对象的创建时间
         * @createTime: 创建时间（服务端时间），默认为当前服务端时间
         * @pastTime: 默认过去时长
         * @chaseMultiple: 追帧时的时间倍率，默认为：1
         */
        updateCreateTime(createTime?: number, pastTime?: number, chaseMultiple?: number): void;

        /**
         * 获取当前服务端时间戳
         */
        getCurrentServerTimestamp(): number;
    }

    /**
     * 网络消息结构
     */
    interface ISocketMessage {
        /**
         * 消息ID
         */
        id?: number;

        /**
         * 消息名字
         */
        name: string;

        /**
         * 挂载的数据对象
         */
        data?: any;

        /**
         * 服务器地址
         */
        ip?: string;

        /**
         * 服务器端口
         */
        port?: number;
    }

    /**
     * 逻辑时序接口
     */
    interface ISequentialLogicSlice extends ISequentialSlice {

        /**
         * 等待条件
         * @ids: 先决时序ID
         * @conditions: 条件
         * @handler: 回调执行器
         * 说明：
         * 1. 若调用此接口，则当前时序不会立即执行，而是会先等待所有先决时序执行完毕，然后执行handler，由外部触发时间序的运行
         * 2. 一般调用此接口情况，时序命令列表中的命令应当是GUI时序消息而非网络时序消息，因为网络时序消息在接收到之后是自动解锁的
         */
        wait(ids: number[], conditions: any, handler?: suncom.IHandler): void;
    }

    /**
     * 微服务器服务
     */
    class MicroService extends suncore.BaseService {

        /**
         * 启动回调
         */
        protected $onRun(): void;

        /**
         * 停止回调
         */
        protected $onStop(): void;

        /**
         * 帧循环事件（请重写此方法来替代ENTER_FRAME事件）
         */
        protected $frameLoop(): void;
    }

    /**
     * 网络连接对象
     */
    class NetConnection extends puremvc.Notifier implements INetConnection, suncom.IEventSystem {

        constructor(name: string);

        /**
         * 请求连接
         * @byDog: 是否由检测狗发起，默认为false
         */
        connect(ip: string, port: number, byDog: boolean): void;

        /**
         * 关闭 websocket
         * @byError: 是否因为网络错误而关闭，默认为false
         */
        close(byError?: boolean): void;

        /**
         * 发送数据
         * @bytes: 只能是Uint8Array，默认为：null
         * @ip: 目标地址，默认为：null
         * @port: 目标端口，默认为：0
         */
        sendBytes(cmd: number, bytes?: Uint8Array, ip?: string, port?: number): void;

        /**
         * 连接状态测试接口
         */
        testChangeState(state: MSWSStateEnum): void;

        /**
         * 测试数据包上行
         */
        testPacket(cmd: number): void;

        /**
         * 测试协议下行
         */
        testProtocal(name: string, data: any): void;

        /**
         * 取消当前正在派发的事件
         */
        dispatchCancel(): void;

        /**
         * 事件派发
         * @args[]: 参数列表，允许为任意类型的数据
         * @cancelable: 事件是否允许被中断，默认为false
         */
        dispatchEvent(type: string, args?: any, cancelable?: boolean): void;

        /**
         * 事件注册
         * @receiveOnce: 是否只响应一次，默认为false
         * @priority: 事件优先级，优先级高的先被执行，默认为：suncom.EventPriorityEnum.LOW
         */
        addEventListener(type: string, method: Function, caller: Object, receiveOnce?: boolean, priority?: suncom.EventPriorityEnum): void;

        /**
         * 移除事件
         */
        removeEventListener(type: string, method: Function, caller: Object): void;

        /**
         * 网络连接状态
         */
        readonly state: NetConnectionStateEnum;

        /**
         * 获取消息管道对象
         */
        readonly pipeline: INetConnectionPipeline;
    }

    /**
     * 网络消息拦截器
     * 自定义拦截器需要继承此类
     */
    abstract class NetConnectionInterceptor extends puremvc.Notifier implements INetConnectionInterceptor {

        constructor(connection: INetConnection);

        /**
         * 销毁拦截器
         */
        destroy(): void;

        /**
         * 网络连接成功
         */
        protected $onConnected(): void;

        /**
         * 网络连接断开
         */
        protected $onDisconnected(byError: boolean): void;

        /**
         * 数据发送拦截接口
         */
        send(cmd: number, bytes: Uint8Array, ip: string, port: number): Array<any>;

        /**
         * 数据接收拦截接口
         */
        recv(cmd: number, srvId: number, bytes: Uint8Array, data: any): Array<any>;
    }

    /**
     * 网络延时计算脚本
     */
    abstract class NetConnectionPing extends NetConnectionInterceptor {

        /**
         * 网络连接成功
         */
        protected $onConnected(): void;

        /**
         * 数据发送拦截接口
         */
        send(cmd: number, bytes: Uint8Array, ip: string, port: number): Array<any>;

        /**
         * 数据接收拦截接口
         */
        recv(cmd: number, srvId: number, bytes: Uint8Array, data: any): Array<any>;

        /**
         * 判断是否为可靠协议
         * 说明：
         * 1. 仅允许由客户端发起，且服务端必定会回复的协议视为可靠协议
         * 2. 若发送的协议为可靠协议，则会自动为其创建一个追踪器
         */
        protected abstract $isReliableProtocal(cmd: number): boolean;

        /**
         * 获取命令的应答协议号
         */
        protected abstract $getProtocalReplyCommand(cmd: number): number;

        /**
         * 处理接收到的数据
         */
        protected abstract $dealRecvData(cmd: number, data: any): void;

        /**
         * 更新服务器时间
         * 说明：
         * 1. 需要由继承类在$dealRecvData中调用来更新服务器时间相关的数据
         */
        protected $updateServerTimestamp(time: number, flag: ServerTimeUpdateFlagEnum): void;
    }

    /**
     * WebSocket Protobuf数据 解码器
     * 解码器可存在多个，任意一个解码成功，则会自动跳过其它解码器
     */
    abstract class NetConnectionProtobufDecoder extends NetConnectionInterceptor {

        /**
         * 数据解析执行函数
         */
        protected abstract $decode(cmd: number, bytes: Uint8Array): any;
    }

    /**
     * 虚拟网络环境，用于模拟现实中的网络延迟，掉线等
     */
    class NetConnectionVirtualNetwork extends NetConnectionInterceptor {

        /**
         * 网络连接的可靠时间
         * 说明：
         * 1. 每次网络成功连接，经多少秒后强制断开
         */
        protected $getReliableTimeOfConnection(): number;

        /**
         * 网络延时波动概率（0-100）
         * 说明：
         * 1. 当网络发生波动时，延时会较大
         */
        protected $getProbabilyOfNetworkWave(): number;

        /**
         * 数据包的延时时间
         * 说明：
         * 1. 每新收到一个数据包，计算它应当被延时的时间
         */
        protected $calculateMessageDelayTime(): number;
    }

    /**
     * 网络状态检测狗
     * 用于检测网络是否掉线
     */
    class NetConnectionWatchDog extends NetConnectionInterceptor {
    }

    /**
     * protobuf管理类
     */
    class ProtobufManager {

        static getInstance(): ProtobufManager;

        /**
         * 构建protobuf
         */
        buildProto(url: string): void;

        /**
         * 构建协议信息
         */
        buildProtocal(url: string): void;

        /**
         * 构建协议信息
         */
        buildProtocalJson(json: any): void;

        /**
         * 根据编号获取协议信息
         */
        getProtocalByCommand(cmd: any): any;

        /**
         * 根据名字获取协议信息
         */
        getProtocalByName(name: string): any;

        /**
         * 根据protobuf枚举定义
         */
        getProtoEnum(name: string): any;

        /**
         * 编码
         */
        encode(name: string, data: any): Uint8Array;

        /**
         * 解码
         */
        decode(name: string, bytes: Uint8Array): any;
    }

    /**
     * 时序片断
     */
    abstract class SequentialSlice extends puremvc.Notifier implements ISequentialSlice {

        /**
         * 释放时序片断
         */
        release(): void;

        private $onEnterFrameCB(): void;

        /**
         * 帧事件回调
         */
        protected abstract $onEnterFrame(): void;
    }

    /**
     * 时间片段
     */
    abstract class SequentialTimeSlice extends SequentialSlice implements ISequentialTimeSlice {
        /**
         * 时间流逝的倍率
         */
        timeMultiple: number;

        /**
         * @timeLen: 时间片断长度
         * @conName: 默认为"default"
         * 说明：
         * 1. 客户端对象是不需要追帧的
         */
        constructor(lifeTime: number, conName?: string);

        /**
         * 更新对象的创建时间
         * @createTime: 创建时间（服务端时间），默认为当前服务端时间
         * @pastTime: 默认过去时长
         * @chaseMultiple: 追帧时的时间倍率，默认为：1
         */
        updateCreateTime(createTime?: number, pastTime?: number, chaseMultiple?: number): void;

        /**
         * 帧事件回调（追帧算法实现函数）
         */
        protected $onEnterFrame(): void;

        /**
         * 获取当前服务端时间戳
         */
        getCurrentServerTimestamp(): number;

        /**
         * 帧循环事件（请重写此方法来替代ENTER_FRAME事件）
         */
        protected abstract $frameLoop(): void;

        /**
         * 时间结束回调（回调前会先执行$frameLoop方法）
         */
        protected abstract $onTimeup(): void;

        /**
         * 对象的生命时长
         */
        readonly timeLen: number;

        /**
         * 对象过去的时间
         */
        readonly pastTime: number;
    }

    /**
     * 网络连接创建器
     */
    class NetConnectionCreator extends NetConnectionInterceptor {
    }

    /**
     * WebSocket Protobuf数据 解码器
     * 解码器可存在多个，任意一个解码成功，则会自动跳过其它解码器
     */
    class NetConnectionDecoder extends NetConnectionInterceptor {
    }

    /**
     * WebSocket 数据编码器，负责打包发送前的数据
     */
    class NetConnectionEncoder extends NetConnectionInterceptor {
    }

    /**
     * 心跳检测器
     */
    class NetConnectionHeartbeat extends NetConnectionInterceptor {
    }

    /**
     * 逻辑片断
     */
    abstract class SequentialLogicSlice extends SequentialSlice implements ISequentialLogicSlice {

        /**
         * @id: 时序ID，由外部枚举
         * @commands: 时序命令
         */
        constructor(id: number, commands: ISequentialCommandDfn[]);

        /**
         * 等待条件
         * @ids: 先决时序ID
         * @conditions: 条件
         * @handler: 回调执行器
         * 说明：
         * 1. 若调用此接口，则当前时序不会立即执行，而是会先等待所有先决时序执行完毕，然后执行handler，由外部触发时间序的运行
         * 2. 一般调用此接口情况，时序命令列表中的命令应当是GUI时序消息而非网络时序消息，因为网络时序消息在接收到之后是自动解锁的
         */
        wait(ids: number[], conditions: any, handler?: suncom.IHandler): void;

        /**
         * 释放时序片断
         */
        release(): void;

        /**
         * 帧事件回调
         */
        protected $onEnterFrame(): void;

        /**
         * 网络消息断言
         * 说明：
         * 1. 若断言的消息为当前时序所关心的消息，返回true，否则返回false
         */
        protected abstract $assertMessage(name: string, data?: any): boolean;

        /**
         * GUI消息断言
         * 说明：
         * 1. 若断言的消息为当前时序所关心的消息，返回true，否则返回false
         */
        protected abstract $asseretGUINotification(name: string, ...args: any[]): boolean;
    }

    /**
     * 网络模块配置
     */
    namespace Config {
        /**
         * 服务端地址
         */
        let TCP_IP: string;

        /**
         * 服务端端口
         */
        let TCP_PORT: number;

        /**
         * 重连延时
         */
        let TCP_RETRY_DELAY: number;

        /**
         * 最大重连次数
         */
        let TCP_MAX_RETRIES: number;

        /**
         * 心跳发送指令
         */
        let HEARTBEAT_REQUEST_COMMAND: number;

        /**
         * 心跳接收指令
         */
        let HEARTBEAT_RESPONSE_COMMAND: number;

        /**
         * 心跳超时时间
         */
        let HEARTBEAT_TIMEOUT_MILLISECONDS: number;

        /**
         * 心跳间隔时间
         */
        let HEARTBEAT_INTERVAL_MILLISECONDS: number;

        /**
         * 以固定频率发送心跳，默认为：false
         * 说明：
         * 1. 若为true，则心跳的发送频率不受业务数据发送的影响
         * 2. 若为false，则有业务数据持续发送时，就不会发送心跳
         */
        let HEARTBEAT_FIXED_FREQUENCY: boolean;

        /**
         * 虚拟网络水平
         */
        let VIRTUAL_NETWORK_LEVEL: VirtualNetworkLevelEnum;
    }

    /**
     * 数据中心
     */
    namespace M {
        /**
         * 网络连接哈希表
         */
        const connetionMap: { [name: string]: INetConnection };
    }

    /**
     * 网络消息派发器
     */
    namespace MessageNotifier {

        /**
         * 通知网络消息
         */
        function notify(name: string, data: any, cancelable?: boolean): void;

        /**
         * 注册网络消息监听
         */
        function register(name: string, method: Function, caller: Object, priority?: number): void;

        /**
         * 移除网络消息监听
         */
        function unregister(name: string, method: Function, caller: Object): void;
    }

    /**
     * 微服务器
     */
    namespace MicroServer {

        /**
         * 序列化WebSocket状态包
         */
        function serializeWebSocketStatePacket(packet: IMSWSStatePacket): void;

        /**
         * 序列化WebSocket协议包
         * @timeFileds: 若有值，则视为时间偏移
         * @hashFileds: 无论是否有值，哈希值均会被重写
         */
        function serializeWebSocketProtocalPacket(packet: IMSWSProtocalPacket, timeFields?: string[], hashFields?: string[]): void;
    }

    /**
     * 网络模块消息定义
     */
    namespace NotifyKey {
        /**
         * 网络状态变化通知 { name: string, state: NetConnectionStateEnum, byError: boolean }
         */
        const SOCKET_STATE_CHANGE: string;

        /**
         * 网络连接失败（检测狗在尝试重连失败后会派发此消息）
         */
        const SOCKET_CONNECT_FAILED: string;
    }

    /**
     * 时序系统接口
     * 设计说明：
     * 1. 时序系统仅为GUI服务，用于解决游戏业务
     * 2. 解决在多人联网游戏中，有状态对象在不同客户端的表现可能会因网络延时，或加载延时导致的不同步出现各种问题
     * 例如：
     * 1. 有些行为的发起具有先决条件，如：捕鱼三叉戟的发射必须等待炮台的加载和搭建完成，但基于1，有可能发生玩家A己点击的发射子弹，但玩家B还处于加载资源的情况
     * 2. 若碰到2中的情况，则玩家B将会错过玩家A的子弹发射消息，导致玩家B中的玩家A炮台搭建完成之后，三叉戟的逻辑再也不能继续进行
     * 3. 又或者玩家B舞台中的玩家A击中一个漩涡，但由于资源加载延时了漩涡的表现，而玩家A在漩涡完成之后，发起了更改炮台倍率的请求，玩家B收到了这个更改通知
     * 4. 继续3，因为游戏规则为漩涡期间不能更改倍率，故这个更改消息必须被延迟到漩涡完成之后才能执行
     * 5. 又或者客户端收到了一条鱼的生成消息，但时间戳是在5秒前，鱼的游动需要作追帧处理
     * 6. 基于上述诸多情况，故设计时序系统
     * 如何创建：
     * 1. 考虑到性能问题，时序服务不能被玩家实例化，它伴随着名为"default"的NetConnection的创建而创建，且一旦创建，则永远不能被销毁
     */
    namespace SequentialSystem {
    }
}