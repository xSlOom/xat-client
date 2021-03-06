'use strict'
const emitter = require('events').EventEmitter

const xml2js = require('xml2js')

const defaults = require('./defaults.js')
const xatconst = require('./const.js')

const parserOptions = { attrkey: 'attributes', headless: true }
const builderOptions = parserOptions

class XatUser extends emitter {

  constructor(options) {
    super()

    options = options || {}

    this.todo = options.todo || {}
    this.todo.MAX_PWR_INDEX = this.todo.MAX_PWR_INDEX || xatconst.MAX_PWR_INDEX

    // Compatibility with .sol
    this.todo.w_k1 = this.todo.w_k1 || this.todo.w_k1c
    this.todo.w_autologin = this.todo.w_autologin != null
      ? this.todo.w_autologin
      : 1

    this.global = options.global || {}
    this.gotDone = false
    this._ipPicker = options.ippicker || defaults.ippicker
    this._createSocket = options.createSocket || defaults.createSocket
    this._join = {}
    this._socket = null
    this._connect = { attempt: 0 }
    this._xatlib = options.xatlib || defaults.xatlib
    this._perlinNoise = options.perlinNoise || defaults.perlinNoise
    this._parser = new xml2js.Parser(parserOptions)
    this._NetworkSendMsgHooks = {}
  }

  connect() {
    this._join.sjt = getTimer()
    this._ipPicker.pickIp(this).then(res => {
      this.emit('ip-pick', res)
      const socket = this._socket
        = this._createSocket(res, this._myOnConnect.bind(this))

      let buf = Buffer.alloc(0)

      socket.on('error', err => this._myOnError(err))

      socket.on('data', data => {
        buf = Buffer.concat([buf, data])
        let lastZero = -1
        for (let i = 0; i < buf.length; ++i) {
          if (buf[i] === 0) {
            this._myOnXML(buf.slice(lastZero + 1, i))
            lastZero = i
          }
        }
        buf = buf.slice(lastZero + 1)
      })

      socket.on('close', () => this._myOnClose())
    })
  }

  send(packet, options) {
    options = options || {}
    const strict = options.strict != null ? options.strict : false
    const parse = options.parse != null ? options.parse : true

    const validate = () => new Promise((resolve, reject) => {
      const isStr = typeof packet === 'string'
      const isBuf = packet instanceof Buffer
      const isXML = typeof packet === 'object'

      const strToRaw = str => Buffer.from(str + '\0', 'utf8')

      if (isStr || isBuf) {
        let raw, str
        if (isStr) {
          str = packet
          raw = strToRaw(str)
        } else {
          raw = packet
          str = raw.toString('utf8')
        }

        if (!parse) {
          return resolve({ str, raw, xml: null })
        }

        this._parser.parseString(packet, (err, xml) => {
          if (err) {
            xml = null
            if (strict) {
              return reject(err)
            }
          }

          resolve({ str, xml, raw })
        })
      } else if (isXML) {
        const xml = packet

        let raw, str

        const builder = new xml2js.Builder(builderOptions)
        str = builder.buildObject(packet)
        raw = strToRaw(str)

        resolve({ xml, str, raw })
      } else {
        reject(new Error('The only acceptable types are Buffer, object '
          + 'and string'))
      }
    })

    const send = (representations) => new Promise((resolve, reject) => {
      const eventArgs = Object.assign({},
        representations,
        { prevent: false })

      this.emit('before-send', eventArgs)
      if (!eventArgs.prevent) {
        this._socket.write(representations.raw, null, (err) => {
          if (err) {
            return reject(err)
          }
          this.emit('send', representations)
          resolve()
        })
      }
    })

    return validate().then(send)
  }

  end() {
    if (this._socket) {
      this._socket.end()
    }
  }

