import React, { define } from 'react-mvx';
import { Scrollbars } from './controls/Scrollbars'
import { VerticalColumn, Columns } from './layout/Columns'
import LeftMiddleRight from './layout/LeftMiddleRight'
import cx from 'classnames';

const Loader = ( { className, label } ) => <div className={cx( 'loader', className )}>
    <div>{label}</div>
</div>;

export { VerticalColumn, Columns, Scrollbars, LeftMiddleRight, Loader }