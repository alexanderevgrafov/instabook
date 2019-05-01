import React from 'react-type-r'
//import ReactDOM from 'react-dom'
import 'lib/notify'
import 'lib/notify.css'

const Page = {
    globalState : null,   // Common state available for all pages
    msgHash     : {},

    notifyOnComplete( promise, { error, success, before } ) {
        const beforeMsg = before && this.createMsg( {
            text     : before,
            duration : 0,
            type     : 'notify'
        } );

        return promise.then( () => {
            this.createMsg( {
                text    : success,
                type    : 'success',
                replace : beforeMsg
            } )
        } )[ promise.catch ? 'catch' : 'fail' ](
            err => {
                this.ioFailMsg( err, { errorDescription : error, replace : beforeMsg } )
            } );
    },

    clearMsgHash() {
        this.msgHash = {};
    },

    createMsg( msgSpecs ) {
        const msgText = _.escape( msgSpecs.text );

        if( !msgText ) {
            return;
        }

        if( !this.msgHash[ 'clearPageMsgHash' ] ) { // after a minute with no msg clean up.
            this.msgHash[ 'clearPageMsgHash' ] = _.debounce( () => { this.msgHash = {}; }, 60000 );
        }

        if( !this.msgHash[ msgText ] ) {
            this.msgHash[ msgText ] = _.debounce( msgSpecs => this.debounceCreateMsg( msgSpecs ), 1500, true );
        }

        this.msgHash[ 'clearPageMsgHash' ]();

        return this.msgHash[ msgText ]( msgSpecs );
    },

    removeMsg( msg ) {
        $.notify( 'close', msg );
    },

    ioFailMsg( err, options ) {
        let errorMsg;

        if( err && err.nested ) {
            errorMsg = Utils.collectValidationErrorMsgs( err ).join( ', ' );
        } else {
            // const { json } = err;
            // errorMsg = json && json.error;

            errorMsg = err;
        }

        errorMsg = ((options && options.errorDescription) ? (options.errorDescription + '. ') : '') +
                   (errorMsg || ((options && options.defaultError) || 'Unspecified error'));

        if( err.statusText === 'abort' || !errorMsg ) {
            return;
        }

        options = _.extend( { text : errorMsg, type : 'error', width : 900, skipEscape : true }, options || {} );

        return Page.createMsg( options );
    },

    debounceCreateMsg( msgSpecs ) {
        let status = 'default',
            pos    = 'top-center';

        switch( msgSpecs.type ) {
            case 'notify':
                status = 'info';
                break;
            case 'warn':
                status = 'warning';
                break;
            case 'error':
            case 'success':
                status = msgSpecs.type;
                break;
        }

        if( _.isUndefined( msgSpecs.duration ) ) {
            msgSpecs.duration = 5000;
        }

        if( !msgSpecs.skipEscape ) {
            msgSpecs.text = msgSpecs.text.replace( /</g, '&lt;' );
            msgSpecs.text = msgSpecs.text.replace( />/g, '&gt;' );
        }

        // if( !_.isUndefined( msgSpecs.link ) ) {
        //     if( _.isUndefined( msgSpecs.link.target ) ) {
        //         msgSpecs.link.target = "_self";
        //     }
        //     // msgSpecs.text = msgSpecs.text.replace( msgSpecs.link.text,
        //     //     "<a class=\"msgLink\" target=\"" + msgSpecs.link.target + "\" href=\"" + msgSpecs.link.url + "\"
        // " + //     (msgSpecs.link.download ? " download " : "") + ">" + msgSpecs.link.text + "</a>" // ); }

        let ret = $.notify( {
            message      : msgSpecs.text,
            status       : status,
            timeout      : msgSpecs.duration,
            pos          : msgSpecs && msgSpecs.pos || pos,
            zIndex       : 14500,
            onClose      : msgSpecs.onClose || function() {},
            replace      : msgSpecs.replace,
            closeOnlyOnX : _.isBoolean( msgSpecs.closeOnlyOnX ) ? msgSpecs.closeOnlyOnX : false
        } );

        return ret.uuid;
    },
};

export default Page;
