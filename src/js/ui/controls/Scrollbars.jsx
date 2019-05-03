import React, { define, mixins } from 'react-type-r';
import { control_focus_mixin, FormControl } from './Common.jsx';
import { Protect } from './Protect.jsx'
import Page from 'app/Page'
import * as _ from 'underscore';
import cx from 'classnames';
import './scrollbars.less';

const eventClassName = '.vscrollbar';

const KEY_SPEED                = 20,
      KEY_PAGE_SPEED_COOF      = 4, /* multiplier to keySpeed for pageUp/Down keys*/
      KEY_HOLD_INITIAL_TIMEOUT = 1000,
      KEY_HOLD_INTERVAL        = 30,
      WHEEL_SPEED              = .6
;

export const KEYBOARD_EVENTS_PRIORITY = 100;

@define
@mixins( control_focus_mixin )
export class ScrollbarsBase extends FormControl {
    static displayName = 'ScrollbarsBase';

    static props = {
        horizontal : false,
        vertical   : true,
        position   : Object, //INITIAL position
        className  : String,
        onKeyUp    : Function,
        onKeyDown  : Function,
        onScroll   : Function
    };

    static state = {
        yAxis           : true,
        xAxis           : false,
        scrollTop       : 0,
        scrollLeft      : 0,
        contentHeight   : 0,
        contentWidth    : 0,
        containerHeight : 0,
        containerWidth  : 0,
        verticalSize    : 0,
        horizontalSize  : 0,
        dragLeft        : 0,
        dragRight       : 0
    };

    constructor( props, context ){
        super( props, context );
        this.inDragX = false;
        this.inDragY = false;
        this.data    = {
            mousepos       : {
                top  : 0,
                left : 0
            },
            keyhold        : {
                code  : 0,
                timer : null,
                xStep : 0,
                yStep : 0
            },
            moveToken      : null,
            wheelSpeed     : .6,
            keySpeed       : 20,
            keyHoldTimeout : 1000,
            keyHoldSpeed   : 20,
            keypageSpeed   : 4 /* multiplier to keySpeed for pageUp/Down keys*/
        }
    }

    componentWillMount(){
        this.listenTo( Page, 'page-resize', this.onResize );
        this.onMove = _.throttle( this.moveDefered, 100 );
        this.state.transaction( () =>{
            this.state.yAxis = _.isUndefined( this.props.vertical ) ? true : this.props.vertical;
            this.state.xAxis = this.props.horizontal;

            this.props.position && this.props.position.top && this.state.scrollTop !== this.props.position.top
            && (this.state.scrollTop = this.props.position.top);

            this.props.position && this.props.position.left && this.state.scrollLeft !== this.props.position.left
            && (this.state.scrollLeft = this.props.position.left);
        } );
    }

    componentWillUnmount(){
        this.stopListening();
        this.unbindHandlers();
    }

    componentDidMount(){
        this.listenTo( Page.keyboard, 'keydown:' + KEYBOARD_EVENTS_PRIORITY, this.onKeyDown );
        this.listenTo( Page.keyboard, 'keyup:' + KEYBOARD_EVENTS_PRIORITY, this.onKeyUp );
        this.bindHandlers();
        this.refreshContainerSize();
        this.updateBars( true );
    }

    componentDidUpdate(){
        this.refreshContainerSize();
    }

    //required to be implemented in child class
    refreshContainerSize(){
        throw new Error( 'not implemented' )
    }

    //required to be implemented in child class
    renderContent(){
        throw new Error( 'not implemented' )
    }

    getPosition(){
        return {
            top   : this.state.scrollTop,
            left  : this.state.scrollLeft,
            zoomX : this.state.horizontalSize,
            zoomY : this.state.verticalSize
        };
    }

    setPosition( pos ){
        this.state.transaction( () =>{
            pos && !_.isUndefined( pos.top ) && (this.state.scrollTop = pos.top);
            pos && !_.isUndefined( pos.left ) && (this.state.scrollLeft = pos.left);
            pos && !_.isUndefined( pos.zoomX ) && (this.state.horizontalSize = pos.zoomX);
        } );
    }

