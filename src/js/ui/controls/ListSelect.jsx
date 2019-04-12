import React, { define } from 'react-type-r'
import * as ReactDOM from 'react-dom'
import { Collection } from 'type-r';
import { Checkbox, } from './Checkboxes';
import { Button } from './Button';
import { VerticalColumn } from '../layout/Columns';
import cx from 'classnames'

@define
class ListSelectCore extends React.Component {
    static props = {
        all         : Collection,
        selected    : Collection.has.changeEvents( true ),
        onItemClick : Function,
        className   : ''
    };

    onItemClick( model, state ) {
        /*
                if( state === true && this.props.limitSelected === this.props.selected.length ){
                    return;
                }
        */
        this.props.onItemClick( this.props, model, state );
    }

    renderList() {
        const { all, selected, className } = this.props;

        return <div className={cx( 'r-select-list', className )}>{
            all.map( item =>
                <Checkbox checked={selected.get( item )}
                          onClick={( e, state ) => this.onItemClick( item, state )}
                          key={item.id}>{item.name}</Checkbox>
            )
        }</div>
    }

    render() {
        return this.renderList()
    }
}

@define
export class MultiSelect extends ListSelectCore {
    static props = {
        all         : Collection.has.changeEvents( true ),
        selected    : Collection.has.changeEvents( true ),
        onItemClick : Function.value( ( props, model, state ) => {
            if( props.minSelected && !state && props.selected.length <= props.minSelected ) {
                return;
            }
            props.selected && props.selected[ state ? 'add' : 'remove' ]( model, {} );
        } ),
        className   : ''
    };

    render() {
        return <ListSelectCore {...this.props}/>
    }
}

@define
class PopupBody extends React.Component {
    static props = {
        onOk       : Function.value( () => {} ),
        onCancel   : Function.value( () => {} ),
        showOk     : true,
        cancelText : '',
        position   : 'right',
        scrollable : false
    };

//     static state = {
//         open : false
//     };
//
//     toggle( open ) {
//         this.state.open = open;
//         this.state.open && ;
// //        this.state.open && _.defer( () => Page.forceResize() );
//     }
    componentDidMount() {
        this.updatePosition()
    }

    // isOpen() {
    //     return this.state.open;
    // }

    updatePosition() {
        const $el          = $( this.props.anchor_elem ),
              pos          = $el.offset(),
              box          = $( this.refs.this_el ),
              body         = box.find( '.body' ),
              distToBottom = $( window ).height() - pos.top - body.outerHeight() - 10;

        if( this.props.position === 'top' ) {
            pos.left -= 10;
            pos.top -= (distToBottom + body.outerHeight() + 7);

        }
        else if( this.props.position === 'left' ) {
            pos.left -= box.width();
        } else {
            pos.left += $el.width();
        }

        box.css( {
            left  : pos.left,
            top   : pos.top,
            right : 'auto'
        } );

        if( pos.left + box.width() + parseInt( box.css( 'marginLeft' ) ) > $( window ).width() ) {
            box.css( {
                left  : 'auto',
                right : 0
            } );
        }

        if( distToBottom < 0 ) {
            body.css( { marginTop : distToBottom } );
        }
    }

    render() {
        const { position, popupTitle, scrollable, cancelText, onOk, onCancel, showOk, children } = this.props;

        return <div className={cx( 'r-multi-selection-popup', {
            openLeft : position === 'left',
            openTop  : position === 'top',
            open     : true
        } )}
                    ref='this_el'
        >{scrollable ?
          <VerticalColumn className='body scrollable'
                          top={popupTitle ? <div className='header'>{popupTitle}</div> : void 0}
                          bottom={<div>
                              {showOk ? <Button className='compact center' onClick={onOk}>OK</Button> : void 0}
                          </div>}>
              {children}
          </VerticalColumn> :
          <div className='body'>
              {popupTitle ? <div className='header'>{popupTitle}</div> : void 0}
              {children}
              <div>
                  {showOk ? <Button className='compact center' onClick={onOk}>OK</Button> : void 0}
              </div>
          </div>
        }
        </div>
    }
}

//                                 <Button className='compact' onClick={onCancel}>{cancelText || 'Отмена'}</Button>

@define
export class MultiPopupSelect extends React.Component {
    static props = {
        all           : Collection.has.changeEvents( true ),
        title         : 'title',
        isMultiSelect : true,
        selected      : Collection.has.changeEvents( true ),
        selectedLink  : null,
        emptyText     : '',
        minSelected   : 0
    };

    static state = {
        isOpen : false
    };

    componentDidMount() {
        this.popblock = $( '<div>' ).appendTo( document.body );

        $( window ).on( {
            'click'   : this.onWinClick,
            'keydown' : this.onKeyDown
        } );
    }

    /*
        componentDidUpdate() {
            this.renderPopupComponent();
        }
    */
    componentWillUnmount() {
        this.destroyPopupComponent();
        this.popblock.remove();

        $( window ).off( {
            'click'   : this.onWinClick,
            'keydown' : this.onKeyDown
        } );
    }

