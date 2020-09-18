import React, { ReactElement } from "react";
import { PrimaryButton } from "../../Buttons/Buttons";

export const EventTaskSection = (): ReactElement => {
    return (
        <>
            <h3 className="EventPage-Header">Event Requirements</h3>
            <PrimaryButton>add task</PrimaryButton>
        </>
    );
};
