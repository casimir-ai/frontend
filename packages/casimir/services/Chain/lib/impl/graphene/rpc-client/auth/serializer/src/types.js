'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ecc = require('../../ecc');

var _number_utils = require('./number_utils');

// Low-level types that make up operations

var v = require('./validation');
var ObjectId = require('./object_id');
var fp = require('./fast_parser');
var chain_types = require('./ChainTypes');

var Types = {};
module.exports = Types;

var HEX_DUMP = process.env.npm_config__graphene_serializer_hex_dump;

/**
 * Asset symbols contain the following information
 *
 *  4 bit PRECISION
 *  4 bit RESERVED
 *  CHAR[6] up to 6 upper case alpha numeric ascii characters,
 *  char = \0  null terminated
 *
 *  It is treated as a uint64_t for all internal operations, but
 *  is easily converted to something that can be displayed.
 */
Types.asset = {
    fromByteBuffer: function fromByteBuffer(b) {
        var amount = b.readInt64();
        var precision = b.readUint8();
        var b_copy = b.copy(b.offset, b.offset + 7);
        var symbol = new Buffer(b_copy.toBinary(), "binary").toString().replace(/\x00/g, "");
        b.skip(7);
        // "1.000 DEIP" always written with full precision
        var amount_string = (0, _number_utils.fromImpliedDecimal)(amount, precision);
        return amount_string + " " + symbol;
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        object = object.trim();
        if (!/^[0-9]+\.?[0-9]* [A-Za-z0-9]+$/.test(object)) throw new Error("Expecting amount like '99.000 SYMBOL', instead got '" + object + "'");

        var _object$split = object.split(" "),
            _object$split2 = _slicedToArray(_object$split, 2),
            amount = _object$split2[0],
            symbol = _object$split2[1];

        if (symbol.length > 6) throw new Error("Symbols are not longer than 6 characters " + symbol + "-" + symbol.length);

        b.writeInt64(v.to_long(amount.replace(".", "")));
        var dot = amount.indexOf("."); // 0.000
        var precision = dot === -1 ? 0 : amount.length - dot - 1;
        b.writeUint8(precision);
        b.append(symbol.toUpperCase(), 'binary');
        for (var i = 0; i < 7 - symbol.length; i++) {
            b.writeUint8(0);
        }return;
    },
    fromObject: function fromObject(object) {
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0.000 DEIP";
        }
        return object;
    }
};

Types.percent = {
    fromByteBuffer: function fromByteBuffer(b) {
        var amount = b.readInt64();
        var precision = b.readUint8();
        // "1.00 %" always written with full precision
        var amount_string = (0, _number_utils.fromImpliedDecimal)(amount, precision);
        return amount_string + " " + "%";
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        object = object.trim();
        if (!/^[0-9]+\.?[0-9]* [%]+$/.test(object)) throw new Error("Expecting amount like '50.00 %', instead got '" + object + "'");

        var _object$split3 = object.split(" "),
            _object$split4 = _slicedToArray(_object$split3, 2),
            amount = _object$split4[0],
            symbol = _object$split4[1];

        if (symbol != "%") throw new Error("Percent symbol % is not found");

        b.writeInt64(v.to_long(amount.replace(".", "")));
        var dot = amount.indexOf("."); // 0.00
        var precision = dot === -1 ? 0 : amount.length - dot - 1;
        b.writeUint8(precision);
        return;
    },
    fromObject: function fromObject(object) {
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0.00 %";
        }
        return object;
    }
};

Types.uint8 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint8();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.require_range(0, 0xFF, object, 'uint8 ' + object);
        b.writeUint8(object);
        return;
    },
    fromObject: function fromObject(object) {
        v.require_range(0, 0xFF, object, 'uint8 ' + object);
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return 0;
        }
        v.require_range(0, 0xFF, object, 'uint8 ' + object);
        return parseInt(object);
    }
};

