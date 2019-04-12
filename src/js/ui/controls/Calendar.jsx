import React, { define } from 'react-type-r';
import { TransitionMotion, spring } from 'react-motion'
import * as Moment from 'moment'
import cx from 'classnames'

import './calendar.less'

const MONTHS     = [ 'Январь',
                     'Февраль',
                     'Март',
                     'Апрель',
                     'Май',
                     'Июнь',
                     'Июль',
                     'Август',
                     'Сентябрь',
                     'Октябрь',
                     'Ноябрь',
                     'Декабрь' ],
      WDAYS      = [ 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс' ],
      CLASS_PREF = 'cwl-';

const getMinMax = function( level, _curdate, pMin, pMax ){
    let max     = pMax && Moment( pMax ),
        min     = pMin && Moment( pMin ),
        curdate = _curdate.clone();

    switch( level ){
        case 'month':
            return {
                min : min && min.isAfter( curdate.startOf( 'month' ) ) && min.startOf( 'day' ),
                max : max && max.isBefore( curdate.endOf( 'month' ) ) && max.endOf( 'day' )
            };
        case 'year':
            return {
                min : min && curdate.year() === min.year() && min.month() + 1,
                max : max && curdate.year() === max.year() && max.month() + 1
            };
        case 'decade':
            const start = (Math.floor( curdate.year() / 10 )) * 10 - 1;

            min = min && min.year();
            max = max && max.year();

            return {
                min : min >= start && min <= start + 10 && min,
                max : max >= start && max <= start + 10 && max
            };
    }
};

const GoBack = () => <div className="icon back"/>;
const GoNext = () => <div className="icon next"/>;

const Tags = {
    month_head : ( { curdate, lim, level, month_names, wday_names, onShift, onLevel, pref } ) =>
        <div className={pref + 'head ' + level}>
            <div className={pref + 'row'}>
                {lim.min ? <div className={pref + 'noshift'}/> : <div className={pref + 'prev'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.subtract( 1, 'M' ) )
                                                                           }}>
                    <GoBack/></div>}
                <div className={pref + 'title'}
                     onClick={() =>{onLevel( 'year', false )}}>{(month_names ||
                                                                 MONTHS)[ curdate.month() ]}&nbsp;{curdate.year()}</div>
                {lim.max ? <div className={pref + 'noshift'}/> : <div className={pref + 'next'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.add( 1, 'M' ) )
                                                                           }}>
                    <GoNext/></div>}
            </div>
            <div className={pref + 'row wdays'}>
                {(wday_names || WDAYS).map( wd => <div className={pref + 'cell wdname'} key={wd}>{wd}</div> )}
            </div>
        </div>,

    year_head : ( { curdate, lim, level, onShift, onLevel, pref } ) =>
        <div className={pref + 'head ' + level}>
            <div className={pref + 'row'}>
                {lim.min ? <div className={pref + 'noshift'}/> : <div className={pref + 'prev'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.subtract( 1, 'y' ) )
                                                                           }}>
                    <GoBack/></div>}
                <div className={pref + 'title'} onClick={() =>{onLevel( 'decade', false )}}>{curdate.year()}</div>
                {lim.max ? <div className={pref + 'noshift'}/> : <div className={pref + 'next'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.add( 1, 'y' ) )
                                                                           }}>
                    <GoNext/></div>}
            </div>
        </div>,

    decade_head : ( { curdate, lim, level, onShift, pref } ) =>{
        let start = (Math.floor( curdate.year() / 10 )) * 10 - 1;
        return <div className={pref + 'head ' + level}>
            <div className={pref + 'row'}>
                {lim.min ? <div className={pref + 'noshift'}/> : <div className={pref + 'prev'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.subtract( 10, 'y' ) )
                                                                           }}>
                    <GoBack/></div>}
                <div className={pref + 'title'}>{start + 1} - {start + 10}</div>
                {lim.max ? <div className={pref + 'noshift'}/> : <div className={pref + 'next'}
                                                                           onClick={() =>{
                                                                               onShift( curdate.add( 10, 'y' ) )
                                                                           }}>
                    <GoNext/></div>}
            </div>
        </div>
    },

    month_body : ( { curdate, selected, lim, onSelect, pref } ) =>{
        let day  = curdate.clone().startOf( 'month' ).startOf( 'week' ).startOf( 'day' ),
            last = day.clone().add( 42, 'd' ),
            days = [];

        while( day.isBefore( last ) ){
            let week  = [],
                today = Moment( (new Date) ); // TODO .fromDateLocal()
            for( let d = 0; d < 7; d++ ){
                let isOut = (lim.max && day.isAfter( lim.max )) || (lim.min && day.isBefore( lim.min )),
                    date  = day.clone();
                week.push( <div
                    className={cx( pref + 'cell', {
                        other    : day.month() !== curdate.month(),
                        out      : isOut,
                        today    : day.dayOfYear() === today.dayOfYear() && day.year() === today.year(),
                        selected : Moment( selected ).dayOfYear() === day.dayOfYear() &&
                                   day.year() === Moment( selected ).year()
                    } )
                    }
                    onClick={isOut ? null : () =>{onSelect( date )}}
                    key={d}>{day.date()}</div> );
                day.add( 1, 'd' );
            }
            days.push( <div className={pref + 'row week'} key={day.dayOfYear()}>{week}</div> );
        }

        return <div className={pref + 'days'}>{days}</div>;
    },

    year_body : ( { curdate, lim, month_names, onLevel, pref } ) =>{
        let months = [];

        for( let j = 0; j < 3; j++ ){
            let season = [];
            for( let i = 0; i < 4; i++ ){
                let k     = j * 4 + i,
                    isOut = (lim.max && k + 1 > lim.max) || (lim.min && k + 1 < lim.min);

                season.push( <div className={cx( pref + 'cell', { out : isOut } )} key={k}
                                  onClick={isOut ? null : () =>{
                                      onLevel( 'month', true, new Moment( curdate ).month( k ) )
                                  }}>{(month_names || MONTHS)[ k ]}</div> );
            }
            months.push( <div className={pref + 'row'} key={j}>{season}</div> );
        }

        return <div className={pref + 'months'}>{months}</div>;
    },

    decade_body : ( { curdate, lim, onLevel, pref } ) =>{
        let start = (Math.floor( curdate.year() / 10 )) * 10 - 1,
            years = [];

        for( let j = 0; j < 3; j++ ){
            let ys = [];
            for( let i = 0; i < 4; i++ ){
                let k     = j * 4 + i,
                    isOut = (lim.max && start + k > lim.max) || (lim.min && start + k < lim.min);
                ys.push( <div className={cx( pref + 'cell', { other : !k || k === 11, out : isOut } )} key={k}
                              onClick={isOut ? null :
                                       () =>{ onLevel( 'year', true, new Moment().year( start + k ) ) }}>{start +
                                                                                                          k}</div> );
            }
            years.push( <div className={pref + 'row'} key={j}>{ys}</div> );
        }

        return <div className={pref + 'years'}>{years}</div>;
    }
};