  _myOnConnect() {
    this.connected = true
    this.emit('connect')

    let y = { attributes: {} }

    // eslint-disable-next-line eqeqeq
    if (this.todo.useport == 80) {
      y.attributes.p = this._GetPort(this.todo.w_useroom)
      y.attributes.s = this._GetDom(this.todo.w_useroom)
    }
    // eslint-disable-next-line eqeqeq
    if (this.todo.pass != undefined) {
      y.attributes.m = 1
    }

    y.attributes.r = this.todo.w_useroom
    y.attributes.v = this._connect.attempt
    y.attributes.u = this.todo.w_userno
    // eslint-disable-next-line quotes
    let xml = this._xatlib.XMLOrder({ y: y }, ["w", "r", "m", "s", "p", "v", "u"])
    this.send(xml)
  }

  /* eslint-disable */
  _myOnJoin() {
      try {
          let todo = this.todo;
          let global = this.global;
          let xatlib = this._xatlib;
          let jt1 = this._join.jt1 || 0;
          let jt2 = this._join.jt2;
          let sjt = this._join.sjt;
          let l5 = this._join.l5;
          let YI = this._join.YI;
          let WC = 2;
          let J2_Order;

          var _local8;
          var _local1 = xatlib.CleanTextNoXat(todo.w_name);
          var _local2 = xatlib.CleanText(todo.w_avatar);
          var _local3 = xatlib.CleanText(todo.w_homepage);
          if (_local1 == null){
              _local1 = "";
          };
          if (_local2 == null){
              _local2 = "";
          };
          if (_local3 == null){
              _local3 = "";
          };
          this.gotDone = false;
          var _local4 = {};
          var _local5 = _local4.j2 = { attributes: {} };
          _local5.attributes.v = ((todo.w_userrev)==undefined) ? 0 : todo.w_userrev;
          _local5.attributes.h = _local3;
          _local5.attributes.a = _local2;
          _local5.attributes.n = _local1;
          if (todo.Macros != undefined){
              if (todo.Macros["status"] != undefined){
                  _local5.attributes.n = (_local5.attributes.n + ("##" + todo.Macros["status"]));
              };
          };
          if (todo.w_registered != undefined){
              _local5.attributes.N = todo.w_registered;
          };
          if (todo.w_dt){
              _local5.attributes.dt = todo.w_dt;
          };
          if (todo.w_xats){
              _local5.attributes.dx = todo.w_xats;
          };
          if (todo.w_sn){
              _local5.attributes.sn = todo.w_sn;
          };
          if (todo.w_PowerO != undefined){
              _local5.attributes.dO = todo.w_PowerO;
          };
          if (todo.w_Powers != null){
              _local8 = 0;
              while (_local8 < todo.MAX_PWR_INDEX) {
                  if (todo.w_Powers[_local8]){
                      _local5.attributes[("d" + (_local8 + 4))] = todo.w_Powers[_local8];
                  };
                  _local8++;
              };
          };
          if (todo.w_d3){
              _local5.attributes.d3 = todo.w_d3;
          };
          if (todo.w_d2){
              _local5.attributes.d2 = todo.w_d2;
          };
          if (todo.w_d0 != undefined){
              _local5.attributes.d0 = todo.w_d0;
          };
          if (todo.w_Mask != null){
              _local8 = 0;
              while (_local8 < todo.MAX_PWR_INDEX) {
                  if (todo.w_Mask[_local8]){
                      _local5.attributes[("m" + _local8)] = todo.w_Mask[_local8];
                  };
                  _local8++;
              };
          };
          // I think it's OK to remove this strange behavior.
          // _local5.attributes.u = ((todo.w_userrev)==undefined) ? 2 : todo.w_userno;
          _local5.attributes.u = todo.w_userno;
          if (global.rf){
              _local5.attributes.e = "1";
          };
          _local5.attributes.f = ((((global.um)!=undefined) ? 0 : (((todo.w_autologin & 1)) ? 0 : 1) | ((todo.LoginPressed) ? 2 : 0)) | (((global.pass)!=undefined) ? 4 : 0));
          todo.w_autologin = (todo.w_autologin | 1);
          if (((todo.pass) || (!((global.pass == undefined))))){
              _local5.attributes.r = ((global.pass)!=undefined) ? global.pass : todo.pass;
          };
          if (OnGagList(todo.w_useroom)){
              _local5.attributes.b = GetGagTime(todo.w_useroom);
          };
          _local5.attributes.c = todo.w_useroom;
          if (todo.w_pool != undefined){
              _local5.attributes.p = todo.w_pool;
          };
          if (todo.w_d1){
              _local5.attributes.d1 = todo.w_d1;
          };
          _local5.attributes.k3 = xatlib.xInt(todo.w_k3);
          _local5.attributes.k = todo.w_k1;
          _local5.attributes.y = YI;
          if ((global.xc & 32)){
              _local5.attributes.q = 1;
          };
          _local5.attributes.l2 = jt1;
          _local5.attributes.l3 = jt2;
          _local5.attributes.l4 = (getTimer() - sjt);
          _local5.attributes.l5 = l5;
          if (WC > 1){
              _local5.attributes.Y = WC;
          };
          _local5.attributes.cb = todo.w_cb;

          if (!J2_Order){
              J2_Order = "cb,Y,l5,l4,l3,l2,q,y,k,k3,d1,z,p,c,b,r,f,e,u";
              _local8 = 0;
              while (_local8 < todo.MAX_PWR_INDEX) {
                  J2_Order = (J2_Order + (",m" + _local8));
                  _local8++;
              };
              J2_Order = (J2_Order + ",d0");
              _local8 = 2;
              while (_local8 < (todo.MAX_PWR_INDEX + 4)) {
                  J2_Order = (J2_Order + (",d" + _local8));
                  _local8++;
              };
              J2_Order = (J2_Order + ",dO,sn,dx,dt,N,n,a,h,v");
              J2_Order = J2_Order.split(",");
          };
          var _local7 = xatlib.XMLOrder(_local4, J2_Order);
          this.send(_local7);
      } catch (e) {
          this.emit('error', e);
      }
  }
  /* eslint-enable */

