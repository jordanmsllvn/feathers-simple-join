"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Optimized join. Works for simple foreign key joins as well as join table joins.
 * Foreign key example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'groupId', remote: 'id'}
 *  })
 * ```
 *
 * Join table example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' }
 *  })
 * ```
 *
 * Optionally can add a list of fields to be excluded and or included on the join
 *
 * Include only certain fields example:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' },
 *    include: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 *
 * Join all fields except excluded:
 * ```
 *  let recordsWithJoinedData = await simpleJoin(users, {
 *    with: {service: app.service('groups'), as: 'group', local: 'id', remote: 'id'},
 *    through: {service: app.service('groups-users'), local: 'userId', remote: 'groupId' },
 *    exclude: ['fieldOne', 'fieldTwo']
 *  })
 * ```
 * @param options
 */
function simpleJoin(records, options) {
    return __awaiter(this, void 0, void 0, function () {
        var workingRecords, paginated, forcedArray, localIds, joins_1, remotesFromJoin, remotes_1, remotes_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Don't do anything at all if we have an empty record set
                    if (!records || (Array.isArray(records) && !records.length)) {
                        return [2 /*return*/, records];
                    }
                    if (!options.with)
                        throw new Error('feathers-simple-join: Cannot call without "with" defined');
                    if (options.include && options.exclude)
                        throw new Error("feathers-simple-join: Cannot have both includes and excludes");
                    paginated = false;
                    if (records.data && records.total) {
                        workingRecords = records.data;
                        paginated = true;
                    }
                    else {
                        workingRecords = records;
                    }
                    forcedArray = false;
                    if (!Array.isArray(workingRecords)) {
                        workingRecords = [workingRecords];
                        forcedArray = true;
                    }
                    localIds = Array.from(new Set(workingRecords.map(function (r) { return r[options.with.local]; })));
                    if (!options.through) return [3 /*break*/, 3];
                    return [4 /*yield*/, options.through.service.find({
                            query: (_a = {},
                                _a[options.through.local] = { $in: localIds },
                                _a),
                            paginate: false
                        })];
                case 1:
                    joins_1 = _d.sent();
                    remotesFromJoin = joins_1.map(function (j) { return j[options.through.remote]; });
                    return [4 /*yield*/, options.with.service.find({
                            query: (_b = {},
                                _b[options.with.remote] = { $in: remotesFromJoin },
                                _b),
                            paginate: false
                        })];
                case 2:
                    remotes_1 = _d.sent();
                    workingRecords = workingRecords.map(function (r) {
                        var remoteJoinsForRecord = joins_1
                            .filter(function (j) { return j[options.through.local] === r[options.with.local]; })
                            .map(function (j) { return j[options.through.remote]; });
                        r[options.with.as] = remotes_1.filter(function (rm) { return remoteJoinsForRecord.indexOf(rm[options.with.remote]) > -1; });
                        // Attach any extra fields existing in the join records themselves
                        if (options.through.attach && options.through.attach.length) {
                            r[options.with.as] = r[options.with.as].map(function (joinedRemote) {
                                var e_1, _a;
                                joinedRemote = __assign({}, joinedRemote);
                                var throughRecord = joins_1.find(function (j) {
                                    return j[options.through.remote] === joinedRemote[options.with.remote] && j[options.through.local] === r[options.with.local];
                                });
                                try {
                                    for (var _b = __values(options.through.attach), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var attachment = _c.value;
                                        joinedRemote[attachment] = throughRecord[attachment];
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                                return joinedRemote;
                            });
                        }
                        return r;
                    });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, options.with.service.find({
                        query: (_c = {},
                            _c[options.with.remote] = { $in: localIds },
                            _c),
                        paginate: false
                    })];
                case 4:
                    remotes_2 = _d.sent();
                    workingRecords = workingRecords.map(function (r) {
                        r[options.with.as] = remotes_2.find(function (rm) { return rm[options.with.remote] === r[options.with.local]; });
                        return r;
                    });
                    _d.label = 5;
                case 5:
                    // Field Filtering:
                    if (options.include && options.include.length) {
                        workingRecords = workingRecords.map(function (r) {
                            var e_2, _a;
                            var joinedRecord = r[options.with.as];
                            if (Array.isArray(joinedRecord)) {
                                joinedRecord = joinedRecord.map(function (jr) {
                                    var e_3, _a;
                                    var fields = {};
                                    try {
                                        for (var _b = __values(options.include), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var include = _c.value;
                                            if (typeof jr[include] !== undefined)
                                                fields[include] = jr[include];
                                        }
                                    }
                                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_3) throw e_3.error; }
                                    }
                                    jr = fields;
                                    return jr;
                                });
                            }
                            else {
                                var fields = {};
                                try {
                                    for (var _b = __values(options.include), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var include = _c.value;
                                        if (typeof joinedRecord[include] !== undefined)
                                            fields[include] = joinedRecord[include];
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                joinedRecord = fields;
                            }
                            r[options.with.as] = joinedRecord;
                            return r;
                        });
                    }
                    else if (options.exclude) {
                        workingRecords = workingRecords.map(function (r) {
                            var e_4, _a;
                            var joinedRecord = r[options.with.as];
                            if (Array.isArray(joinedRecord)) {
                                joinedRecord = joinedRecord.map(function (jr) {
                                    var e_5, _a;
                                    try {
                                        for (var _b = __values(options.exclude), _c = _b.next(); !_c.done; _c = _b.next()) {
                                            var exclude = _c.value;
                                            delete jr[exclude];
                                        }
                                    }
                                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                    finally {
                                        try {
                                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                        }
                                        finally { if (e_5) throw e_5.error; }
                                    }
                                    return jr;
                                });
                            }
                            else {
                                var fields = {};
                                try {
                                    for (var _b = __values(options.exclude), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var exclude = _c.value;
                                        delete joinedRecord[exclude];
                                    }
                                }
                                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_4) throw e_4.error; }
                                }
                            }
                            r[options.with.as] = joinedRecord;
                            return r;
                        });
                    }
                    // Convert back into a single record in the case we forced an array for working purposes
                    if (forcedArray)
                        workingRecords = workingRecords[0];
                    // Make sure we put the data where it belongs if we were working from paginated data
                    if (paginated) {
                        records.data = workingRecords;
                    }
                    else {
                        records = workingRecords;
                    }
                    return [2 /*return*/, records];
            }
        });
    });
}
exports.default = simpleJoin;
//# sourceMappingURL=simpleJoin.js.map