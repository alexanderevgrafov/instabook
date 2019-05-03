import React, { define }  from 'react-type-r'
import cx                 from 'classnames'
import { Motion, spring } from 'react-motion'
import Page               from 'app/Page'
import { _t }             from 'app/translate'

const PANEL_OPEN_SIZE = 305,
      PANEL_MOBILE_OPEN_SIZE = 95,
    PANEL_FOLD_SIZE = 30;

@define
export default class LeftMiddleRight extends React.Component {
    static props = {
        leftIsOpen       : true,
        rightIsOpen      : true,
        animated         : true,
        onToggleRight    : Function,
        onToggleLeft     : Function,
        left             : null,
        right            : null,
        onToggleFinished : Function,
        leftPanelWidth   : Number.value(0).has.watcher( function(x) {
            this.state.leftPanelWidth = x
        }),
        rightPanelWidth   : Number.value(0).has.watcher( function(x) {
            this.state.rightPanelWidth = x
        }),
    };

    static state = {
        leftIsOpen  : true,
        rightIsOpen : true,
        leftPanelWidth   : 0,
        rightPanelWidth  : 0,
    };

    componentWillMount() {
        const { leftIsOpen, rightIsOpen, leftPanelWidth, rightPanelWidth } = this.props;

        this.state.set( {
            leftIsOpen  : leftIsOpen,
            rightIsOpen : rightIsOpen,
            leftPanelWidth   : leftPanelWidth || (Page.isMobile() ? PANEL_MOBILE_OPEN_SIZE : PANEL_OPEN_SIZE),
            rightPanelWidth  : rightPanelWidth || (Page.isMobile() ? PANEL_MOBILE_OPEN_SIZE : PANEL_OPEN_SIZE),
        } );

        this.listenTo( this.state, 'change', this.forceResizeAnimation );
    }

    getIsAnimated() {
        //workaround for IE, as page can contain activeX player, which does not work good with constant rendering
        const { animated } = this.props;
        return _.isUndefined( animated ) ? !api.isIE : animated;
    }

    // Required for resizable components to behave correct.
    forceResizeAnimation() {
        if( this.getIsAnimated() ) {
            _.delay( () => Page.forceResize(), 150 );
            _.delay( () => Page.forceResize(), 280 );
            _.delay( () => Page.forceResize(), 400 );
        }
        _.delay( () => Page.forceResize(), 500 );
    }

    toggleRight( set ) {
        this.state.rightIsOpen = _.isUndefined( set ) ? !this.state.rightIsOpen : set;
        _.isFunction( this.props.onToggleRight ) && this.props.onToggleRight( this.state.rightIsOpen );
    }

    toggleLeft( set ) { /* TODO implement same possibility to block toggle for right panel */
        let next = _.isUndefined( set ) ? !this.state.leftIsOpen : set;
        if( _.isFunction( this.props.onToggleLeft ) ) {
            if( this.props.onToggleLeft( next ) === false ) {
                return;
            }
        }
        this.state.leftIsOpen = next;
    }

    componentDidUpdate( prevProps, prevState ) {
        const { left, right, onToggleFinished } = this.props,
              { leftPanelWidth, rightPanelWidth } = this.state,
            animated = this.getIsAnimated();

        if( Boolean( prevProps.left ) !== Boolean( left ) || Boolean( prevProps.right ) !== Boolean( right ) ) {
            this.forceResizeAnimation();
        }

        if( !animated && onToggleFinished &&
            (prevState.leftPanelWidth !== leftPanelWidth || prevState.rightPanelWidth !== rightPanelWidth ||
                prevState.leftIsOpen !== this.state.leftIsOpen || prevState.rightIsOpen !== this.state.rightIsOpen) ) {
            _.defer( onToggleFinished );
        }
    }

