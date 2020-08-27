import { render } from "@testing-library/react";
import React from "react";
import { EventsSection } from "../../Events/EventsSection";

describe("home page of the application", () => {
    it("lists all created events", () => {
        const result = render(<EventsSection />);

        console.log(result.container.innerHTML);
        expect(result.getByText("event1")).toBeInTheDocument();
    });
});
