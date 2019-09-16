import React, { define } from 'react-mvx'
import * as ReactDOM from 'react-dom'

@define
class FormControl extends React.Component {
    static context = {
        disabled : Boolean,
        readOnly : Boolean
    };

    static childContext = {
        disabled : Boolean,
        readOnly : Boolean
    };

    isDisabled(){
        const { props, context }         = this,
              { checkedLink, valueLink } = props,
              value                      = checkedLink ? checkedLink.value : (valueLink ? valueLink.value : void 0);
        return !_.isUndefined( props.forceDisabled ) ? props.forceDisabled :
               context.disabled === true || this.isReadOnly() ? true :
               (props.disabled || (value === null && !this.props.nothing));
    }

    isReadOnly(){  /* Same as disable but allow to use different control style (to increase readAbility of descr+val */
        const { props, context } = this;
        return context.readOnly === true ? true : props.readOnly;
    }

    getChildContext(){
        return { disabled : this.isDisabled(), readOnly : this.isReadOnly() };
    }
}

const control_focus_mixin = {
    _is_hovered : false,

    componentDidMount(){
        $( ReactDOM.findDOMNode( this ) ).bind( 'mouseenter.is_hovered_check', () =>{
            this._is_hovered = true;
        } ).bind( 'mouseleave.is_hovered_check', () =>{
            this._is_hovered = false;
        } );
    },

    componentWillUnmount(){
        $( ReactDOM.findDOMNode( this ) ).unbind( '.is_hovered_check' );
    },

    isHovered(){
        return this._is_hovered;
    }
};

export { control_focus_mixin, FormControl };