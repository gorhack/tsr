import React from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Events/EventsSection";

export const Home: React.FC = () => {
    const history = useHistory();

    return (
        <>
            <button className={"basic-button"} onClick={() => history.push("/createEvent")}>
                Create an Event
            </button>
            <EventsSection />
        </>
    );
};
