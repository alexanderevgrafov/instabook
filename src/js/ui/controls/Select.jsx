import React, { define } from 'react-mvx'

@define
export class Select extends React.Component {
    render(){
        const { valueLink, children, onChange, ...props } = this.props;
        return <select
            onChange={ onChange ? onChange : e => valueLink && valueLink.set( e.target.value )}
            value={valueLink && valueLink.value}
            {...props}
        >
            {children}
        </select>;
    }
}