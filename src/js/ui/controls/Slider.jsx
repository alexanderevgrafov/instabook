import React, { Link, define } from 'react-mvx';
import cx from 'classnames';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/dist/rc-slider.css'

@define
class MySlider extends React.Component {
    static props = {
        valueLink : Link.isRequired
    };

    static state = {
        value : 0
    };

    componentWillMount() {
        this.state.value = this.props.valueLink.value;
        this.listenTo( this.state, 'change:value', ( m, x ) => {
            this.props.valueLink.set( x );
        } )
    }

    componentWillReceiveProps( next ) {
        this.state.value = next.valueLink.value;
    }

    onChange = val => this.state.value = val;

    render() {
        const { props } = this,
              { value }    = this.state;
        return <Slider
            {...props}
            onChange={this.onChange}
            value={value}
        />
    }
}

export { MySlider as Slider, Range }
