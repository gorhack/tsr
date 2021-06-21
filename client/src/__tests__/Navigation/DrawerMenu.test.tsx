import React from "react";
import { render, RenderResult, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { DrawerMenu } from "../../Navigation/DrawerMenu";
import { findByAriaLabel } from "../TestHelpers";
import { createMemoryHistory, MemoryHistory } from "history";
import { Router } from "react-router";
import { UserContextProvider } from "../../Users/UserContext";

describe("Drawer menu", () => {
    const CLOSE_MENU_BUTTON_NAME = "open menu";
    const DRAWER_OVERLAY_TESTID = "drawer-overlay";
    it("displays button to open menu", () => {
        renderDrawer();
        expect(screen.getByRole("button", { name: CLOSE_MENU_BUTTON_NAME })).toBeVisible()
    });

    it("clicking menu button opens drawer", () => {
        const result = renderDrawer();
        fireEvent.click(screen.getByRole("button", { name: CLOSE_MENU_BUTTON_NAME }));
        expect(findByAriaLabel(result.container, "close menu")).toBeVisible();
        expect(screen.getByText("tsr")).toBeVisible();
    });

    it("clicking overlay closes the drawer", () => {
        const result = renderDrawer();
        const overlay = () => result.container.querySelector(`[aria-label="close menu"]`);

        expect(overlay()).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: CLOSE_MENU_BUTTON_NAME }));
        expect(overlay()).toBeVisible();
        fireEvent.click(findByAriaLabel(result.container, "close menu"));
        expect(overlay()).not.toBeInTheDocument();
    });

    describe("menu contents", () => {
        const setupMenu = (history: MemoryHistory = createMemoryHistory()): RenderResult => {
            const result = renderDrawer(history);
            fireEvent.click(result.getByRole("button", { name: CLOSE_MENU_BUTTON_NAME }));
            return result;
        };
        it("shows close button and tsr button", () => {
            const history = createMemoryHistory();
            setupMenu();
            expect(screen.getByRole("button", { name: "close menu" })).toBeVisible();
            expect(screen.getByText("tsr")).toBeVisible();
            fireEvent.click(screen.getByText("tsr"));
            expect(history.location.pathname).toEqual("/");
        });

        it("shows settings section", () => {
            const history = createMemoryHistory();
            setupMenu(history);
            expect(screen.getByText("Settings")).toBeVisible();
            fireEvent.click(screen.getByText("user settings"));
            expect(history.location.pathname).toEqual("/settings");
            expect(screen.queryByTestId(DRAWER_OVERLAY_TESTID)).toBeNull();
        });

        it("shows support section with contribute link", () => {
            setupMenu();
            expect(screen.getByText("Support")).toBeVisible();
            expect(screen.getByText("contribute").getAttribute("href")).toEqual(
                "https://github.com/gorhack/tsr#readme",
            );
            fireEvent.click(screen.getByText("contribute"));
            expect(screen.queryByTestId(DRAWER_OVERLAY_TESTID)).toBeNull();
        });

        it("shows about us link", () => {
            const history = createMemoryHistory();
            setupMenu(history);
            fireEvent.click(screen.getByText("about us"));
            expect(history.location.pathname).toEqual("/about");
            expect(screen.queryByTestId(DRAWER_OVERLAY_TESTID)).toBeNull();
        });

        it('has logout button with appropriate href', () => {
            setupMenu()

            expect(screen.getByRole('link', { name: "Logout"})).toBeVisible()
            expect(screen.getByRole('link', { name: 'Logout'})).toHaveAttribute('href', '/logout')
        })
    });

    const renderDrawer = (history: MemoryHistory = createMemoryHistory()): RenderResult => {
        history.push("/somewhere");

        return render(
            <UserContextProvider>
                <Router history={history}>
                    <DrawerMenu />
                </Router>
            </UserContextProvider>,
        );
    };
});