    bindHandlers(){
        if( this.refs.container ){
            this.refs.container.addEventListener( 'mousewheel', this.onWheel );
            this.refs.container.addEventListener( 'DOMMouseScroll', this.onWheel );
        }

        if( this.state.yAxis ){
            $( this.refs.y_bar ).on( 'mousedown' + eventClassName, ( e ) =>{
                this.mouseDownYBar( e );
                e.preventDefault();
            } );
        }

        if( this.state.xAxis ){
            $( this.refs.x_bar ).on( 'mousedown' + eventClassName, ( e ) =>{
                this.mouseDownXBar( e );
                e.preventDefault();
            } );
        }
    }

    unbindHandlers(){
        if( this.refs.container ){
            this.refs.container.removeEventListener( 'mousewheel', this.onWheel );
            this.refs.container.removeEventListener( 'DOMMouseScroll', this.onWheel );
        }

        if( this.state.yAxis ){
            $( this.refs.y_bar ).off( 'mousedown' + eventClassName );
        }
        if( this.state.xAxis ){
            $( this.refs.x_bar ).off( 'mousedown' + eventClassName );
        }
    }

    onResize = () =>{
        this.refreshContainerSize();
        this.updateBars();
    };

    onUserScroll( deltaX, deltaY ){
        let { onUserScroll } = this.props;
        if( _.isFunction( onUserScroll ) ){
            onUserScroll( deltaX, deltaY, this.getPosition() );
        }
    }

    _isMounted(){
        return true; //isMounted is deprecated. just a stub for now
    }

    onKeyHoldStart = e =>{
        this.data.keyhold.timer = setInterval( () => this.onKeyDown( e ), KEY_HOLD_INTERVAL );
    };

    onKeyUp = () =>{
        this.data.keyhold.code = 0;
        clearInterval( this.data.keyhold.timer );
    };

    onKeyDown = e =>{
        if( this.isDisabled() || !this.isHovered() || !this._isMounted() || Page.keyboard.isInputHasFocus( e.target ) ){
            return;
        }

        let deltaX = 0,
            deltaY = 0;

        const { keyEventsHandler } = this.props;

        if( keyEventsHandler ){
            let result = keyEventsHandler( e );
            if( result !== void 0 ){
                return result;
            }
        }

        switch( e.which ){
            case 37: // left
                deltaX = 1;
                break;
            case 38: // up
                deltaY = 1;
                break;
            case 39: // right
                deltaX = -1;
                break;
            case 40: // down
                deltaY = -1;
                break;
            case 33: // page up
                deltaY = KEY_PAGE_SPEED_COOF;
                break;
            //case 32: // space bar
            case 34: // page down
                deltaY = -KEY_PAGE_SPEED_COOF;
                break;
            case 35: // end
                if( this.state.xAxis ){
                    deltaX = -this.state.containerWidth;
                }
                else{
                    deltaY = -this.state.containerHeight;
                }
                break;
            case 36: // home
                if( this.state.xAxis ){
                    deltaX = this.state.containerWidth;
                }
                else{
                    deltaY = this.state.containerHeight;
                }
                break;
            default:
                return;
        }

        if( _.contains( [ 37, 39 ], e.which ) ){
            if( !this.data.keyhold.code ){
                this.data.keyhold.code  = e.which;
                this.data.keyhold.timer = setTimeout( () => this.onKeyHoldStart( e ), KEY_HOLD_INITIAL_TIMEOUT );
            }
        }

        this.state.transaction( () =>{
            if( this.state.yAxis ){
                this.state.scrollTop -= deltaY * KEY_SPEED;
            }
            if( this.state.xAxis ){
                this.state.scrollLeft -= deltaX * KEY_SPEED;
            }
            this.updateBars();
        } );

        this.onUserScroll( -deltaX * KEY_SPEED, -deltaY * KEY_SPEED );

        return false;
    };

