import React, { define } from 'react-mvx'
import { FormControl }   from './FormControl'
import cx                from 'classnames';

@define
export class Toggle extends FormControl {
    onClick = e => {
        const { checkedLink, checked, onClick } = this.props;

        e && e.stopPropagation();

        if( checkedLink ) {
            this.isDisabled() || checkedLink.update( x => !x );
        } else {
            onClick && onClick( e, !checked );
        }
    };

    render() {
        const { checkedLink, className, title, label, ...props } = this.props;
        return (
            <div onClick={ this.onClick } title={ title }
                 className={ cx( className,
                     {
                         selected: ( checkedLink && checkedLink.value ) || props.checked,
                         disabled: !this.isReadOnly() && this.isDisabled(),
                         readOnly: this.isReadOnly()
                     } ) }>
                { label || props.children }
            </div>
        );
    }
}

export const Checkbox = ( { control = 'r-checkbox', children, ...props } ) => (
    <Toggle { ...props } className={ cx( props.className, control ) }>
        <span/>
        { children }
    </Toggle>
);

@define
export class Radio extends FormControl {
    render() {
        const { children, className, checkedLink, ...p } = this.props;

        return checkedLink ?
            <div className={ classNames( this, 'r-checkbox radio' ) }
                 title={ p.title }
                 onClick={ () => {
                     this.isDisabled() || checkedLink.set( true )
                 } }>
                <span/>
                { children }
            </div> :
            <Toggle { ...p }
                    className={ cx( className, 'r-checkbox radio' ) }>
                <span/>
                { children }
            </Toggle>
    }
}

