import React, { ReactElement, useContext, useState } from "react";
import { DrawerIcon } from "../Icons/DrawerIcon";
import "./DrawerMenu.css";
import { LinkButton } from "../Buttons/Buttons";
import { DrawerCloseIcon } from "./DrawerCloseIcon";
import { NavLink } from "react-router-dom";
import LogoBold from "../Icons/TrackedIconBold.svg";
import UserContext from "../Users/UserContext";

export const DrawerMenu: React.FC = (): ReactElement => {
    const tsrUser = useContext(UserContext);
    const [drawerOpen, setDrawerOpen] = useState<true | false>(false);
    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    return (
        <>
            <LinkButton
                aria-label="open menu"
                className="PrimaryNavigationInfo"
                onClick={openDrawer}
            >
                <DrawerIcon />
            </LinkButton>
            {drawerOpen && (
                <>
                    <div
                        aria-label="close menu"
                        data-testid="drawer-overlay"
                        className="DrawerMenu-overlay fade-in"
                        onClick={closeDrawer}
                    />
                    <div className="DrawerMenu-container pull-drawer-open">
                        <div className="DrawerMenu-header-bar flex-row">
                            <NavLink className="DrawerMenu-Logo-Link" to="/" onClick={closeDrawer}>
                                <img
                                    className="DrawerMenu-Logo"
                                    src={LogoBold}
                                    alt=""
                                    height="30"
                                />
                                <span>tsr</span>
                            </NavLink>
                            <LinkButton aria-label="close menu" onClick={closeDrawer}>
                                <DrawerCloseIcon className={"DrawerMenu-CloseIcon"} />
                            </LinkButton>
                        </div>
                        {tsrUser ? (
                            <>
                                <div className="DrawerMenu-section">
                                    <p aria-label={"organizations section"}>Organizations</p>
                                    {tsrUser.settings.organizations.map((org) => {
                                        return (
                                            <NavLink
                                                key={`${tsrUser.username}-${org.organizationDisplayName}`}
                                                to={`organization/${org.organizationId}`}
                                            >
                                                {org.organizationDisplayName}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <></>
                        )}

                        <div className="DrawerMenu-section">
                            <p aria-label="settings section">Settings</p>
                            <NavLink
                                className="DrawerMenu-section-link"
                                to="/settings"
                                onClick={closeDrawer}
                            >
                                user settings
                            </NavLink>
                        </div>
                        <div className="DrawerMenu-section">
                            <p aria-label="settings section">Support</p>
                            <NavLink
                                className="DrawerMenu-section-link"
                                to="/about"
                                onClick={closeDrawer}
                            >
                                about us
                            </NavLink>
                            <a
                                className="DrawerMenu-section-link"
                                rel="noopener noreferrer"
                                href="https://github.com/gorhack/tsr#readme"
                                target="_blank"
                                onClick={closeDrawer}
                            >
                                contribute
                            </a>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

DrawerMenu.displayName = "DrawerMenu";
