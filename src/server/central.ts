//import * as socketio from 'socket.io'
import * as _ from 'underscore'
const path = require('path');
//import * as fs from "fs"

import config from './config.js'

_.extend(process.env, config || {}, require('dotenv').config().parsed || {});

const fastify = require('fastify')({logger: true});

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '../public'),
    prefix: '/'
});

fastify.get('/api/*', (request, reply) => {
    reply.send({hello: 'world ' + request.params['*']})
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen(process.env.server_port || 3000);
        fastify.log.info('server listening on ' + fastify.server.address().port)
    } catch (err) {
        fastify.log.error(err);
        process.exit(1)
    }
};

start();

//console.log(process.env.ip_addr);
//
// const io = socketio.listen( process.env.ws_server_port );
//
// io.on( 'connection', socket =>{
//     socket.on( 'disconnect', () => console.log( 'WS client is disconnected' ) );
//     console.log( 'WS client is connected' );
//
//     /*--------- Client connected ------------------*/
//     socket.on( 'hola', data =>{
//         console.log( 'Hola from', data );
//     } );
// } );