    onWheel = e =>{
        if( this.isDisabled() || !this.isHovered() || !this._isMounted() ){
            return;
        }
        let delta              = e.wheelDelta ? e.wheelDelta : -e.detail * 40,
            deltaX = 0, deltaY = 0;

        this.state.transaction( () =>{
            if( this.state.yAxis ){
                deltaY = delta * WHEEL_SPEED;
                this.state.scrollTop -= deltaY;
            }
            else if( this.state.xAxis ){
                deltaX = delta * WHEEL_SPEED;
                this.state.scrollLeft -= deltaX;
            }

            this.updateBars();
        } );

        e.preventDefault();
        this.onUserScroll( -deltaX, -deltaY );
    };

    mouseDownYBar( e ){
        if( this.isDisabled() ){
            return
        }

        this.inDragY           = true;
        this.data.mousepos.top = e.pageY - this.state.scrollTop * this.state.verticalSize;
        $( window ).one( 'mouseup', () =>{
            this.inDragY = false;
            $( window ).off( 'mousemove' + eventClassName );
        } );
        $( window ).on( 'mousemove' + eventClassName, e => this.mouseMove( e ) );
    }

    mouseDownXBar( e ){
        if( this.isDisabled() ){
            return
        }

        this.state.transaction( () =>{
            this.inDragX            = true;
            this.data.mousepos.left = e.pageX - this.state.scrollLeft * this.state.horizontalSize;
        } );
        $( window ).one( 'mouseup', () =>{
            this.inDragX = false;
            $( window ).off( 'mousemove' + eventClassName );
        } );
        $( window ).on( 'mousemove' + eventClassName, e => this.mouseMove( e ) );
    }

    moveDefered = ( e, token ) =>{
        if( this.data.moveToken !== token || !(this.inDragX || this.inDragY) ){
            return;
        }

        let { state } = this,
            prevLeft  = state.scrollLeft,
            prevTop   = state.scrollTop,
            changed   = false;

        state.transaction( () =>{
            if( this.inDragY ){
                state.scrollTop = (e.pageY - this.data.mousepos.top) / state.verticalSize;
                changed         = true;
            }
            if( this.inDragX ){
                state.scrollLeft = (e.pageX - this.data.mousepos.left) / state.horizontalSize;
                changed          = true;
            }
        } );
        if( changed ){
            this.onUserScroll( state.scrollLeft - prevLeft, state.scrollTop - prevTop );
        }
        this.updateBars();
    };

    mouseMove( e ){
        _.defer( () => this.onMove( e, this.data.moveToken = {} ) );
    }

    getMaxScroll(){
        let { state } = this;
        return {
            top  : state.yAxis ? Math.max( state.contentHeight - state.containerHeight, 0 ) : 0,
            left : state.xAxis ? Math.max( state.contentWidth - state.containerWidth - 2 ) : 0
        };
    }

    updateBars(){
        let { xAxis, yAxis } = this.state;

        this.state.transaction( () =>{
            let maxScroll = this.getMaxScroll();
            if( yAxis ){
                this.state.scrollTop = Math.max( 0, Math.min( maxScroll.top, this.state.scrollTop ) );
            }
            if( xAxis ){
                this.state.scrollLeft = Math.max( 0, Math.min( maxScroll.left, this.state.scrollLeft ) );
            }

        } );

        _.isFunction( this.props.onUpdateScroll ) &&
        this.props.onUpdateScroll( this.state.scrollTop, this.state.scrollLeft );
    }

    /**
     * scrolls elem into view (vertically)
     * @param elemTop   elem position
     * @param elemHeight    elem height
     * @param preferToCenter    if true and element is offscreen -> scroll to show elem in center
     * @param forceToCenter     if true -> always scroll to show elem in center
     * @private
     */
    _scrollIntoView( elemTop, elemHeight, preferToCenter, forceToCenter ){
        let { state }              = this,
            parentHeight           = state.containerHeight,
            viewPositionAdjustment = preferToCenter || forceToCenter ? (parentHeight - elemHeight) / 2 : 0,
            delta                  = 0;

        if( elemTop < 0 ){
            delta = elemTop - viewPositionAdjustment;
        }
        else if( elemTop + elemHeight > parentHeight ){
            delta = (elemTop + elemHeight - parentHeight) + viewPositionAdjustment;
        }
        else if( forceToCenter ){
            delta = elemTop - parentHeight / 2;
        }

        if( delta !== 0 ){
            state.transaction( () =>{
                state.scrollTop += delta;
                this.updateBars( false )
            } )
        }
    }

