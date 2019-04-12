import React, { define } from 'react-type-r';
import cx                from 'classnames';
import { Collection }    from 'type-r';
import * as ReactDOM     from 'react-dom';
import { Button }        from 'ui/Controls';
import { Scrollbars }    from 'ui/Layout';

@define
export class Dialog extends React.Component {
    static state = {
        //    wx: 0,
        //      wy: 0,
        //    h: 0,
        w        : 0,
        //    t: 0,
        l        : 0,
        is_shown : false
    };

    componentWillMount() {
        const wx = $( window ).width();
        let w = this.props.width || 600;

        if( w && w.substr && w.substr( -1 ) === '%' ) {
            w = parseInt( w ) * wx / 100;
        }

        this.state.set( {
            //      wx,
            //  wy: $( window ).height(),
            //  h : this.props.height || 0,
            w
        } );

        //  this.props.height && this.setHeight( this.props.height );
    }

    componentDidMount() {
        const { is_shown } = this.state;

        if( !is_shown ) {
            this.setHeight( $( this.refs.dialog ).height() );
        }

        $( window ).on( 'keydown', this.onKeypress )
    }

    componentWillUnmount() {
        $( window ).off( 'keydown', this.onKeypress )
    }

    onKeypress = e => {
        if( this.state.is_shown && e.keyCode === 27 ) {
            this.onClose();
        }
    };

    setHeight( height ) {
        // const { wy } = this.state,
        //   h = Math.min( wy - 50, height ) + 10,
        //   t = ( wy - h ) / 2;

        this.state.set( {
            is_shown : true
            //  h, t
        } )
    }

    onClose() {
        const { onClose } = this.props;

        if( _.isFunction( onClose ) ) {
            onClose();
        }
    }

    render() {
        const {
                className, title, modal, minWidth, maxWidth, height, buttons, onClose, children
            } = this.props,
            { wx, t, h, w, is_shown } = this.state,
            style = { width : w, minWidth, maxWidth };

        if( height ) {
            style.maxHeight = height;
        }

        const dialog =
            <div className='rc_dialog_box' key={0}>
                <div
                    className={ cx( 'rc_dialog', {
                        rc_modal      : modal,
                        preparing     : !is_shown,
                        'with-footer' : buttons
                    }, className ) }
                    key={ 0 }
                    ref='dialog'
                    style={ style }>
                    <div className='rc_dialog_header'>
                        { onClose && <div className='close_x' onClick={ () => this.onClose() }>x</div> }
                        { title }
                    </div>
                    <div className='rc_dialog_body' ref='body'
                         style={ height ? { height } : null }> {
                        height ? <Scrollbars>{ children }</Scrollbars> : children
                    }</div>
                    { buttons ?
                        <div className='rc_dialog_footer'>{
                            _.map( _.pairs( buttons ), ( [ label, obj ], index ) =>
                                <Button label={ label }
                                        key={ index }
                                        onClick={ _.isFunction( obj ) ? () => obj() : _.isObject( obj ) ? () => obj.onClick() : null }/> )
                        }
                        </div> : void 0
                    }
                </div>
            </div>;

        if( modal ) {
            const fog = <div className='rc_dialog_fog' key={ 1 }/>;

            return [ fog, dialog ];
        } else {
            return dialog;
        }
    }
}

export const CreateDialog = ( { buttons, body, title, modal = true, ...specs } ) => {
    const node = $( '<div>' ).appendTo( $( document.body ) ).get( 0 ),
        onClose = () => {
            ReactDOM.unmountComponentAtNode( node );
        },
        _buttons = buttons && _.mapObject( buttons, ( handler, label ) => function() {
                const res = handler();
                onClose();
                return res;
            }
        );

    ReactDOM.render( <Dialog
        title={ title }
        buttons={ _buttons }
        modal={ modal }
        onClose={ onClose }
        { ...specs }
    >
        { body }
    </Dialog>, node );
};