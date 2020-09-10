import React, { useContext, useEffect, useState } from "react";
import { ErrorHandlers, SocketService } from "./SocketService";
import { doNothing } from "./Helpers/Helpers";

interface StompSocketContextProps {
    webSocketPath?: string;
    inputSocketService?: SocketService;
}

interface StompSocketContextType {
    socketService: SocketService;
    hasError: boolean;
}

export const SocketContext = React.createContext<StompSocketContextType>({
    socketService: new SocketService({ create: false }),
    hasError: false,
});

export const useStompSocketContext = (): StompSocketContextType => {
    return useContext(SocketContext);
};

export const StompSocketProvider: React.FC<StompSocketContextProps> = ({
    webSocketPath,
    inputSocketService,
    children,
}) => {
    const [hasError, setHasError] = useState(false);
    const makeErrorHandlers = (): ErrorHandlers => {
        return {
            onWebSocketCloseHandler: doNothing,
            onDisconnectHandler: doNothing,
            onWebSocketErrorHandler: (): void => {
                setHasError(true);
            },
            onStompErrorHandler: (): void => {
                setHasError(true);
            },
        };
    };

    const socketService =
        inputSocketService ||
        new SocketService({
            webSocketPath,
            errorHandlers: makeErrorHandlers(),
        });
    useEffect((): (() => void) => {
        return (): void => {
            socketService.shutdown();
        };
    }, [socketService]);
    return (
        <SocketContext.Provider value={{ socketService, hasError }}>
            {children}
        </SocketContext.Provider>
    );
};
