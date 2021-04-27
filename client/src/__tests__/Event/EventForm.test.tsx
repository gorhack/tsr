import React from "react";
import { EventForm } from "../../Event/EventForm";
import { render, screen } from "@testing-library/react";
import { getInputValue, makeEvent, makeEventType, makeOrganization } from "../TestHelpers";

describe("Event Form", () => {
    it("when passed an event, uses it to autofill input fields", () => {
        const dateToInput = new Date("2020-10-18T00:00:01").toLocaleDateString();
        const eventType1 = makeEventType({
            eventTypeId: 1,
            displayName: "test type",
            sortOrder: 1,
        });
        const tsrEvent = makeEvent({
            eventId: 1,
            eventName: "name",
            organizations: [
                makeOrganization({
                    organizationId: 2,
                    organizationDisplayName: "second",
                    sortOrder: 2,
                }),
            ],
            startDate: new Date(dateToInput).toJSON(),
            endDate: new Date(dateToInput).toJSON(),
            eventType: eventType1,
        });
        render(<EventForm event={tsrEvent} />);

        expect(getInputValue(screen.getByLabelText("start date"))).toContain(dateToInput);
        expect(getInputValue(screen.getByLabelText("end date"))).toContain(dateToInput);
    });
});
