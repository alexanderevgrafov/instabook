import React, { define } from 'react-mvx'

@define
export class Protect extends React.Component {
    static pureRender = true;
    static props = {
        nodes : null
    };

    render(){
        return <span>{this.props.nodes}</span>;
    }
}