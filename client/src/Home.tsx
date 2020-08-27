import React from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Events/EventsSection";

export const Home: React.FC = () => {
    const history = useHistory();

    return (
        <>
            <button onClick={() => history.push("/createEvent")}>create an event</button>
            <EventsSection />
        </>
    );
};