Types.uint16 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint16();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.require_range(0, 0xFFFF, object, 'uint16 ' + object);
        b.writeUint16(object);
        return;
    },
    fromObject: function fromObject(object) {
        v.require_range(0, 0xFFFF, object, 'uint16 ' + object);
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return 0;
        }
        v.require_range(0, 0xFFFF, object, 'uint16 ' + object);
        return parseInt(object);
    }
};

Types.uint32 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint32();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.require_range(0, 0xFFFFFFFF, object, 'uint32 ' + object);
        b.writeUint32(object);
        return;
    },
    fromObject: function fromObject(object) {
        v.require_range(0, 0xFFFFFFFF, object, 'uint32 ' + object);
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return 0;
        }
        v.require_range(0, 0xFFFFFFFF, object, 'uint32 ' + object);
        return parseInt(object);
    }
};

var MIN_SIGNED_32 = -1 * Math.pow(2, 31);
var MAX_SIGNED_32 = Math.pow(2, 31) - 1;

Types.varint32 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readVarint32();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, 'uint32 ' + object);
        b.writeVarint32(object);
        return;
    },
    fromObject: function fromObject(object) {
        v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, 'uint32 ' + object);
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return 0;
        }
        v.require_range(MIN_SIGNED_32, MAX_SIGNED_32, object, 'uint32 ' + object);
        return parseInt(object);
    }
};

Types.int16 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readInt16();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        b.writeInt16(object);
        return;
    },
    fromObject: function fromObject(object) {
        return object;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return 0;
        }
        return parseInt(object);
    }
};

Types.int64 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readInt64();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.required(object);
        b.writeInt64(v.to_long(object));
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);
        return v.to_long(object);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0";
        }
        v.required(object);
        return v.to_long(object).toString();
    }
};

Types.uint64 = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint64();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        b.writeUint64(v.to_long(v.unsigned(object)));
        return;
    },
    fromObject: function fromObject(object) {
        return v.to_long(v.unsigned(object));
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0";
        }
        return v.to_long(object).toString();
    }
};

Types.string = {
    fromByteBuffer: function fromByteBuffer(b) {
        return new Buffer(b.readVString(), 'utf8');
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.required(object);
        b.writeVString(object.toString());
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);
        return new Buffer(object, 'utf8');
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "";
        }
        return object.toString('utf8');
    }
};

Types.string_binary = {
    fromByteBuffer: function fromByteBuffer(b) {
        var b_copy;
        var len = b.readVarint32();
        b_copy = b.copy(b.offset, b.offset + len), b.skip(len);
        return new Buffer(b_copy.toBinary(), 'binary');
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        b.writeVarint32(object.length);
        b.append(object.toString('binary'), 'binary');
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);
        return new Buffer(object);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "";
        }
        return object.toString();
    }
};

Types.bytes = function (size) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            if (size === undefined) {
                var b_copy;
                var len = b.readVarint32();
                b_copy = b.copy(b.offset, b.offset + len), b.skip(len);
                return new Buffer(b_copy.toBinary(), 'binary');
            } else {
                b_copy = b.copy(b.offset, b.offset + size), b.skip(size);
                return new Buffer(b_copy.toBinary(), 'binary');
            }
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            v.required(object);
            if (typeof object === "string") object = new Buffer(object, "hex");

            if (size === undefined) {
                b.writeVarint32(object.length);
            }
            b.append(object.toString('binary'), 'binary');
            return;
        },
        fromObject: function fromObject(object) {
            v.required(object);
            if (Buffer.isBuffer(object)) return object;

            return new Buffer(object, 'hex');
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (debug.use_default && object === undefined) {
                var zeros = function zeros(num) {
                    return new Array(num).join("00");
                };
                return zeros(size);
            }
            v.required(object);
            return object.toString('hex');
        }
    };
};

Types.bool = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint8() === 1;
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        // supports boolean or integer
        b.writeUint8(JSON.parse(object) ? 1 : 0);
        return;
    },
    fromObject: function fromObject(object) {
        return JSON.parse(object) ? true : false;
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return false;
        }
        return JSON.parse(object) ? true : false;
    }
};

