import {
    Client,
    IFrame,
    IMessage,
    IPublishParams,
    StompConfig,
    StompHeaders,
    StompSubscription,
} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { doNothing } from "./Helpers/Helpers";

interface SocketServerProps {
    status?: SocketStatus;
    webSocketPath?: string;
    create?: true | false;
    errorHandlers?: ErrorHandlers;
}

export interface ErrorHandlers {
    onWebSocketCloseHandler: () => void;
    onDisconnectHandler: () => void;
    onWebSocketErrorHandler: () => void;
    onStompErrorHandler: (frame: IFrame) => void;
    debug?: (message: string) => void;
}

export interface ServiceSubscription {
    topic: string;
    handler: (message: IMessage) => void;
    subscription: StompSubscription;
}

interface SubscribeType {
    topic: string;
    handler: (msg: IMessage) => void;
    headers?: StompHeaders;
}

export const defaultErrorHandlers: ErrorHandlers = {
    onWebSocketCloseHandler: doNothing,
    onDisconnectHandler: doNothing,
    onWebSocketErrorHandler: doNothing,
    onStompErrorHandler: () => {
        // do nothing
    },
};

export const consoleLoggingErrorHandler = {
    onWebSocketCloseHandler: (): void => {
        console.error("The web socket has closed...");
    },
    onDisconnectHandler: (): void => {
        console.error("The client has disconnected...");
    },
    onWebSocketErrorHandler: (): void => {
        console.error("Error with the web socket...");
    },
    onStompErrorHandler: (frame: IFrame): void => {
        console.log(`Broker reported error: ${frame.headers.message}`);
        console.log(`Additional details: ${frame.body}`);
    },
    debug: console.log,
};

export enum SocketStatus {
    INITIALIZING = "initializing",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
}

export class SocketService {
    status: SocketStatus;
    subscriptions: ServiceSubscription[] = [];
    private subscriptionQueue: SubscribeType[] = [];
    client?: Client;
    ready = (): boolean => this.client !== undefined && this.client.connected;
    readonly errorHandlers: ErrorHandlers;

    constructor({
        status = SocketStatus.INITIALIZING,
        webSocketPath = "/ws",
        create = true,
        errorHandlers = defaultErrorHandlers,
    }: SocketServerProps) {
        this.status = status;
        this.errorHandlers = errorHandlers;
        if (create) {
            const clientConfiguration = this.getClientConfig(webSocketPath);
            this.client = new Client(clientConfiguration);
            this.client.activate();
        }
    }

    unsubscribeSubscriptions = (): void => {
        this.subscriptions.forEach((item) => item.subscription.unsubscribe());
        this.subscriptions = [];
    };
    subscribe = ({ topic, handler, headers }: SubscribeType): void => {
        if (this.subscriptions.find((sub) => sub.topic === topic)) {
            // already subscribed to the provided subscription, don't resubscribe
            return;
        }
        if (this.ready() && this.client) {
            const subscription = this.client.subscribe(
                topic,
                (msg: IMessage): void => {
                    handler(msg);
                },
                headers,
            );
            this.subscriptions.push({ topic, handler, subscription });
            this.subscribeToQueuedSubscriptions();
        } else {
            this.subscriptionQueue.push({ topic, handler, headers });
        }
    };

    sendMessageToTopicIdHandler = (topic: string, id: string, body: string): void => {
        const foundSubscription = this.subscriptions.find(
            (x) => x.topic === topic && x.subscription.id === id,
        );

        if (!foundSubscription) {
            throw new Error(
                `Subscription for ${topic} with id ${id} could not be found. Check your spelling`,
            );
        }
        const message: Partial<IMessage> = {
            body: body,
            headers: { destination: topic, id: foundSubscription.subscription.id },
        };
        foundSubscription.handler(message as IMessage);
    };

    unsubscribe = (subscriptionId: string): void => {
        if (this.ready()) {
            this.client?.unsubscribe(subscriptionId);
            this.subscriptions = this.subscriptions.filter((item): boolean => {
                return item.subscription.id !== subscriptionId;
            });
        }
    };

    shutdown = (): void => {
        this.unsubscribeSubscriptions();
        this.client?.deactivate();
    };

    sendMessage = async (message: IPublishParams): Promise<void> => {
        if (this.ready()) {
            this.client?.publish(message);
        }
    };

    findSubscription = (topic: string): ServiceSubscription => {
        const serviceSubscription = this.subscriptions.find((x) => topic === x.topic);
        if (!serviceSubscription) {
            throw new Error("Could not find subscription");
        }
        return serviceSubscription;
    };

    findSubscriptionWithoutError = (topic: string): ServiceSubscription | undefined => {
        return this.subscriptions.find((x) => topic === x.topic);
    };

    readonly subscribeToQueuedSubscriptions = (): void => {
        this.subscriptionQueue.forEach((ps) => this.subscribe(ps));
        this.subscriptionQueue = [];
    };

    readonly getClientConfig = (webSocketPath: string): StompConfig => {
        const clientConfiguration: StompConfig = {
            onConnect: (): void => {
                this.status = SocketStatus.CONNECTED;
                this.subscribeToQueuedSubscriptions();
            },
            onStompError: (): void => {
                this.status = SocketStatus.DISCONNECTED;
                this.unsubscribeSubscriptions();
            },
            onWebSocketError: (): void => {
                this.status = SocketStatus.DISCONNECTED;
                this.unsubscribeSubscriptions();
            },
            onWebSocketClose: (): void => {
                this.status = SocketStatus.DISCONNECTED;
                this.unsubscribeSubscriptions();
            },
            onDisconnect: (): void => {
                this.status = SocketStatus.DISCONNECTED;
                this.unsubscribeSubscriptions();
            },
        };

        clientConfiguration.webSocketFactory = (): WebSocket => {
            const connection = new SockJS(webSocketPath);
            this.status = SocketStatus.CONNECTED;
            return connection;
        };

        clientConfiguration.onStompError = (frame): void => {
            this.status = SocketStatus.DISCONNECTED;
            this.unsubscribeSubscriptions();
            // console.log("Stomp error...");
            this.errorHandlers.onStompErrorHandler(frame);
        };
        clientConfiguration.onWebSocketError = (): void => {
            this.status = SocketStatus.DISCONNECTED;
            this.unsubscribeSubscriptions();
            // console.log("Web socket error...");
            this.errorHandlers.onWebSocketErrorHandler();
        };
        clientConfiguration.onWebSocketClose = (): void => {
            this.status = SocketStatus.DISCONNECTED;
            // This is what happens when we lose the
            // connection to the backend
            this.unsubscribeSubscriptions();
            // console.log("Web socket close...");
            // unsure if we want to error handle on a successful websocket close
            this.errorHandlers.onWebSocketCloseHandler();
        };
        clientConfiguration.onDisconnect = (): void => {
            this.status = SocketStatus.DISCONNECTED;
            this.unsubscribeSubscriptions();
            // console.log("Web socket disconnect...");
        };
        clientConfiguration.reconnectDelay = 50000;

        if (this.errorHandlers.debug) {
            clientConfiguration.debug = this.errorHandlers.debug;
        }
        return clientConfiguration;
    };
}
