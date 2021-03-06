const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const socketMap = {}
var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {

        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            // logger.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('set board', boardId => {
            if (socket.myBoard === boardId) return;
            if (socket.myBoard) {
                socket.leave(socket.myBoard)
                // logger.info(`Socket is leaving topic ${socket.myBoard} [id: ${socket.id}]`)
            }
            // console.log('this ', boardId)
            socket.join(boardId)
            socket.myBoard = boardId
        })
        socket.on('set user', userId => {
            if (socket.userId === userId) return;
            if (socket.userId) {
                socket.leave(socket.users)
                // logger.info(`Socket is leaving topic ${socket.myBoard} [id: ${socket.id}]`)
            }
            // console.log('yes!!!!!!!!!!!!!!!!!!', userId)
            socket.join(userId)
            socket.userId = userId
            socketMap[userId] = socket
        })
        // socket.on('push notification', notification => {
        // logger.info(`pushed notification ${notification} to ${socket.users}`)

        // socket.broadcast.to(socket.users).emit('push notification', notification)
        // })
        socket.on('load board', (boardAndActivity) => {
            // logger.info(`New event from socket [id: ${socket.id}], emitting to boardd ${socket.myBoard}`)
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room

            //  broadcast('load board',board,socket.myBoard,socket.id)
            console.log('i got youuuuuuuuuuuuuuuuuuuuuuuuuuuuu', boardAndActivity)
            if(!boardAndActivity.activity){
              return socket.broadcast.to(socket.myBoard).emit('load board', boardAndActivity)
            }
            socket.broadcast.to(socket.myBoard).emit('load board', boardAndActivity.board)
            if(!boardAndActivity.activity) return
            const onlineMembers = boardAndActivity.board.members.map(member => {
                if (Object.keys(socketMap).includes(member._id)) return member._id
            })
            const sendingUserIdx = onlineMembers.findIndex(user => user === socket.userId)

            if (sendingUserIdx !== -1) onlineMembers.splice(sendingUserIdx, 1)
            console.log('????????????????????????????????????', boardAndActivity.activity)
            onlineMembers.map(memberId => {
                if (!memberId) return
                const yes = { activity: boardAndActivity.activity, memberId }
                gIo.to(socketMap[memberId].id).emit('push notification', yes)
            })
            // console.log('yes!!!!!!!!!!!!!!!!!!!!', socketMap[broadcastMembers[0]].id)

            // gIo.to(socket.myBoard).emit('load board', board)

        })
        socket.on('user-typing', userTyping => {
            logger.info('this is doing something', userTyping)
            gIo.to(socket.myTopic).emit('user-typing', userTyping)
        })
        socket.on('user-watch', userId => {
            logger.info(`user-watch from socket [id: ${socket.id}], on user ${userId}`)
            socket.join('watching:' + userId)

        })
        socket.on('set-user-socket', userId => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
        })
        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
        // _printSockets();
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
}