Types.void = {
    fromByteBuffer: function fromByteBuffer(b) {
        throw new Error("(void) undefined type");
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        throw new Error("(void) undefined type");
    },
    fromObject: function fromObject(object) {
        throw new Error("(void) undefined type");
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return undefined;
        }
        throw new Error("(void) undefined type");
    }
};

Types.array = function (st_operation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var size = b.readVarint32();
            if (HEX_DUMP) {
                console.log("varint32 size = " + size.toString(16));
            }
            var result = [];
            for (var i = 0; 0 < size ? i < size : i > size; 0 < size ? i++ : i++) {
                result.push(st_operation.fromByteBuffer(b));
            }
            return sortOperation(result, st_operation);
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            v.required(object);
            object = sortOperation(object, st_operation);
            b.writeVarint32(object.length);
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                st_operation.appendByteBuffer(b, o);
            }
        },
        fromObject: function fromObject(object) {
            v.required(object);
            object = sortOperation(object, st_operation);
            var result = [];
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push(st_operation.fromObject(o));
            }
            return result;
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (debug.use_default && object === undefined) {
                return [st_operation.toObject(object, debug)];
            }
            v.required(object);
            object = sortOperation(object, st_operation);

            var result = [];
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push(st_operation.toObject(o, debug));
            }
            return result;
        }
    };
};

Types.time_point_sec = {
    fromByteBuffer: function fromByteBuffer(b) {
        return b.readUint32();
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        if (typeof object !== "number") object = Types.time_point_sec.fromObject(object);

        b.writeUint32(object);
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);

        if (typeof object === "number") return object;

        if (object.getTime) return Math.floor(object.getTime() / 1000);

        if (typeof object !== "string") throw new Error("Unknown date type: " + object);

        if (typeof object === "string" && !/Z$/.test(object)) object = object + "Z";

        return Math.floor(new Date(object).getTime() / 1000);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) return new Date(0).toISOString().split('.')[0];

        v.required(object);

        if (typeof object === "string") return object;

        if (object.getTime) return object.toISOString().split('.')[0];

        var int = parseInt(object);
        v.require_range(0, 0xFFFFFFFF, int, 'uint32 ' + object);
        return new Date(int * 1000).toISOString().split('.')[0];
    }
};

Types.set = function (st_operation) {
    return {
        validate: function validate(array) {
            var dup_map = {};
            for (var i = 0, o; i < array.length; i++) {
                o = array[i];
                var ref;
                if (ref = typeof o === 'undefined' ? 'undefined' : _typeof(o), ['string', 'number'].indexOf(ref) >= 0) {
                    if (dup_map[o] !== undefined) {
                        throw new Error("duplicate (set)");
                    }
                    dup_map[o] = true;
                }
            }
            return sortOperation(array, st_operation);
        },
        fromByteBuffer: function fromByteBuffer(b) {
            var size = b.readVarint32();
            if (HEX_DUMP) {
                console.log("varint32 size = " + size.toString(16));
            }
            return this.validate(function () {
                var result = [];
                for (var i = 0; 0 < size ? i < size : i > size; 0 < size ? i++ : i++) {
                    result.push(st_operation.fromByteBuffer(b));
                }
                return result;
            }());
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            if (!object) {
                object = [];
            }
            b.writeVarint32(object.length);
            var iterable = this.validate(object);
            for (var i = 0, o; i < iterable.length; i++) {
                o = iterable[i];
                st_operation.appendByteBuffer(b, o);
            }
            return;
        },
        fromObject: function fromObject(object) {
            if (!object) {
                object = [];
            }
            return this.validate(function () {
                var result = [];
                for (var i = 0, o; i < object.length; i++) {
                    o = object[i];
                    result.push(st_operation.fromObject(o));
                }
                return result;
            }());
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (debug.use_default && object === undefined) {
                return [st_operation.toObject(object, debug)];
            }
            if (!object) {
                object = [];
            }
            return this.validate(function () {
                var result = [];
                for (var i = 0, o; i < object.length; i++) {
                    o = object[i];
                    result.push(st_operation.toObject(o, debug));
                }
                return result;
            }());
        }
    };
};

