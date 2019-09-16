import React, { define } from 'react-mvx'
import cx from 'classnames'

@define
export class FormControl extends React.Component {
    static context = {
        disabled : Boolean,
        readOnly : Boolean
    };

    static childContext = {
        disabled : Boolean,
        readOnly : Boolean
    };

    isDisabled() {
        const { props, context }         = this,
              { checkedLink, valueLink } = props,
              value                      = checkedLink ? checkedLink.value : (valueLink ? valueLink.value : void 0);
        return !_.isUndefined( props.forceDisabled ) ? props.forceDisabled :
               context.disabled === true || this.isReadOnly() ? true :
               (props.disabled || (value === null && !this.props.nothing));
    }

    isReadOnly() {
        const { props, context } = this;
        return context.readOnly === true ? true : props.readOnly;
    }

    getChildContext() {
        return { disabled : this.isDisabled(), readOnly : this.isReadOnly() };
    }
}

@define
export class Form extends FormControl {
    render() {
        const { className, children } = this.props;
        return <div className={cx( 'form', className, { disabled : this.isDisabled() } )}>{children}</div>;
    }
}

@define
export class FormRow extends FormControl {
    render() {
        const { className, units, label, children } = this.props;
        return (
            <div className={cx( 'rc_form_row', className, { disabled : this.isDisabled() } )}>
                {label ? <div className='label'>{label}</div> : void 0}
                <div className="form_row_body">
                    <div className="form_row_control">
                        { children }
                    </div>
                    { units && <div className="form_row_units">{ units }</div> }
                </div>
            </div>);
    }
}