    defaultPopupProps() {
        return _.extend(
            {
                anchor_elem : this.refs.this_el,
                onOk        : () => this.toggle( false ),
                onCancel    : () => this.toggle( false ),
            },
            _.pick( this.props, 'popupTitle', 'position', 'showOk', 'cancelText' )
        );
    }

    renderPopupComponent() {
        ReactDOM.render( this.renderPopup(), this.popblock.get( 0 ) );
    }

    destroyPopupComponent() {
        ReactDOM.unmountComponentAtNode( this.popblock.get( 0 ) );
    }

    toggle( force ) {
        if( _.result( this, 'isDisabled' ) && force !== false ) {
            return;
        }

        if( this.state.isOpen = force === void 0 ? !this.state.isOpen : force ) {
            this.renderPopupComponent()
        } else {
            this.destroyPopupComponent()
        }
    }

    onWinClick = e => {
        this.state
        && this.state.isOpen
        && !$( e.target ).closest( this.refs.this_el ).length /* not my own <input> */
        && !$( e.target ).closest( this.popblock ).length  /* not inside my own popup <div> */
        && $( e.target ).closest( 'body' ).length /* detached from dom */
        && this.toggle( false );
        return true;
    };

    onBlur = e => {
        e.relatedTarget
        && !this.isIgnoreCloseOnBlur( e )
        && !$( e.relatedTarget ).closest( this.popblock ).length  /* not inside my own popup <div> */
        && this.toggle( false );
    };

    onKeyDown = e => {
        const keycode = (e.keyCode ? e.keyCode : e.which);
        this.state && this.state.isOpen && keycode === 27 && this.toggle( false );
        return true;
    };

    renderPopup() {
        return (
            <PopupBody {... this.defaultPopupProps()}
                       onCancel={() => {
                           // if( this.props.cancelRevertsSelection && this.props.selectedLink ){
                           //     const prev = this.props.selectedLink.value
                           //                  && this.props.selectedLink.value._previousAttributes
                           //                  && this.props.selectedLink.value._previousAttributes[
                           // this.props.selectedLink.attr ]; prev && this.props.selectedLink.set( prev ); } if
                           // (this.props.cancelRevertsSelection && this.props.selected) {
                           // this.props.selected.reset(this._previousSelection); }  if
                           // (this.props.cancelRevertsSelection && this.props.usePreviousSelection &&
                           // this.props.selectedLink) { this.props.selectedLink.set(this._previousSelection); }
                           this.toggle( false );
                       }}
            >
                {this.props.isMultiSelect
                    ? <MultiSelect {...this.props} onBlur={this.onBlur}/>
                    : <SingleSelect {...this.props} onBlur={this.onBlur}/>
                }

            </PopupBody>
        )
    }

//     onOpenStateChanged( open ) {
//         if( open ) {
// //            this.props.selected && (this._previousSelection = this.props.selected.models.slice());
// //            this.props.usePreviousSelection && this.props.selectedLink && (this._previousSelection =
// // this.props.selectedLink.value); this.props.editable && this.refs.input.focus();
//             /*
//                         setTimeout(()=>{
//                             this.pop.$el.find('.filterWrap input').focus();
//                         }, 200);
//             */
//         }
//     }

    //mixin override
    isIgnoreCloseOnBlur( event ) {
        return $( event.relatedTarget ).closest( this.refs.input ).length
        /* not inside my own input */
    }

    makeText() {
        const { selected, emptyText, title, all } = this.props;
        /*
                if( selectedLink && !selected ) { // Single select case
                    if( !selectedLink.value ) {
                        return inputText || 'None';
                    } else {
                        return typeof title === 'function' ? title( this.props.selectedLink.value ) :
                               selectedLink.value[ this.props.title ];
                    }
                }
        */
//        if( selected ) { // Multiselect case
        if( selected.length === 0 ) {
            return emptyText || 'Не выбрано';
        } /*else if( selected.length === all.length && all.length > 1 ) {
            return inputText || 'Все';
                        } else if( selected.length === 1 ) {
                            let model = selected.first();
                            return typeof title === 'function' ? title( model ) : model[ title ];

        }*/ else {
            return selected.map( model => typeof title === 'function' ? title( model ) : model[ title ] ).join( ', ' );
        }
    }

    render() {
        const {
                  InputTag, position, inputTitle, className, all, editable, enableOpenIcon, selectedLink, valueLink,
                  ...inputProps
              } = this.props;
        // icon    = enableOpenIcon ? { arrow_right : onClick } : {};

        inputProps.Tag        = InputTag;
        inputProps.onBlur     = this.onBlur;
        inputProps.collection = all;

        return <div className={cx( 'r-multi-select', className )}
                    onClick={() => this.toggle( true )}
                    ref='this_el'
        >
            {this.makeText()}
        </div>;
    }

}