// global_parameters_update_operation current_fees
Types.fixed_array = function (count, st_operation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var i, j, ref, results;
            results = [];
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                results.push(st_operation.fromByteBuffer(b));
            }
            return sortOperation(results, st_operation);
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            var i, j, ref;
            if (count !== 0) {
                v.required(object);
                object = sortOperation(object, st_operation);
            }
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                st_operation.appendByteBuffer(b, object[i]);
            }
        },
        fromObject: function fromObject(object) {
            var i, j, ref, results;
            if (count !== 0) {
                v.required(object);
            }
            results = [];
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                results.push(st_operation.fromObject(object[i]));
            }
            return results;
        },
        toObject: function toObject(object, debug) {
            var i, j, k, ref, ref1, results, results1;
            if (debug == null) {
                debug = {};
            }
            if (debug.use_default && object === void 0) {
                results = [];
                for (i = j = 0, ref = count; j < ref; i = j += 1) {
                    results.push(st_operation.toObject(void 0, debug));
                }
                return results;
            }
            if (count !== 0) {
                v.required(object);
            }
            results1 = [];
            for (i = k = 0, ref1 = count; k < ref1; i = k += 1) {
                results1.push(st_operation.toObject(object[i], debug));
            }
            return results1;
        }
    };
};

/* Supports instance numbers (11) or object types (1.2.11).  Object type
validation is enforced when an object type is used. */
var id_type = function id_type(reserved_spaces, object_type) {
    v.required(reserved_spaces, "reserved_spaces");
    v.required(object_type, "object_type");
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            return b.readVarint32();
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            v.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            // convert 1.2.n into just n
            if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
                object = v.get_instance(reserved_spaces, object_type, object);
            }
            b.writeVarint32(v.to_number(object));
            return;
        },
        fromObject: function fromObject(object) {
            v.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            if (v.is_digits(object)) {
                return v.to_number(object);
            }
            return v.get_instance(reserved_spaces, object_type, object);
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var object_type_id = chain_types.object_type[object_type];
            if (debug.use_default && object === undefined) {
                return reserved_spaces + '.' + object_type_id + '.0';
            }
            v.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
                object = v.get_instance(reserved_spaces, object_type, object);
            }

            return reserved_spaces + '.' + object_type_id + '.' + object;
        }
    };
};

Types.protocol_id_type = function (name) {
    v.required(name, "name");
    return id_type(chain_types.reserved_spaces.protocol_ids, name);
};

Types.object_id_type = {
    fromByteBuffer: function fromByteBuffer(b) {
        return ObjectId.fromByteBuffer(b);
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        object = ObjectId.fromString(object);
        object.appendByteBuffer(b);
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        return ObjectId.fromString(object);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0.0.0";
        }
        v.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        object = ObjectId.fromString(object);
        return object.toString();
    }
};

Types.vote_id = {
    TYPE: 0x000000FF,
    ID: 0xFFFFFF00,
    fromByteBuffer: function fromByteBuffer(b) {
        var value = b.readUint32();
        return {
            type: value & this.TYPE,
            id: value & this.ID
        };
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.required(object);
        if (object === "string") object = Types.vote_id.fromObject(object);

        var value = object.id << 8 | object.type;
        b.writeUint32(value);
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object, "(type vote_id)");
        if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === "object") {
            v.required(object.type, "type");
            v.required(object.id, "id");
            return object;
        }
        v.require_test(/^[0-9]+:[0-9]+$/, object, 'vote_id format ' + object);

        var _object$split5 = object.split(':'),
            _object$split6 = _slicedToArray(_object$split5, 2),
            type = _object$split6[0],
            id = _object$split6[1];

        v.require_range(0, 0xff, type, 'vote type ' + object);
        v.require_range(0, 0xffffff, id, 'vote id ' + object);
        return { type: type, id: id };
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return "0:0";
        }
        v.required(object);
        if (typeof object === "string") object = Types.vote_id.fromObject(object);

        return object.type + ":" + object.id;
    },
    compare: function compare(a, b) {
        if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== "object") a = Types.vote_id.fromObject(a);
        if ((typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== "object") b = Types.vote_id.fromObject(b);
        return parseInt(a.id) - parseInt(b.id);
    }
};

