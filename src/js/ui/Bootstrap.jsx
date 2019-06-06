import React from 'react-type-r'
import {
    Form as BsForm,
    Card as BsCard,
    Button as BsButton
} from 'react-bootstrap';
import cx from 'classnames'

const Form = BsForm,
      Card = BsCard;

/*
FormRow= ({label, units, children, ...props}) =>
    <BsForm.Row { ...props }>
        { label !== undefined && <div  className='form_row_label'>{ label }</div> }
        <div className='form_row_body'>
            <div className='form_row_control'>
                { children }
            </div>
            { units && <div className='form_row_units'>{ units }</div> }
        </div>
    </BsForm.Row>;
*/

Form.ControlLinked = ( { valueLink, onChange, accepts, value, ...props } ) =>
    <BsForm.Control
        onChange={e => {
            if( !accepts || e.target.value.match( accepts ) ) {
                onChange && onChange( e );
                valueLink && valueLink.set( e.target.value );
            }
        }}
        value={valueLink ? valueLink.value : value}
        {...props}
    />;

Card.SquareImg = ( { src, className, ...props } ) =>
    <BsCard.Img
        as='div'
        className={cx( 'card_square_img', className )}
        style={{ backgroundImage : 'url(' + src + ')' }}
        {...props}
    />;



const MyButton = ( { label, children, ...props } ) =>
    <BsButton {...props}>{label || children}
    </BsButton>;

export { MyButton as Button }

export { Form, Card }
export * from 'react-bootstrap'