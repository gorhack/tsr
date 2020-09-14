import React from "react";
import { render, screen } from "@testing-library/react";
import { About } from "../About";

describe("About", () => {
    it("shows header", () => {
        render(<About />);
        expect(screen.getByText("about TSR").tagName).toEqual("H1");
    });
    it("shows link to github", () => {
        render(<About />);
        expect(screen.getByText("Contribute Open Source").getAttribute("href")).toEqual(
            "https://github.com/gorhack/tsr",
        );
    });
});
