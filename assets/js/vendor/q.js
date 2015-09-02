! function(t) {
    "use strict";
    if ("function" == typeof bootstrap) bootstrap("promise", t);
    else if ("object" == typeof exports && "object" == typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define(t);
    else if ("undefined" != typeof ses) {
        if (!ses.ok()) return;
        ses.makeQ = t
    } else {
        if ("undefined" == typeof self) throw new Error("This environment was not anticipated by Q. Please file a bug.");
        self.Q = t()
    }
}(function() {
    "use strict";

    function t(t) {
        return function() {
            return K.apply(t, arguments)
        }
    }

    function n(t) {
        return t === Object(t)
    }

    function e(t) {
        return "[object StopIteration]" === en(t) || t instanceof q
    }

    function r(t, n) {
        if (V && n.stack && "object" == typeof t && null !== t && t.stack && -1 === t.stack.indexOf(rn)) {
            for (var e = [], r = n; r; r = r.source) r.stack && e.unshift(r.stack);
            e.unshift(t.stack);
            var i = e.join("\n" + rn + "\n");
            t.stack = o(i)
        }
    }

    function o(t) {
        for (var n = t.split("\n"), e = [], r = 0; r < n.length; ++r) {
            var o = n[r];
            c(o) || i(o) || !o || e.push(o)
        }
        return e.join("\n")
    }

    function i(t) {
        return -1 !== t.indexOf("(module.js:") || -1 !== t.indexOf("(node.js:")
    }

    function u(t) {
        var n = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(t);
        if (n) return [n[1], Number(n[2])];
        var e = /at ([^ ]+):(\d+):(?:\d+)$/.exec(t);
        if (e) return [e[1], Number(e[2])];
        var r = /.*@(.+):(\d+)$/.exec(t);
        return r ? [r[1], Number(r[2])] : void 0
    }

    function c(t) {
        var n = u(t);
        if (!n) return !1;
        var e = n[0],
            r = n[1];
        return e === _ && r >= z && sn >= r
    }

    function s() {
        if (V) try {
            throw new Error
        } catch (t) {
            var n = t.stack.split("\n"),
                e = n[0].indexOf("@") > 0 ? n[1] : n[2],
                r = u(e);
            if (!r) return;
            return _ = r[0], r[1]
        }
    }

    function f(t, n, e) {
        return function() {
            return "undefined" != typeof console && "function" == typeof console.warn && console.warn(n + " is deprecated, use " + e + " instead.", new Error("").stack), t.apply(t, arguments)
        }
    }

    function p(t) {
        return t instanceof h ? t : g(t) ? E(t) : O(t)
    }

    function a() {
        function t(t) {
            n = t, i.source = t, W(e, function(n, e) {
                p.nextTick(function() {
                    t.promiseDispatch.apply(t, e)
                })
            }, void 0), e = void 0, r = void 0
        }
        var n, e = [],
            r = [],
            o = Z(a.prototype),
            i = Z(h.prototype);
        if (i.promiseDispatch = function(t, o, i) {
                var u = L(arguments);
                e ? (e.push(u), "when" === o && i[1] && r.push(i[1])) : p.nextTick(function() {
                    n.promiseDispatch.apply(n, u)
                })
            }, i.valueOf = function() {
                if (e) return i;
                var t = v(n);
                return m(t) && (n = t), t
            }, i.inspect = function() {
                return n ? n.inspect() : {
                    state: "pending"
                }
            }, p.longStackSupport && V) try {
            throw new Error
        } catch (u) {
            i.stack = u.stack.substring(u.stack.indexOf("\n") + 1)
        }
        return o.promise = i, o.resolve = function(e) {
            n || t(p(e))
        }, o.fulfill = function(e) {
            n || t(O(e))
        }, o.reject = function(e) {
            n || t(R(e))
        }, o.notify = function(t) {
            n || W(r, function(n, e) {
                p.nextTick(function() {
                    e(t)
                })
            }, void 0)
        }, o
    }

    function l(t) {
        if ("function" != typeof t) throw new TypeError("resolver must be a function.");
        var n = a();
        try {
            t(n.resolve, n.reject, n.notify)
        } catch (e) {
            n.reject(e)
        }
        return n.promise
    }

    function d(t) {
        return l(function(n, e) {
            for (var r = 0, o = t.length; o > r; r++) p(t[r]).then(n, e)
        })
    }

    function h(t, n, e) {
        void 0 === n && (n = function(t) {
            return R(new Error("Promise does not support operation: " + t))
        }), void 0 === e && (e = function() {
            return {
                state: "unknown"
            }
        });
        var r = Z(h.prototype);
        if (r.promiseDispatch = function(e, o, i) {
                var u;
                try {
                    u = t[o] ? t[o].apply(r, i) : n.call(r, o, i)
                } catch (c) {
                    u = R(c)
                }
                e && e(u)
            }, r.inspect = e, e) {
            var o = e();
            "rejected" === o.state && (r.exception = o.reason), r.valueOf = function() {
                var t = e();
                return "pending" === t.state || "rejected" === t.state ? r : t.value
            }
        }
        return r
    }

    function y(t, n, e, r) {
        return p(t).then(n, e, r)
    }

    function v(t) {
        if (m(t)) {
            var n = t.inspect();
            if ("fulfilled" === n.state) return n.value
        }
        return t
    }

    function m(t) {
        return t instanceof h
    }

    function g(t) {
        return n(t) && "function" == typeof t.then
    }

    function k(t) {
        return m(t) && "pending" === t.inspect().state
    }

    function j(t) {
        return !m(t) || "fulfilled" === t.inspect().state
    }

    function w(t) {
        return m(t) && "rejected" === t.inspect().state
    }

    function x() {
        on.length = 0, un.length = 0, cn || (cn = !0)
    }

    function b(t, n) {
        cn && (un.push(t), on.push(n && "undefined" != typeof n.stack ? n.stack : "(no stack) " + n))
    }

    function T(t) {
        if (cn) {
            var n = X(un, t); - 1 !== n && (un.splice(n, 1), on.splice(n, 1))
        }
    }

    function R(t) {
        var n = h({
            when: function(n) {
                return n && T(this), n ? n(t) : this
            }
        }, function() {
            return this
        }, function() {
            return {
                state: "rejected",
                reason: t
            }
        });
        return b(n, t), n
    }

    function O(t) {
        return h({
            when: function() {
                return t
            },
            get: function(n) {
                return t[n]
            },
            set: function(n, e) {
                t[n] = e
            },
            "delete": function(n) {
                delete t[n]
            },
            post: function(n, e) {
                return null === n || void 0 === n ? t.apply(void 0, e) : t[n].apply(t, e)
            },
            apply: function(n, e) {
                return t.apply(n, e)
            },
            keys: function() {
                return nn(t)
            }
        }, void 0, function() {
            return {
                state: "fulfilled",
                value: t
            }
        })
    }

    function E(t) {
        var n = a();
        return p.nextTick(function() {
            try {
                t.then(n.resolve, n.reject, n.notify)
            } catch (e) {
                n.reject(e)
            }
        }), n.promise
    }

    function S(t) {
        return h({
            isDef: function() {}
        }, function(n, e) {
            return A(t, n, e)
        }, function() {
            return p(t).inspect()
        })
    }

    function N(t, n, e) {
        return p(t).spread(n, e)
    }

    function D(t) {
        return function() {
            function n(t, n) {
                var u;
                if ("undefined" == typeof StopIteration) {
                    try {
                        u = r[t](n)
                    } catch (c) {
                        return R(c)
                    }
                    return u.done ? p(u.value) : y(u.value, o, i)
                }
                try {
                    u = r[t](n)
                } catch (c) {
                    return e(c) ? p(c.value) : R(c)
                }
                return y(u, o, i)
            }
            var r = t.apply(this, arguments),
                o = n.bind(n, "next"),
                i = n.bind(n, "throw");
            return o()
        }
    }

    function P(t) {
        p.done(p.async(t)())
    }

    function C(t) {
        throw new q(t)
    }

    function I(t) {
        return function() {
            return N([this, U(arguments)], function(n, e) {
                return t.apply(n, e)
            })
        }
    }

    function A(t, n, e) {
        return p(t).dispatch(n, e)
    }

    function U(t) {
        return y(t, function(t) {
            var n = 0,
                e = a();
            return W(t, function(r, o, i) {
                var u;
                m(o) && "fulfilled" === (u = o.inspect()).state ? t[i] = u.value : (++n, y(o, function(r) {
                    t[i] = r, 0 === --n && e.resolve(t)
                }, e.reject, function(t) {
                    e.notify({
                        index: i,
                        value: t
                    })
                }))
            }, void 0), 0 === n && e.resolve(t), e.promise
        })
    }

    function F(t) {
        if (0 === t.length) return p.resolve();
        var n = p.defer(),
            e = 0;
        return W(t, function(r, o, i) {
            function u(t) {
                n.resolve(t)
            }

            function c() {
                e--, 0 === e && n.reject(new Error("Can't get fulfillment value from any promise, all promises were rejected."))
            }

            function s(t) {
                n.notify({
                    index: i,
                    value: t
                })
            }
            var f = t[i];
            e++, y(f, u, c, s)
        }, void 0), n.promise
    }

    function M(t) {
        return y(t, function(t) {
            return t = Y(t, p), y(U(Y(t, function(t) {
                return y(t, H, H)
            })), function() {
                return t
            })
        })
    }

    function Q(t) {
        return p(t).allSettled()
    }

    function B(t, n) {
        return p(t).then(void 0, void 0, n)
    }

    function $(t, n) {
        return p(t).nodeify(n)
    }
    var V = !1;
    try {
        throw new Error
    } catch (G) {
        V = !!G.stack
    }
    var _, q, z = s(),
        H = function() {},
        J = function() {
            function t() {
                for (; n.next;) {
                    n = n.next;
                    var e = n.task;
                    n.task = void 0;
                    var o = n.domain;
                    o && (n.domain = void 0, o.enter());
                    try {
                        e()
                    } catch (u) {
                        if (i) throw o && o.exit(), setTimeout(t, 0), o && o.enter(), u;
                        setTimeout(function() {
                            throw u
                        }, 0)
                    }
                    o && o.exit()
                }
                r = !1
            }
            var n = {
                    task: void 0,
                    next: null
                },
                e = n,
                r = !1,
                o = void 0,
                i = !1;
            if (J = function(t) {
                    e = e.next = {
                        task: t,
                        domain: i && process.domain,
                        next: null
                    }, r || (r = !0, o())
                }, "undefined" != typeof process && process.nextTick) i = !0, o = function() {
                process.nextTick(t)
            };
            else if ("function" == typeof setImmediate) o = "undefined" != typeof window ? setImmediate.bind(window, t) : function() {
                setImmediate(t)
            };
            else if ("undefined" != typeof MessageChannel) {
                var u = new MessageChannel;
                u.port1.onmessage = function() {
                    o = c, u.port1.onmessage = t, t()
                };
                var c = function() {
                    u.port2.postMessage(0)
                };
                o = function() {
                    setTimeout(t, 0), c()
                }
            } else o = function() {
                setTimeout(t, 0)
            };
            return J
        }(),
        K = Function.call,
        L = t(Array.prototype.slice),
        W = t(Array.prototype.reduce || function(t, n) {
            var e = 0,
                r = this.length;
            if (1 === arguments.length)
                for (;;) {
                    if (e in this) {
                        n = this[e++];
                        break
                    }
                    if (++e >= r) throw new TypeError
                }
            for (; r > e; e++) e in this && (n = t(n, this[e], e));
            return n
        }),
        X = t(Array.prototype.indexOf || function(t) {
            for (var n = 0; n < this.length; n++)
                if (this[n] === t) return n;
            return -1
        }),
        Y = t(Array.prototype.map || function(t, n) {
            var e = this,
                r = [];
            return W(e, function(o, i, u) {
                r.push(t.call(n, i, u, e))
            }, void 0), r
        }),
        Z = Object.create || function(t) {
            function n() {}
            return n.prototype = t, new n
        },
        tn = t(Object.prototype.hasOwnProperty),
        nn = Object.keys || function(t) {
            var n = [];
            for (var e in t) tn(t, e) && n.push(e);
            return n
        },
        en = t(Object.prototype.toString);
    q = "undefined" != typeof ReturnValue ? ReturnValue : function(t) {
        this.value = t
    };
    var rn = "From previous event:";
    p.resolve = p, p.nextTick = J, p.longStackSupport = !1, "object" == typeof process && process && process.env && process.env.Q_DEBUG && (p.longStackSupport = !0), p.defer = a, a.prototype.makeNodeResolver = function() {
        var t = this;
        return function(n, e) {
            n ? t.reject(n) : t.resolve(arguments.length > 2 ? L(arguments, 1) : e)
        }
    }, p.Promise = l, p.promise = l, l.race = d, l.all = U, l.reject = R, l.resolve = p, p.passByCopy = function(t) {
        return t
    }, h.prototype.passByCopy = function() {
        return this
    }, p.join = function(t, n) {
        return p(t).join(n)
    }, h.prototype.join = function(t) {
        return p([this, t]).spread(function(t, n) {
            if (t === n) return t;
            throw new Error("Can't join: not the same: " + t + " " + n)
        })
    }, p.race = d, h.prototype.race = function() {
        return this.then(p.race)
    }, p.makePromise = h, h.prototype.toString = function() {
        return "[object Promise]"
    }, h.prototype.then = function(t, n, e) {
        function o(n) {
            try {
                return "function" == typeof t ? t(n) : n
            } catch (e) {
                return R(e)
            }
        }

        function i(t) {
            if ("function" == typeof n) {
                r(t, c);
                try {
                    return n(t)
                } catch (e) {
                    return R(e)
                }
            }
            return R(t)
        }

        function u(t) {
            return "function" == typeof e ? e(t) : t
        }
        var c = this,
            s = a(),
            f = !1;
        return p.nextTick(function() {
            c.promiseDispatch(function(t) {
                f || (f = !0, s.resolve(o(t)))
            }, "when", [function(t) {
                f || (f = !0, s.resolve(i(t)))
            }])
        }), c.promiseDispatch(void 0, "when", [void 0, function(t) {
            var n, e = !1;
            try {
                n = u(t)
            } catch (r) {
                if (e = !0, !p.onerror) throw r;
                p.onerror(r)
            }
            e || s.notify(n)
        }]), s.promise
    }, p.tap = function(t, n) {
        return p(t).tap(n)
    }, h.prototype.tap = function(t) {
        return t = p(t), this.then(function(n) {
            return t.fcall(n).thenResolve(n)
        })
    }, p.when = y, h.prototype.thenResolve = function(t) {
        return this.then(function() {
            return t
        })
    }, p.thenResolve = function(t, n) {
        return p(t).thenResolve(n)
    }, h.prototype.thenReject = function(t) {
        return this.then(function() {
            throw t
        })
    }, p.thenReject = function(t, n) {
        return p(t).thenReject(n)
    }, p.nearer = v, p.isPromise = m, p.isPromiseAlike = g, p.isPending = k, h.prototype.isPending = function() {
        return "pending" === this.inspect().state
    }, p.isFulfilled = j, h.prototype.isFulfilled = function() {
        return "fulfilled" === this.inspect().state
    }, p.isRejected = w, h.prototype.isRejected = function() {
        return "rejected" === this.inspect().state
    };
    var on = [],
        un = [],
        cn = !0;
    p.resetUnhandledRejections = x, p.getUnhandledReasons = function() {
        return on.slice()
    }, p.stopUnhandledRejectionTracking = function() {
        x(), cn = !1
    }, x(), p.reject = R, p.fulfill = O, p.master = S, p.spread = N, h.prototype.spread = function(t, n) {
        return this.all().then(function(n) {
            return t.apply(void 0, n)
        }, n)
    }, p.async = D, p.spawn = P, p["return"] = C, p.promised = I, p.dispatch = A, h.prototype.dispatch = function(t, n) {
        var e = this,
            r = a();
        return p.nextTick(function() {
            e.promiseDispatch(r.resolve, t, n)
        }), r.promise
    }, p.get = function(t, n) {
        return p(t).dispatch("get", [n])
    }, h.prototype.get = function(t) {
        return this.dispatch("get", [t])
    }, p.set = function(t, n, e) {
        return p(t).dispatch("set", [n, e])
    }, h.prototype.set = function(t, n) {
        return this.dispatch("set", [t, n])
    }, p.del = p["delete"] = function(t, n) {
        return p(t).dispatch("delete", [n])
    }, h.prototype.del = h.prototype["delete"] = function(t) {
        return this.dispatch("delete", [t])
    }, p.mapply = p.post = function(t, n, e) {
        return p(t).dispatch("post", [n, e])
    }, h.prototype.mapply = h.prototype.post = function(t, n) {
        return this.dispatch("post", [t, n])
    }, p.send = p.mcall = p.invoke = function(t, n) {
        return p(t).dispatch("post", [n, L(arguments, 2)])
    }, h.prototype.send = h.prototype.mcall = h.prototype.invoke = function(t) {
        return this.dispatch("post", [t, L(arguments, 1)])
    }, p.fapply = function(t, n) {
        return p(t).dispatch("apply", [void 0, n])
    }, h.prototype.fapply = function(t) {
        return this.dispatch("apply", [void 0, t])
    }, p["try"] = p.fcall = function(t) {
        return p(t).dispatch("apply", [void 0, L(arguments, 1)])
    }, h.prototype.fcall = function() {
        return this.dispatch("apply", [void 0, L(arguments)])
    }, p.fbind = function(t) {
        var n = p(t),
            e = L(arguments, 1);
        return function() {
            return n.dispatch("apply", [this, e.concat(L(arguments))])
        }
    }, h.prototype.fbind = function() {
        var t = this,
            n = L(arguments);
        return function() {
            return t.dispatch("apply", [this, n.concat(L(arguments))])
        }
    }, p.keys = function(t) {
        return p(t).dispatch("keys", [])
    }, h.prototype.keys = function() {
        return this.dispatch("keys", [])
    }, p.all = U, h.prototype.all = function() {
        return U(this)
    }, p.any = F, h.prototype.any = function() {
        return F(this)
    }, p.allResolved = f(M, "allResolved", "allSettled"), h.prototype.allResolved = function() {
        return M(this)
    }, p.allSettled = Q, h.prototype.allSettled = function() {
        return this.then(function(t) {
            return U(Y(t, function(t) {
                function n() {
                    return t.inspect()
                }
                return t = p(t), t.then(n, n)
            }))
        })
    }, p.fail = p["catch"] = function(t, n) {
        return p(t).then(void 0, n)
    }, h.prototype.fail = h.prototype["catch"] = function(t) {
        return this.then(void 0, t)
    }, p.progress = B, h.prototype.progress = function(t) {
        return this.then(void 0, void 0, t)
    }, p.fin = p["finally"] = function(t, n) {
        return p(t)["finally"](n)
    }, h.prototype.fin = h.prototype["finally"] = function(t) {
        return t = p(t), this.then(function(n) {
            return t.fcall().then(function() {
                return n
            })
        }, function(n) {
            return t.fcall().then(function() {
                throw n
            })
        })
    }, p.done = function(t, n, e, r) {
        return p(t).done(n, e, r)
    }, h.prototype.done = function(t, n, e) {
        var o = function(t) {
                p.nextTick(function() {
                    if (r(t, i), !p.onerror) throw t;
                    p.onerror(t)
                })
            },
            i = t || n || e ? this.then(t, n, e) : this;
        "object" == typeof process && process && process.domain && (o = process.domain.bind(o)), i.then(void 0, o)
    }, p.timeout = function(t, n, e) {
        return p(t).timeout(n, e)
    }, h.prototype.timeout = function(t, n) {
        var e = a(),
            r = setTimeout(function() {
                n && "string" != typeof n || (n = new Error(n || "Timed out after " + t + " ms"), n.code = "ETIMEDOUT"), e.reject(n)
            }, t);
        return this.then(function(t) {
            clearTimeout(r), e.resolve(t)
        }, function(t) {
            clearTimeout(r), e.reject(t)
        }, e.notify), e.promise
    }, p.delay = function(t, n) {
        return void 0 === n && (n = t, t = void 0), p(t).delay(n)
    }, h.prototype.delay = function(t) {
        return this.then(function(n) {
            var e = a();
            return setTimeout(function() {
                e.resolve(n)
            }, t), e.promise
        })
    }, p.nfapply = function(t, n) {
        return p(t).nfapply(n)
    }, h.prototype.nfapply = function(t) {
        var n = a(),
            e = L(t);
        return e.push(n.makeNodeResolver()), this.fapply(e).fail(n.reject), n.promise
    }, p.nfcall = function(t) {
        var n = L(arguments, 1);
        return p(t).nfapply(n)
    }, h.prototype.nfcall = function() {
        var t = L(arguments),
            n = a();
        return t.push(n.makeNodeResolver()), this.fapply(t).fail(n.reject), n.promise
    }, p.nfbind = p.denodeify = function(t) {
        var n = L(arguments, 1);
        return function() {
            var e = n.concat(L(arguments)),
                r = a();
            return e.push(r.makeNodeResolver()), p(t).fapply(e).fail(r.reject), r.promise
        }
    }, h.prototype.nfbind = h.prototype.denodeify = function() {
        var t = L(arguments);
        return t.unshift(this), p.denodeify.apply(void 0, t)
    }, p.nbind = function(t, n) {
        var e = L(arguments, 2);
        return function() {
            function r() {
                return t.apply(n, arguments)
            }
            var o = e.concat(L(arguments)),
                i = a();
            return o.push(i.makeNodeResolver()), p(r).fapply(o).fail(i.reject), i.promise
        }
    }, h.prototype.nbind = function() {
        var t = L(arguments, 0);
        return t.unshift(this), p.nbind.apply(void 0, t)
    }, p.nmapply = p.npost = function(t, n, e) {
        return p(t).npost(n, e)
    }, h.prototype.nmapply = h.prototype.npost = function(t, n) {
        var e = L(n || []),
            r = a();
        return e.push(r.makeNodeResolver()), this.dispatch("post", [t, e]).fail(r.reject), r.promise
    }, p.nsend = p.nmcall = p.ninvoke = function(t, n) {
        var e = L(arguments, 2),
            r = a();
        return e.push(r.makeNodeResolver()), p(t).dispatch("post", [n, e]).fail(r.reject), r.promise
    }, h.prototype.nsend = h.prototype.nmcall = h.prototype.ninvoke = function(t) {
        var n = L(arguments, 1),
            e = a();
        return n.push(e.makeNodeResolver()), this.dispatch("post", [t, n]).fail(e.reject), e.promise
    }, p.nodeify = $, h.prototype.nodeify = function(t) {
        return t ? void this.then(function(n) {
            p.nextTick(function() {
                t(null, n)
            })
        }, function(n) {
            p.nextTick(function() {
                t(n)
            })
        }) : this
    };
    var sn = s();
    return p
});