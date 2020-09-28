import React from "react";
import { render, RenderResult, screen } from "@testing-library/react";
import { Router } from "react-router";
import { Footer } from "../../Navigation/Footer";
import { fireEvent } from "@testing-library/dom";
import { createMemoryHistory, MemoryHistory } from "history";

describe("Footer", () => {
    it("has about/contribute links", async () => {
        const history = createMemoryHistory();
        await renderFooter({ history });
        expect(screen.getByText("Contribute")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "About" }));
        expect(history.location.pathname).toEqual("/about");
    });
});

interface renderFooterProps {
    history: MemoryHistory;
}

const renderFooter = async ({ history }: renderFooterProps): Promise<RenderResult> => {
    history.push("/");
    return render(
        <Router history={history}>
            <Footer />
        </Router>,
    );
};
