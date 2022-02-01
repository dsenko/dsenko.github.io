import React from "react";
import {DefaultProps, DefaultState, State} from "../state";
import {InputText} from "primereact/inputtext";

interface ProtectProps extends DefaultProps {
    password: string;
    disable: boolean;
}

interface ProtectState extends DefaultState {
    password: string;
}

export class Protect extends State<ProtectProps, ProtectState> {

    state: ProtectState = {
        password: ''
    }

    private setPassword(password: string) : void {

        this.setState({
            password: password
        });

    }

    render() : JSX.Element {

        if (this.props.password === this.state.password || this.props.disable) {
            return <>{this.props.children}</>;
        }

        return <div className="flex justify-content-center align-items-center">
            <label className="mr-2">Password</label>
            <InputText value={this.state.password} onChange={(e) => this.setPassword(e.target.value)}/>
        </div>

    }


}