@define
export class Calendar extends React.Component {
    static prevDate  = null;
    static prevLevel = null;

    static state = {
        curdate   : null,
        level     : 'month',
        selected  : null,
        direction : '',
        animId    : 0
    };

    componentWillMount(){
        let date            = Moment( this.props.date || new Date() );
        this.prevdate       = date.clone();
        this.prevlevel      = 'month';
        this.state.selected = this.state.curdate = date;
    }

    componentWillReceiveProps( next ){
        this.setDate( next.date );
    }

    setDate( date ){
        this.state.selected = Moment( date );
    }

    onShift =  date => {
        this.prevlevel = this.state.level;
        this.prevdate  = this.state.curdate.clone();

        this.state.set( {
            curdate   : date,
            direction : date.isAfter( this.state.curdate ) ? 'right' : 'left',
            animId    : this.state.animId + 1
        } );
    };

    onLevel = ( level, is_zoom, date ) => {
        _.defer( () =>{ // overwise click event bubbles up with .target already detached from DOM
            let dt         = {
                level     : level,
                direction : is_zoom ? 'down' : 'up',
                animId    : this.state.animId + 1
            };
            this.prevlevel = this.state.level;
            this.prevdate  = this.state.curdate.clone();
            date && (dt.curdate = date);
            this.state.set( dt );
            this.props.onZoom && this.props.onZoom( level );
        } );
    };

    onSelect = date => {
        this.state.selected = date;
        this.props.onSelect && this.props.onSelect( date );
    };

    willEnterLeave( welcome ){
        switch( this.state.direction ){
            case 'left':
                return { zoom : 0, slide : welcome ? -1 : spring( 1 ) };
            case 'right':
                return { zoom : 0, slide : welcome ? 1 : spring( -1 ) };
            case 'up':
                return { zoom : welcome ? 1 : spring( -1 ), slide : 0 };
            case 'down':
                return { zoom : welcome ? -1 : spring( 1 ), slide : 0 };
            default:
                return { zoom : 0, slide : 0 };
        }
    }

    render(){
        let { minDate, maxDate, className, class_prefix } = this.props,
            { curdate, selected, level, animId }          = this.state,
            pref                                          = class_prefix || CLASS_PREF;
        return (
            <div className={cx( 'calendar_wl_box', className )}>
                {
                    React.createElement( Tags[ level + '_head' ], Object.assign( {}, this.props, {
                        curdate : Moment( curdate ),
                        onShift : this.onShift,
                        onLevel : this.onLevel,
                        pref    : pref,
                        level   : level,
                        lim     : getMinMax( level, Moment( curdate ), minDate, maxDate )
                    } ) )
                }{
                <TransitionMotion
                    willEnter={() => this.willEnterLeave( true )}
                    willLeave={() => this.willEnterLeave( false )}
                    styles={[ { key : 'k' + animId, style : { slide : spring( 0 ), zoom : spring( 0 ) } } ]}
                >{interpolate => <div className={pref + 'anim_container ' + level}>{
                    interpolate.map( conf =>{
                        let isnew = conf.key === 'k' + animId,
                            lvl   = isnew ? level : this.prevlevel,
                            date  = Moment( isnew ? curdate.clone() : this.prevdate );
                        return <div className={pref + 'body ' + lvl} key={conf.key}
                                    style={{
                                        left      : conf.style.slide * 100 + '%',
                                        opacity   : 1 - Math.abs( conf.style.zoom ),
                                        transform : 'scale( ' + (conf.style.zoom + 1) + ')',
                                        zIndex    : isnew ? 2 : 1
                                    }}>{
                            React.createElement( Tags[ lvl + '_body' ], Object.assign( {}, this.props, {
                                curdate  : date,
                                selected : selected,
                                pref     : pref,
                                onShift  : this.onShift,
                                onLevel  : this.onLevel,
                                onSelect : this.onSelect,
                                lim      : getMinMax( lvl, date, minDate, maxDate )
                            } ) )
                        }</div>
                    } )
                }</div>
                }
                </TransitionMotion>}
            </div>);
    }
}