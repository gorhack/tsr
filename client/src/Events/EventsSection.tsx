import React, { ReactElement } from "react";
import { getAllEvents } from "./EventApi";

export const EventsSection = (): ReactElement => {
    const events = await getAllEvents();
    return (
        <>
            <h1>Heading for Events</h1>
            <div>{events}</div>
        </>
    );
};
