import React, { ReactElement } from "react";
import "./Footer.css";
import { MenuButton } from "../Buttons/Buttons";
import { useHistory } from "react-router";

export const Footer: React.FC = (): ReactElement => {
    const history = useHistory();
    return (
        <div className={"Footer"}>
            <span className={"Footer-Container"}>
                <MenuButton onClick={() => history.push("/about")}>About</MenuButton>
                <MenuButton>
                    <a
                        href={"https://github.com/gorhack/tsr#readme"}
                        target={"_blank"}
                        rel="noopener noreferrer"
                    >
                        Contribute
                    </a>
                </MenuButton>
            </span>
        </div>
    );
};

Footer.displayName = "Footer";
