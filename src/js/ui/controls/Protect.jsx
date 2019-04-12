import React, { define } from 'react-type-r'

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