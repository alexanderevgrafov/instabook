import React, { define } from 'react-type-r/lib/index';
import { FormControl } from './FormControl'
import cx from 'classnames'

@define
export class Input extends React.Component {
    render() {
        const { valueLink, ...props } = this.props,
              Tag                     = props.type === 'number' ? NumberInput : TextInput;

        return <Tag {...props} valueLink={valueLink}/>;
    }
}

@define
export class TextInput extends React.Component {
    render() {
        const { accepts, onChange, valueLink, className, value, ...props } = this.props;
        return <div className={cx( 'r-input', { invalid: valueLink && valueLink.validationError }, className )}>
            <input {...props}
                   onKeyDown={e => {
                       props.onKeyDown && props.onKeyDown( e );
                   }}
                   onChange={e => {
                       if( !accepts || e.target.value.match( accepts ) ) {
                           onChange && onChange( e );
                           valueLink && valueLink.set( e.target.value );
                       }
                   }}
                   value={valueLink ? valueLink.value : value}
            />
        </div>
    }
}

@define
export class NumberInput extends React.Component {
    componentWillMount() {
        this.setAndConvert( this.props.valueLink.value );
    }

    componentWillReceiveProps( nextProps ) {
        const { valueLink: next } = nextProps;

        if( Number( this.props.valueLink.value ) === Number( this.value ) &&
            Number( next.value ) !== Number( this.value ) ) {
            this.setAndConvert( next.value ); // keep state being synced
        }
    }

    setValue( x ) {
        // We're not using native state in order to avoid race condition.
        this.value = String( x );
        this.error = isNaN( Number( x ) );
        this.forceUpdate();
    }

    setAndConvert( x ) {
        let value = Number( x );

        if( this.props.positive ) {
            value = Math.abs( x );
        }

        if( this.props.integer ) {
            value = Math.round( value );
        }

        this.setValue( value );
    }

    onKeyPress = e => {
        const { charCode }          = e,
              { integer, positive } = this.props,
              allowed               = (positive ? [] : [ 45 ]).concat(
                  integer ? [] : [ 46 ] );

        if( e.ctrlKey ) {
            return;
        }

        if( charCode && // allow control characters
            (charCode < 48 || charCode > 57) && // char is number
            allowed.indexOf( charCode ) < 0 ) { // allowed char codes
            e.preventDefault();
        }
    };

    onChange = e => {
        // Update local state...
        const { value }   = e.target,
              { accepts } = this.props;
        if( accepts && !value.match( accepts ) ) {
            return;
        }

        this.setValue( value );

        const asNumber = Number( value );

        if( value && !isNaN( asNumber ) ) {
            this.props.valueLink.update( x => {
                // Update link if value is changed
                if( asNumber !== Number( x ) ) {
                    return asNumber;
                }
            } );
        }
    };

    onBlur = () => {
        if( this.value === '' ) {
            this.setValue( 0 );
            this.props.valueLink.set( 0 );
        }
    };

    render() {
        const { type, invalid = 'invalid', className = '', valueLink, integer, positive, collection, accepts, ...props } = this.props;

        return <input {...props}
                      type='text'
                      className={cx( className, { invalid: this.error } )}
                      value={this.value}
                      onKeyPress={this.onKeyPress}
                      onBlur={this.onBlur}
                      onChange={this.onChange}/>;
    }
}

@define
export class TextArea extends FormControl {
    render() {
        const {
                  valueLink, value, onChange, className, showErrorText, ...props
              }        = this.props,
              val      = valueLink ? valueLink.value : value,
              required = valueLink &&
                         valueLink.validationError &&
                         valueLink.value === '';

        return (
            <div className={cx( 'r-textarea',
                {
                    required,
                    invalid: valueLink && valueLink.validationError
                }, className )}
            >
                <textarea
                    {...props}
                    disabled={props.disabled || this.isDisabled()}
                    onChange={valueLink ? (e => valueLink.set( e.target.value )) : onChange}
                    value={val}/>
                {valueLink && valueLink.validationError && showErrorText !== false ?
                 <div className='field_err_msg'>{required ? _t( 'com.required' ) : valueLink.validationError}</div>
                                                                                   : void 0
                }
            </div>
        )
    }
}
