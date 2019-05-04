import 'reflect-metadata'
import * as socketio from 'socket.io'
import {logger} from 'type-r'
import * as _ from 'underscore'
import { api_map } from './socket_api'
import {Session} from "./Session";

const path = require('path');

import config from './config.js'

_.extend(process.env, config || {}, require('dotenv').config().parsed || {});

const fastify = require('fastify')();
const ws = socketio.listen(process.env.ws_server_port);

logger.off();

fastify
    .register(require('fastify-static'), {
        root: path.join(__dirname, '../../public'),
        prefix: '/'
    })
    .register(require('fastify-cookie'))
    .register(require('fastify-caching'))
    .register(require('fastify-server-session'), {
        secretKey: 'qscvefbnrgm,rghjthjk1122342345qscvefbnrgm,rghjthjkl678qscvefbnrgm,rghjthjkll',
        sessionMaxAge: 900000, // 15 minutes in milliseconds
        cookie: {
//            domain: '.example.com',
            path: '/'
        }
    });

fastify.get('/api/*', (request, reply) => {
    reply.send({hello: 'world ' + request.params['*']})
});

const start = async () => {
    try {
        await fastify.listen(process.env.server_port || 3000);
        fastify.log.info('server listening on ' + fastify.server.address().port)
    } catch (err) {
        fastify.log.error(err);
        process.exit(1)
    }
};

ws.on('connection', socket => {
    const session = new Session({socket});

    console.log('WS client is connected');
    _.mapObject(api_map, (method, name) =>
        socket.on(name, data => {
                try {
                    const result = method(session, data.params);

                    result && result.then && result
                        .then(obj => session.ws_success(data, obj))
                        .catch((err:Error)=>{
                            console.log('before err emit');
                            session.ws_error(data, err);
                            console.log('after err emit');
                        })
                } catch (err) {
                    session.ws_error(data, err);
                }
            }
        ));
});

start();