    render(){
        let {
                xAxis, yAxis, scrollTop, scrollLeft, verticalSize, horizontalSize, containerHeight, containerWidth
            } = this.state;

        /* TODO: remove 'visibility:hidden' below (2 times) then stop IE support */
        return (
            <div className={cx( 'r-scroll', this.props.className, {
                disabled : this.isDisabled(),
                'x-axis' : xAxis
            } )}>
                <div className="r-scroll-container" ref="container">
                    {this.renderContent()}
                </div>
                {yAxis ?
                 <div className="r-scroll-rail y"
                      style={verticalSize && verticalSize < 1 ? null : {
                          opacity : 0,
                          visibility : 'hidden'
                      }}>
                     <div className="bar" ref="y_bar"
                          style={verticalSize < 1 ? {
                              height : containerHeight * verticalSize,
                              top    : scrollTop * verticalSize
                          } : {}}/>
                 </div> : void 0
                }
                {xAxis ?
                 <div className="r-scroll-rail x"
                      style={horizontalSize < 1 ? null : {
                          opacity : 0,
                          visibility : 'hidden'
                      }}>
                     <div className="bar" ref="x_bar"
                          style={{
                              width : containerWidth * horizontalSize,
                              left  : scrollLeft * horizontalSize
                          }}/>
                 </div> : void 0
                }
            </div>
        );
    }
}

@define
export class Scrollbars extends ScrollbarsBase {
    static displayName = 'Scrollbars';

    refreshContainerSize(){
        this.refs.content && this.refs.container &&
        this.state.transaction( () =>{
            if( this.state.yAxis ){
                this.state.containerHeight = $( this.refs.container ).height();
                this.state.contentHeight   = this.refs.content.scrollHeight;
                this.state.verticalSize    =
                    this.state.contentHeight ? this.state.containerHeight / this.state.contentHeight : 1;
            }
            if( this.state.xAxis ){
                this.state.containerWidth = $( this.refs.container ).width();
                this.state.contentWidth   = this.refs.content.scrollWidth;
                this.state.horizontalSize =
                    this.state.contentWidth &&
                    this.state.contentWidth - this.state.containerWidth > 1   // cutting one extra pixel sometimes
                                                                              // appear on IE
                        ? this.state.containerWidth / this.state.contentWidth : 1;
            }
            this.updateBars( false );
        } );
    }

    renderContent(){
        let { children }              = this.props,
            { scrollTop, scrollLeft } = this.state,
            content_style             = {
                marginTop : -scrollTop,
                marginLeft : -scrollLeft
            };

        return <div className="r-scroll-content" ref="content" style={content_style}>
            <Protect nodes={children}/>
        </div>
    }

    /**
     *
     * @param node              selector or dom node
     * @param preferToCenter    if true and element is offscreen -> scroll to show elem in center
     * @param forceToCenter     if true -> always scroll to show elem in center
     * @returns {boolean}       true if node found, false otherwise
     */
    scrollIntoView( node, preferToCenter = false, forceToCenter = false ){
        if( _.isString( node ) ){
            node = this.$( node )[ 0 ];
        }
        if( node && node.offsetParent ){
            this._scrollIntoView( node.offsetTop, node.offsetHeight, preferToCenter, forceToCenter );
        }
        return !!node;
    }

    render(){
        if( Page.isMobile() ){
            return <div className="r-scroll mobile">
                <div className="r-scroll-content">
                    <Protect nodes={this.props.children}/>
                </div>
            </div>
        }
        else{
            return ScrollbarsBase.prototype.render.call( this, arguments );
        }
    }

    /*

        getChildAtVerticalPosition(pos) {
            let container = this.$(this.refs.content).children('span'),
                nodes = container.children(),
                getter = (arr, idx) => {
                    let node = arr[idx];
                    return node.offsetTop + node.offsetHeight / 2;
                },
                idx = Utils.binarySearchExt(nodes, pos, Utils.BIN_SEARCH_MODE.NEAREST, getter);
            return idx < 0 ? null : nodes[idx];
        }
    */
}