Types.optional = function (st_operation) {
    v.required(st_operation, "st_operation");
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            if (!(b.readUint8() === 1)) {
                return undefined;
            }
            return st_operation.fromByteBuffer(b);
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            if (object !== null && object !== undefined) {
                b.writeUint8(1);
                st_operation.appendByteBuffer(b, object);
            } else {
                b.writeUint8(0);
            }
            return;
        },
        fromObject: function fromObject(object) {
            if (object === undefined) {
                return undefined;
            }
            return st_operation.fromObject(object);
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            // toObject is only null save if use_default is true
            var result_object = function () {
                if (!debug.use_default && object === undefined) {
                    return undefined;
                } else {
                    return st_operation.toObject(object, debug);
                }
            }();

            if (debug.annotate) {
                if ((typeof result_object === 'undefined' ? 'undefined' : _typeof(result_object)) === "object") {
                    result_object.__optional = "parent is optional";
                } else {
                    result_object = { __optional: result_object };
                }
            }
            return result_object;
        }
    };
};

Types.static_variant = function (_st_operations) {
    return {
        nosort: true,
        st_operations: _st_operations,
        opTypeId: function opTypeId(value) {
            var pos = 0,
                type_id = void 0;
            if (typeof value === "number") type_id = value;else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.st_operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var op = _step.value;

                        if (op.operation_name === value) {
                            type_id = pos;
                            break;
                        }
                        pos++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            return type_id;
        },
        fromByteBuffer: function fromByteBuffer(b) {
            var type_id = b.readVarint32();
            var st_operation = this.st_operations[type_id];
            if (HEX_DUMP) {
                console.error('static_variant id 0x' + type_id.toString(16) + ' (' + type_id + ')');
            }
            v.required(st_operation, 'operation ' + type_id);
            return [type_id, st_operation.fromByteBuffer(b)];
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            v.required(object);
            var type_id = this.opTypeId(object[0]);
            var st_operation = this.st_operations[type_id];
            v.required(st_operation, 'operation ' + type_id);
            b.writeVarint32(type_id);
            st_operation.appendByteBuffer(b, object[1]);
            return;
        },
        fromObject: function fromObject(object) {
            v.required(object);
            var type_id = this.opTypeId(object[0]);
            var st_operation = this.st_operations[type_id];
            v.required(st_operation, 'operation ' + type_id);
            return [type_id, st_operation.fromObject(object[1])];
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (debug.use_default && object === undefined) {
                return [this.st_operations[0].operation_name, this.st_operations[0].toObject(undefined, debug)];
            }
            v.required(object);
            var type_id = this.opTypeId(object[0]);
            var st_operation = this.st_operations[type_id];
            v.required(st_operation, 'operation ' + type_id);
            return [st_operation.operation_name, st_operation.toObject(object[1], debug)];
        },
        compare: function compare(a, b) {
            return strCmp(this.opTypeId(a[0]), this.opTypeId(b[0]));
        }
    };
};

