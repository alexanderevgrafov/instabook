import React, { define } from 'react-mvx'
import { FormControl } from './FormControl'
import cx from 'classnames';

@define
export class Button extends FormControl {
    static props = {
        label     : String,
        className : String,
        disabled  : Boolean,
        valueLink : Object
    };

    componentDidMount(){
        if( this.props.autoFocus ){
            this.refs.button.focus();
        }
    }

    render(){
        let { children, className, label, onClick, ...props } = this.props;
        return (
            <button {...props}
                    ref="button"
                    className={ cx("r_button", {disabled: this.isDisabled()}, className) }
                    onClick={ e => this.isDisabled() || !_.isFunction( onClick ) ? false : onClick(e) }
                    type="button"
            >
                { label || children }
            </button>
        )
    }
}
