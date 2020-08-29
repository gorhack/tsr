import { render, screen } from "@testing-library/react";
import { Home } from "../Home";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";

describe("home page of the application", () => {
    it("create an event button goes to create event page", () => {
        const history = createMemoryHistory();
        history.push("/");
        render(
            <Router history={history}>
                <Route path="/">
                    <Home />
                </Route>
            </Router>,
        );
        screen.getByText("Create an Event").click();
        expect(history.location.pathname).toEqual("/createEvent");
    });
});