Types.map = function (key_st_operation, value_st_operation) {
    return {
        validate: function validate(array) {
            if (!Array.isArray(array)) {
                throw new Error("expecting array");
            }
            var dup_map = {};
            for (var i = 0, o; i < array.length; i++) {
                o = array[i];
                var ref;
                if (!(o.length === 2)) {
                    throw new Error("expecting two elements");
                }
                if (ref = _typeof(o[0]), ['number', 'string'].indexOf(ref) >= 0) {
                    if (dup_map[o[0]] !== undefined) {
                        throw new Error("duplicate (map)");
                    }
                    dup_map[o[0]] = true;
                }
            }
            return sortOperation(array, key_st_operation);
        },
        fromByteBuffer: function fromByteBuffer(b) {
            var result = [];
            var end = b.readVarint32();
            for (var i = 0; 0 < end ? i < end : i > end; 0 < end ? i++ : i++) {
                result.push([key_st_operation.fromByteBuffer(b), value_st_operation.fromByteBuffer(b)]);
            }
            return this.validate(result);
        },
        appendByteBuffer: function appendByteBuffer(b, object) {
            this.validate(object);
            b.writeVarint32(object.length);
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                key_st_operation.appendByteBuffer(b, o[0]);
                value_st_operation.appendByteBuffer(b, o[1]);
            }
            return;
        },
        fromObject: function fromObject(object) {
            v.required(object);
            var result = [];
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push([key_st_operation.fromObject(o[0]), value_st_operation.fromObject(o[1])]);
            }
            return this.validate(result);
        },
        toObject: function toObject(object) {
            var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (debug.use_default && object === undefined) {
                return [[key_st_operation.toObject(undefined, debug), value_st_operation.toObject(undefined, debug)]];
            }
            v.required(object);
            object = this.validate(object);
            var result = [];
            for (var i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push([key_st_operation.toObject(o[0], debug), value_st_operation.toObject(o[1], debug)]);
            }
            return result;
        }
    };
};

Types.public_key = {
    toPublic: function toPublic(object) {
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        return object == null ? object : object.Q ? object : _ecc.PublicKey.fromStringOrThrow(object);
    },
    fromByteBuffer: function fromByteBuffer(b) {
        return fp.public_key(b);
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        v.required(object);
        fp.public_key(b, Types.public_key.toPublic(object));
        return;
    },
    fromObject: function fromObject(object) {
        v.required(object);
        if (object.Q) {
            return object;
        }
        return Types.public_key.toPublic(object);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return _ecc.ecc_config.get('address_prefix') + "859gxfnXyUriMgUeThh1fWv3oqcpLFyHa3TfFYC4PK2HqhToVM";
        }
        v.required(object);
        return object.toString();
    },
    compare: function compare(a, b) {
        // sort ascending
        return 1 * strCmp(a.toString(), b.toString());
    }
};

Types.address = {
    _to_address: function _to_address(object) {
        v.required(object);
        if (object.addy) {
            return object;
        }
        return _ecc.Address.fromString(object);
    },
    fromByteBuffer: function fromByteBuffer(b) {
        return new _ecc.Address(fp.ripemd160(b));
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
        fp.ripemd160(b, Types.address._to_address(object).toBuffer());
        return;
    },
    fromObject: function fromObject(object) {
        return Types.address._to_address(object);
    },
    toObject: function toObject(object) {
        var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (debug.use_default && object === undefined) {
            return _ecc.ecc_config.get('address_prefix') + "664KmHxSuQyDsfwo4WEJvWpzg1QKdg67S";
        }
        return Types.address._to_address(object).toString();
    },
    compare: function compare(a, b) {
        // sort decending
        return -1 * strCmp(a.toString(), b.toString());
    }
};

var strCmp = function strCmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
};
var firstEl = function firstEl(el) {
    return Array.isArray(el) ? el[0] : el;
};
var sortOperation = function sortOperation(array, st_operation) {
    // console.log('operation.nosort', st_operation.nosort)
    return st_operation.nosort ? array : st_operation.compare ? array.sort(function (a, b) {
        return st_operation.compare(firstEl(a), firstEl(b));
    }) : // custom compare operation
    array.sort(function (a, b) {
        return typeof firstEl(a) === "number" && typeof firstEl(b) === "number" ? firstEl(a) - firstEl(b) :
        // A binary string compare does not work. Performanance is very good so HEX is used..  localeCompare is another option.
        Buffer.isBuffer(firstEl(a)) && Buffer.isBuffer(firstEl(b)) ? strCmp(firstEl(a).toString("hex"), firstEl(b).toString("hex")) : strCmp(firstEl(a).toString(), firstEl(b).toString());
    });
};