  _myOnXML(data) {
    let join = this._join
    let xatlib = this._xatlib

    data = data.toString('utf-8')
    // fixes issue #1: handle xmls like <tag attr1="val1"attr2="val2" />
    data = data.replace(/("[^"]*")(.)/g, '$1 $2')
    this._parser.parseString(data, (err, result) => {
      if (err) {
        return this._myOnError(err)
      }
      if (!result) {
        return this._myOnError('String "' + data + '" parsed as null')
      }
      this.emit('data', result)
      if (result.done != null) {
        this.gotDone = true
      }
      if (result.y) {
        let e = result.y
        if (e.attributes.C === '1') {
          // What should we do in this case?
          this.emit('captcha', result)
          return
        }
        join.YI = xatlib.xInt(e.attributes.i)
        join.jt2 = (getTimer() - join.sjt)
        join.YC = xatlib.xInt(e.attributes.c)
        join.YC2 = getTimer()
        join.l5 = 0

        if (e.attributes.p) {
          this._join.p = e.attributes.p
          var stra = e.attributes.p.split('_')
          join.p_w = xatlib.xInt(stra[0])
          join.p_h = xatlib.xInt(stra[1])
          join.p_octaves = xatlib.xInt(stra[2])
          join.p_seed = xatlib.xInt(stra[3])
          let t = join.YI % (join.p_w * join.p_h)
          join.p_x = t % join.p_w
          join.p_y = Math.floor(t / join.p_w)

          return this._perlinNoise(join).then(l5 => {
            join.l5 = l5
            this._myOnJoin()
          })
        } else {
          this._myOnJoin()
        }
      }
    })
  }

  /* eslint-disable */
  _NetworkSendMsg(_arg1, _arg2, _arg3, _arg4, _arg5, _arg6, _arg7) {
      const todo = this.todo;
      const xatlib = this._xatlib;
      const hooks = this._NetworkSendMsgHooks;
      const _OnUserList = hooks.OnUserList;
      const _CountLinks = hooks.CountLinks;
      function OnUserList() {
          if (typeof _OnUserList === 'function')
              return _OnUserList.call(this, arguments);
          return false;
      }
      function CountLinks() {
          if (typeof _CountLinks === 'function') {
              return _CountLinks.call(this, arguments);
          }
          return 0;
      }

      var _local9;
      if (todo.lb == "n"){
          return;
      };
      if (_arg3 == undefined){
          _arg3 = 0;
      };
      if (_arg4 == undefined){
          _arg4 = 0;
      };
      if (_arg5 == undefined){
          _arg5 = 0;
      };
      var _local8 = {};
      var _local10 = true;
      var _local11 = "";

      if (_arg5 != 0){
          _local9 = _local8.c = { attributes: { } }
          if (_arg3 != 0){
              _local9.attributes.d = todo.w_userno;
              _local9.attributes.s = 2;
          };
          _local9.attributes.t = _arg2;
          _local9.attributes.u = _arg5;
          if (_arg6 != undefined){
              _local9.attributes.p = _arg6;
          };
          if (_arg7 != undefined){
              _local9.attributes.w = _arg7;
          };
          _local11 = xatlib.XMLOrder(_local8, ["w", "p", "u", "t", "s", "d"]);
          this.send(_local11);
      } else {
          if (_arg4 != 0){
              if (((((((OnUserList(_arg4)) && (!((_arg2.substr(0, 2) == "/a"))))) && (!((_arg2.substr(0, 2) == "/l"))))) && (!((_arg2.substr(0, 2) == "/t"))))){
                  _local9 = _local8.p = { attributes: { }};
                  if (_arg3 != 0){
                      _local9.attributes.d = todo.w_userno;
                      _local9.attributes.s = 2;
                  };
                  _local9.attributes.t = _arg2;
                  _local9.attributes.u = _arg4;
                  _local11 = xatlib.XMLOrder(_local8, ["u", "t", "s", "d"]);
                  this.send(_local11);
              } else {
                  _local9 = _local8.z = { attributes: { }};
                  if (_arg3 != 0){
                      _local9.attributes.s = 2;
                  };
                  _local9.attributes.t = _arg2;
                  _local9.attributes.u = ((todo.w_userno + "_") + todo.w_userrev);
                  _local9.attributes.d = _arg4;
                  _local10 = false;
                  _local11 = xatlib.XMLOrder(_local8, ["d", "u", "t", "s"]);
                  this.send(_local11);
              };
          } else {
              if (_arg3 != 0){
                  if (OnUserList(_arg3)){
                      _local9 = _local8.p = { attributes: { }}
                      _local9.attributes.d = todo.w_userno;
                      _local9.attributes.s = 2;
                      _local9.attributes.t = _arg2;
                      _local9.attributes.u = _arg3;
                      _local11 = xatlib.XMLOrder(_local8, ["u", "t", "s", "d"]);
                      this.send(_local11);
                  } else {
                      _local9 = _local8.z = { attributes: { }}
                      _local9.attributes.s = 2;
                      _local9.attributes.t = _arg2;
                      _local9.attributes.u = ((todo.w_userno + "_") + todo.w_userrev);
                      _local9.attributes.d = _arg3;
                      _local10 = false;
                      _local11 = xatlib.XMLOrder(_local8, ["d", "u", "t", "s"]);
                      this.send(_local11);
                  };
              } else {
                  _local9 = _local8.m = { attributes: { }}
                  _local9.attributes.u = ((todo.w_userrev)<=0) ? _arg1 : ((_arg1 + "_") + todo.w_userrev);
                  _local9.attributes.t = _arg2;
                  if (CountLinks(_arg2) > 0){
                      _local9.attributes.l = 1;
                  };
                  _local11 = xatlib.XMLOrder(_local8, ["t", "u", "l"]);
                  this.send(_local11);
              };
          };
      };
      if (_arg2.substr(0, 1) != "/"){
          // GlowUser(todo.w_userno);
      };
      if (_arg2.substr(0, 3) == "/KD"){
          _local10 = false;
      };
      if (_local10){
          // LurkerTimeout = LurkerLimit;
      };
  }
  /* eslint-enable */

  _myOnError(e) {
    this.emit('error', e)
  }

  _myOnClose() {
    this.connected = false
    this.socket = null
    this.emit('close')
  }

}

function getTimer() {
  return new Date().getTime()
}

function OnGagList() {
  return false
}

module.exports = { XatUser }