    render() {
        const {
                className, left, right, children, title, titleHint,
                  leftTitle, rightTitle, titleRight, onToggleFinished
            } = this.props,
            { leftIsOpen, rightIsOpen, leftPanelWidth, rightPanelWidth } = this.state,
            animated = this.getIsAnimated(),

            leftWidth = left ? (leftIsOpen ? leftPanelWidth : PANEL_FOLD_SIZE) : 0,
            rightWidth = right ? (rightIsOpen ? rightPanelWidth : PANEL_FOLD_SIZE) : 0;


        return (
            <Motion
                onRest={ () => {
                    Page.forceResize();
                    onToggleFinished && onToggleFinished()
                } }
                style={ {
                    leftWidth            : animated ? spring( leftWidth ) : leftWidth,
                    rightWidth           : animated ? spring( rightWidth ) : rightWidth,
                    leftCloseVisibility  : spring( left && !leftIsOpen ? 1 : 0 ),
                    rightCloseVisibility : spring( right && !rightIsOpen ? 1 : 0 )
                } }>
                { motionInterpolator =>
                    <div className={ cx( 'lmr', className ) }>
                        { left ?
                            <div className='lmr-left'
                                 style={ { width : motionInterpolator.leftWidth } }>
                                <div className='lmr-body'
                                     style={ {
                                         width   : leftPanelWidth,
                                         left    : motionInterpolator.leftWidth - (leftPanelWidth - (left && !leftIsOpen ? PANEL_FOLD_SIZE : 0)),
                                         display : motionInterpolator.leftWidth > PANEL_FOLD_SIZE + 1 ? 'block' : 'none'
                                     } }>
                                    <div className='lmr-toggle' onClick={ () => this.toggleLeft() } title={ _t( 'ui.foldable' ) }>
                                        <div className='title'>{ leftTitle }</div>
                                        <div className='arrow'/>
                                    </div>
                                    <div className='lmr-content'>{ left }</div>

                                </div>
                                <div className='lmr-close'
                                     style={ {
                                         display : left && motionInterpolator.leftWidth < leftPanelWidth - 5 ? 'block' : 'none',
                                         opacity : motionInterpolator.leftCloseVisibility
                                     } }
                                     onClick={ () => this.toggleLeft() }>
                                    <div className='lmr-vertical'><span>{ leftTitle }</span></div>
                                </div>
                            </div>
                            : void 0 }
                        <div
                            className='lmr-middle'
                            style={ { left : motionInterpolator.leftWidth, right : motionInterpolator.rightWidth } }
                        >
                            <div className='lmr-header'>
                                <div className='lmr-header-title'
                                     title={ titleHint || title }>{ title }
                                </div>
                                { titleRight &&
                                <div className='lmr-header-controls'>
                                    { titleRight }
                                </div>
                                }
                            </div>
                            <div className='lmr-middle-content'>
                                { children }
                            </div>
                        </div>
                        { right ?
                            <div className='lmr-right'
                                 style={ { width : motionInterpolator.rightWidth } }>
                                <div className='lmr-body'
                                     style={ {
                                         width   : rightPanelWidth,
                                         display : motionInterpolator.rightWidth > PANEL_FOLD_SIZE + 1 ? 'block' : 'none',
                                         right   : motionInterpolator.rightWidth - (rightPanelWidth - ((right && !rightIsOpen) ? PANEL_FOLD_SIZE : 0))
                                     } }
                                >
                                    <div className='lmr-toggle' onClick={ () => this.toggleRight() } title={ _t( 'ui.foldable' ) }>
                                        <div className='title'>{ rightTitle }</div>
                                        <div className='arrow'/>
                                    </div>
                                    <div className='lmr-content'>{ right }</div>

                                </div>
                                <div className='lmr-close'
                                     style={ {
                                         display : right && motionInterpolator.rightWidth < rightPanelWidth - 5 ? 'block' : 'none',
                                         opacity : motionInterpolator.rightCloseVisibility
                                     } }
                                     onClick={ () => this.toggleRight() }>
                                    <div className='lmr-vertical'><span>{ rightTitle }</span></div>
                                </div>
                            </div>

                            : void 0 }
                    </div>
                }
            </Motion>
        );
    }
}