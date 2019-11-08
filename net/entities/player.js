let Server = require("../server");
let Entity = require("../entity");
let Chunk = require("../chunk");
let Socket = require("net").Socket;
function irandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
/**
 * @name Player
 * @extends Entity
 * @description A holder class for the player's data and socket
 */
class Player extends Entity{
    /**
     * @constructor
     * @param {Server} server 
     * @param {number} id
     * @param {Socket} socket
     */
    constructor(server,id,socket){
        super(0,irandom(server.spawn.x-server.spawn.r,
            server.spawn.x+server.spawn.r),irandom(server.spawn.y-server.spawn.r,
                server.spawn.y+server.spawn.r),0,0,id,server);
        /**
         * @name server
         * @type {Server}
         */
        this.server = server;
        this.socket = socket;
        this.authenticated = false;
        /**
         * @name sentChunks
         * @type {Map<string,Chunk>} 
         * stole this jsdoc from the 
         */
        this.sentChunks = new Map();
        let start = Buffer.alloc(10);
        start.writeInt16LE(this.x,2);
        start.writeInt16LE(this.y,4);
        start.writeUInt32LE(id,6);
        console.log(start);
        this.send(start);
    }
    /**
     * Kicks the player with provided reason
     * @param {string} reason 
     */
    kick(reason){
        let kickme = Buffer.alloc(reason.length+3);
        kickme.writeUInt16LE(4,0);
        kickme.write(reason,2);
        kickme.writeUInt8(0,reason.length+2)
        console.log(kickme);
        this.send(kickme);
        this.socket.close();
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y
     * @param {number} direction 
     * @param {boolean} tp if the setPos is a move to location or a 
     */
    setPos(x,y,direction,tp){
        this.x = x;
        this.y = y;
        let b = Buffer.alloc(27);
        b.writeUInt16LE(3,0);
        b.writeUInt8(tp?1:0,2);
        b.writeDoubleLE(x,3);
        b.writeDoubleLE(y,11);
        b.writeDoubleLE(direction,19);
        this.send(b);
    }
    
    /**
     * 
     * @param {Chunk} chunk 
     */
    sendChunk(chunk){
        this.sentChunks.set(chunk.cx+","+chunk.cy,chunk);
        this.send(chunk.dataFormat());
    }

    /**
     * @param {string} name
     */
    setName(name){
        this.name = name;
        let b = Buffer.alloc(name.length+2);
        b.writeUInt16LE(2,4)
        b.write(name);
        this.server.broadcast(this,b);
    }
    /**
     * @param {Entity} e
     */
    sendEntity(e){
        let bu = Buffer.alloc()
    }
    
    /**
     * 
     * @param {Buffer} b 
     */
    send(b){
        let buffer = Buffer.alloc(b.byteLength+2);
        buffer.writeInt16LE(0,b.byteLength);
        b.copy(buffer,2,0,b.length);
        this.socket.write(buffer);
    }
}
module.exports = Player;