import 'type-r/globals'
import { define } from 'type-r'
import React from 'react-mvx';
import cx from 'classnames';

@define
export class VerticalColumn extends React.Component {
    render() {
        let { className, top, bottom, children, absoluteFill = true } = this.props;

        return (
            <div className={cx( 'v-column', { af : absoluteFill }, className )}>
                {top ? <div className="vert-columnTop">{top}</div> : void 0}
                <div className="vert-columnMiddle">
                    {children}
                </div>
                {bottom ? <div className="vert-columnBottom">{bottom}</div> : void 0}
            </div>
        );
    }
}

@define
export class Columns extends React.Component {
    static pureRender = true;

    // static props = {
    //     columns : type( Array ),
    //     widths  : type( Array ).value( [] )
    // };

    static state = {
        widths : Array.value( [] )
    };

    componentWillMount() {
        const { columns, widths } = this.props;
        let sum = 0;

        _.each( columns, ( x, i ) => sum += widths[ i ] || 1 );
        _.each( columns, ( x, i ) => this.state.widths[ i ] = Math.floor( 100 * (widths[ i ] || 1) / sum ) );
    }

    render() {
        const { columns, className } = this.props,
              { widths }             = this.state;

        return !columns.length ? null :
               <div className={cx( 'v-n-columns-container', className )}>
                   {columns.map(
                       ( x, i ) => <div key={i}
                                        style={{ flexGrow : widths[ i ], flexBasis : widths[ i ] + '%' }}>{x}</div> )}
               </div>;
    }
}

/*
@define
export class VerticalSplit extends React.Component {
    static props = {
        top             : Nested.value( null ).isRequired,
        bottom          : Nested.value( null ).isRequired,
        proportion      : .5,
        topMaxHeight    : Number.value( null ),
        bottomMaxHeight : Number.value( null ),
        bottomMinHeight : Number.value( null ),
        topMinRatio     : Number.value( null ),
//        topMinHeight        : Number.value( null ),  // this two props are not used anywhere so commented till better times
//        bottomMaxProportion : Number.value( null ),
        className       : ''
    };

    static state = {
        topHeight : null
    };

    componentDidMount() {
        this.init( this.props );
    }

    componentWillReceiveProps( next ) {
        this.init( next );
    }

    init( props ) {
        const { topMinRatio } = props;

        this.stopListening();

        if( !_.isNull( topMinRatio ) ) {
            this.listenTo( Page, 'page-resize', () => this.onPageResize( this.props ) );
            this.onPageResize( props );
        }
    }

    onPageResize = ( props ) => {
        const {
                  topMinRatio, bottomMinHeight, proportion
              }   = props,
              top = this.refs.top;

        if( top ) {
            const w  = $( top ).width(),
                  h0 = this.$el.height(),
                  h  = Math.min( h0 * proportion, h0 - (bottomMinHeight || 0) );

            this.state.topHeight = h && w / h <= topMinRatio ? w / topMinRatio : null;
        }
    };

    render() {
        const {
                  top, bottom, proportion = .5, topMaxHeight, bottomMaxHeight, bottomMinHeight, className
              }             = this.props,
              { topHeight } = this.state,
              prop          = Math.round( 100 * parseFloat( proportion ) ),
              topStyle      = {
                  flexGrow   : prop,
                  flexShrink : prop,
                  maxHeight  : topMaxHeight ? topMaxHeight + 'px' : null
              };

        if( !_.isNull( topHeight ) ) {
            topStyle.minHeight = topHeight;
            topStyle.flexGrow = 0;
        }

        return <div className={cx( 'vertical-split', className )}>
            {top && <div className='split top'
                         ref="top"
                         style={topStyle}>{top}
            </div>}
            {bottom && <div className='split bottom'
                            style={{
                                flexGrow   : 100 - prop,
                                flexShrink : 100 - prop,
                                maxHeight  : bottomMaxHeight ? bottomMaxHeight + 'px' : null,
                                minHeight  : bottomMinHeight ? bottomMinHeight + 'px' : null
                            }}>{bottom}
            </div>}
        </div>;
    }
}
*/