import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Events/EventsSection";
import { getUserInfo, TsrUser } from "./Users/UserApi";

export const Home: React.FC = () => {
    const history = useHistory();
    const [tsrUser, setTsrUser] = useState<TsrUser>({
        userId: "",
        username: "",
        role: "USER",
    });

    useEffect((): void => {
        (async (): Promise<void> => {
            try {
                const user = await getUserInfo();
                setTsrUser(user);
            } catch (e) {
                console.error(`error retrieving user, ${e.message.error}`);
            }
        })();
    }, [setTsrUser]);

    return (
        <>
            <div>
                <div>{tsrUser.userId}</div>
                <div>{tsrUser.username}</div>
            </div>
            <button className={"basic-button"} onClick={() => history.push("/createEvent")}>
                Create an Event
            </button>
            <EventsSection user={tsrUser} />
        </>
    );
};
