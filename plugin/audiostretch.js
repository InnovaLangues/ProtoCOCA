function setupTypedArray(e, t) {
    typeof this[e] != "function" && typeof this[e] != "object" && (typeof this[t] == "function" && typeof this[t] != "object" ? this[e] = this[t] : this[e] = function(e) {
        if (e instanceof Array)
            return e;
        if (typeof e == "number")
            return new Array(e)
    })
}
function FourierTransform(e, t) {
    this.bufferSize = e, this.sampleRate = t, this.bandwidth = 2 / e * t / 2, this.spectrum = new Float32Array(e / 2), this.real = new Float32Array(e), this.imag = new Float32Array(e), this.peakBand = 0, this.peak = 0, this.getBandFrequency = function(e) {
        return this.bandwidth * e + this.bandwidth / 2
    }, this.calculateSpectrum = function() {
        var t = this.spectrum, n = this.real, r = this.imag, i = 2 / this.bufferSize, s = Math.sqrt, o, u, a;
        for (var f = 0, l = e / 2; f < l; f++)
            o = n[f], u = r[f], a = i * s(o * o + u * u), a > this.peak && (this.peakBand = f, this.peak = a), t[f] = a
    }
}
function DFT(e, t) {
    FourierTransform.call(this, e, t);
    var n = e / 2 * e, r = 2 * Math.PI;
    this.sinTable = new Float32Array(n), this.cosTable = new Float32Array(n);
    for (var i = 0; i < n; i++)
        this.sinTable[i] = Math.sin(i * r / e), this.cosTable[i] = Math.cos(i * r / e)
}
function FFT(e, t) {
    FourierTransform.call(this, e, t), this.reverseTable = new Uint32Array(e);
    var n = 1, r = e >> 1, i;
    while (n < e) {
        for (i = 0; i < n; i++)
            this.reverseTable[i + n] = this.reverseTable[i] + r;
        n <<= 1, r >>= 1
    }
    this.sinTable = new Float32Array(e), this.cosTable = new Float32Array(e);
    for (i = 0; i < e; i++)
        this.sinTable[i] = Math.sin(-Math.PI / i), this.cosTable[i] = Math.cos(-Math.PI / i)
}
function RFFT(e, t) {
    FourierTransform.call(this, e, t), this.trans = new Float32Array(e), this.reverseTable = new Uint32Array(e), this.reverseBinPermute = function(e, t) {
        var n = this.bufferSize, r = n >>> 1, i = n - 1, s = 1, o = 0, u;
        e[0] = t[0];
        do {
            o += r, e[s] = t[o], e[o] = t[s], s++, u = r << 1;
            while (u >>= 1, !((o ^= u) & u))
                ;
            o >= s && (e[s] = t[o], e[o] = t[s], e[i - s] = t[i - o], e[i - o] = t[i - s]), s++
        } while (s < r);
        e[i] = t[i]
    }, this.generateReverseTable = function() {
        var e = this.bufferSize, t = e >>> 1, n = e - 1, r = 1, i = 0, s;
        this.reverseTable[0] = 0;
        do {
            i += t, this.reverseTable[r] = i, this.reverseTable[i] = r, r++, s = t << 1;
            while (s >>= 1, !((i ^= s) & s))
                ;
            i >= r && (this.reverseTable[r] = i, this.reverseTable[i] = r, this.reverseTable[n - r] = n - i, this.reverseTable[n - i] = n - r), r++
        } while (r < t);
        this.reverseTable[n] = n
    }, this.generateReverseTable()
}
function Sampler(e, t, n, r, i, s, o, u) {
    this.file = e, this.bufferSize = t, this.sampleRate = n, this.playStart = r || 0, this.playEnd = i || 1, this.loopStart = s || 0, this.loopEnd = o || 1, this.loopMode = u || DSP.OFF, this.loaded = !1, this.samples = [], this.signal = new Float32Array(t), this.frameCount = 0, this.envelope = null, this.amplitude = 1, this.rootFrequency = 110, this.frequency = 550, this.step = this.frequency / this.rootFrequency, this.duration = 0, this.samplesProcessed = 0, this.playhead = 0;
    var a = document.createElement("AUDIO"), f = this;
    this.loadSamples = function(e) {
        var t = DSP.getChannel(DSP.MIX, e.frameBuffer);
        for (var n = 0; n < t.length; n++)
            f.samples.push(t[n])
    }, this.loadComplete = function() {
        f.samples = new Float32Array(f.samples), f.loaded = !0
    }, this.loadMetaData = function() {
        f.duration = a.duration
    }, a.addEventListener("MozAudioAvailable", this.loadSamples, !1), a.addEventListener("loadedmetadata", this.loadMetaData, !1), a.addEventListener("ended", this.loadComplete, !1), a.muted = !0, a.src = e, a.play()
}
function Oscillator(e, t, n, r, i) {
    this.frequency = t, this.amplitude = n, this.bufferSize = r, this.sampleRate = i, this.frameCount = 0, this.waveTableLength = 2048, this.cyclesPerSample = t / i, this.signal = new Float32Array(r), this.envelope = null;
    switch (parseInt(e, 10)) {
        case DSP.TRIANGLE:
            this.func = Oscillator.Triangle;
            break;
        case DSP.SAW:
            this.func = Oscillator.Saw;
            break;
        case DSP.SQUARE:
            this.func = Oscillator.Square;
            break;
        default:
        case DSP.SINE:
            this.func = Oscillator.Sine
    }
    this.generateWaveTable = function() {
        Oscillator.waveTable[this.func] = new Float32Array(2048);
        var e = this.waveTableLength / this.sampleRate, t = 1 / e;
        for (var n = 0; n < this.waveTableLength; n++)
            Oscillator.waveTable[this.func][n] = this.func(n * t / this.sampleRate)
    }, typeof Oscillator.waveTable == "undefined" && (Oscillator.waveTable = {}), typeof Oscillator.waveTable[this.func] == "undefined" && this.generateWaveTable(), this.waveTable = Oscillator.waveTable[this.func]
}
function ADSR(e, t, n, r, i, s) {
    this.sampleRate = s, this.attackLength = e, this.decayLength = t, this.sustainLevel = n, this.sustainLength = r, this.releaseLength = i, this.sampleRate = s, this.attackSamples = e * s, this.decaySamples = t * s, this.sustainSamples = r * s, this.releaseSamples = i * s, this.update = function() {
        this.attack = this.attackSamples, this.decay = this.attack + this.decaySamples, this.sustain = this.decay + this.sustainSamples, this.release = this.sustain + this.releaseSamples
    }, this.update(), this.samplesProcessed = 0
}
function IIRFilter(e, t, n, r) {
    this.sampleRate = r;
    switch (e) {
        case DSP.LOWPASS:
        case DSP.LP12:
            this.func = new IIRFilter.LP12(t, n, r)
        }
}
function IIRFilter2(e, t, n, r) {
    this.type = e, this.cutoff = t, this.resonance = n, this.sampleRate = r, this.f = Float32Array(4), this.f[0] = 0, this.f[1] = 0, this.f[2] = 0, this.f[3] = 0, this.calcCoeff = function(e, t) {
        this.freq = 2 * Math.sin(Math.PI * Math.min(.25, e / (this.sampleRate * 2))), this.damp = Math.min(2 * (1 - Math.pow(t, .25)), Math.min(2, 2 / this.freq - this.freq * .5))
    }, this.calcCoeff(t, n)
}
function WindowFunction(e, t) {
    this.alpha = t;
    switch (e) {
        case DSP.BARTLETT:
            this.func = WindowFunction.Bartlett;
            break;
        case DSP.BARTLETTHANN:
            this.func = WindowFunction.BartlettHann;
            break;
        case DSP.BLACKMAN:
            this.func = WindowFunction.Blackman, this.alpha = this.alpha || .16;
            break;
        case DSP.COSINE:
            this.func = WindowFunction.Cosine;
            break;
        case DSP.GAUSS:
            this.func = WindowFunction.Gauss, this.alpha = this.alpha || .25;
            break;
        case DSP.HAMMING:
            this.func = WindowFunction.Hamming;
            break;
        case DSP.HANN:
            this.func = WindowFunction.Hann;
            break;
        case DSP.LANCZOS:
            this.func = WindowFunction.Lanczoz;
            break;
        case DSP.RECTANGULAR:
            this.func = WindowFunction.Rectangular;
            break;
        case DSP.TRIANGULAR:
            this.func = WindowFunction.Triangular
        }
}
function sinh(e) {
    return(Math.exp(e) - Math.exp(-e)) / 2
}
function Biquad(e, t) {
    this.Fs = t, this.type = e, this.parameterType = DSP.Q, this.x_1_l = 0, this.x_2_l = 0, this.y_1_l = 0, this.y_2_l = 0, this.x_1_r = 0, this.x_2_r = 0, this.y_1_r = 0, this.y_2_r = 0, this.b0 = 1, this.a0 = 1, this.b1 = 0, this.a1 = 0, this.b2 = 0, this.a2 = 0, this.b0a0 = this.b0 / this.a0, this.b1a0 = this.b1 / this.a0, this.b2a0 = this.b2 / this.a0, this.a1a0 = this.a1 / this.a0, this.a2a0 = this.a2 / this.a0, this.f0 = 3e3, this.dBgain = 12, this.Q = 1, this.BW = -3, this.S = 1, this.coefficients = function() {
        var e = [this.b0, this.b1, this.b2], t = [this.a0, this.a1, this.a2];
        return{b: e, a: t}
    }, this.setFilterType = function(e) {
        this.type = e, this.recalculateCoefficients()
    }, this.setSampleRate = function(e) {
        this.Fs = e, this.recalculateCoefficients()
    }, this.setQ = function(e) {
        this.parameterType = DSP.Q, this.Q = Math.max(Math.min(e, 115), .001), this.recalculateCoefficients()
    }, this.setBW = function(e) {
        this.parameterType = DSP.BW, this.BW = e, this.recalculateCoefficients()
    }, this.setS = function(e) {
        this.parameterType = DSP.S, this.S = Math.max(Math.min(e, 5), 1e-4), this.recalculateCoefficients()
    }, this.setF0 = function(e) {
        this.f0 = e, this.recalculateCoefficients()
    }, this.setDbGain = function(e) {
        this.dBgain = e, this.recalculateCoefficients()
    }, this.recalculateCoefficients = function() {
        var t;
        e === DSP.PEAKING_EQ || e === DSP.LOW_SHELF || e === DSP.HIGH_SHELF ? t = Math.pow(10, this.dBgain / 40) : t = Math.sqrt(Math.pow(10, this.dBgain / 20));
        var n = DSP.TWO_PI * this.f0 / this.Fs, r = Math.cos(n), i = Math.sin(n), s = 0;
        switch (this.parameterType) {
            case DSP.Q:
                s = i / (2 * this.Q);
                break;
            case DSP.BW:
                s = i * sinh(Math.LN2 / 2 * this.BW * n / i);
                break;
            case DSP.S:
                s = i / 2 * Math.sqrt((t + 1 / t) * (1 / this.S - 1) + 2)
        }
        var o;
        switch (this.type) {
            case DSP.LPF:
                this.b0 = (1 - r) / 2, this.b1 = 1 - r, this.b2 = (1 - r) / 2, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.HPF:
                this.b0 = (1 + r) / 2, this.b1 = -(1 + r), this.b2 = (1 + r) / 2, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.BPF_CONSTANT_SKIRT:
                this.b0 = i / 2, this.b1 = 0, this.b2 = -i / 2, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.BPF_CONSTANT_PEAK:
                this.b0 = s, this.b1 = 0, this.b2 = -s, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.NOTCH:
                this.b0 = 1, this.b1 = -2 * r, this.b2 = 1, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.APF:
                this.b0 = 1 - s, this.b1 = -2 * r, this.b2 = 1 + s, this.a0 = 1 + s, this.a1 = -2 * r, this.a2 = 1 - s;
                break;
            case DSP.PEAKING_EQ:
                this.b0 = 1 + s * t, this.b1 = -2 * r, this.b2 = 1 - s * t, this.a0 = 1 + s / t, this.a1 = -2 * r, this.a2 = 1 - s / t;
                break;
            case DSP.LOW_SHELF:
                o = i * Math.sqrt((t ^ 3) * (1 / this.S - 1) + 2 * t), this.b0 = t * (t + 1 - (t - 1) * r + o), this.b1 = 2 * t * (t - 1 - (t + 1) * r), this.b2 = t * (t + 1 - (t - 1) * r - o), this.a0 = t + 1 + (t - 1) * r + o, this.a1 = -2 * (t - 1 + (t + 1) * r), this.a2 = t + 1 + (t - 1) * r - o;
                break;
            case DSP.HIGH_SHELF:
                o = i * Math.sqrt((t ^ 3) * (1 / this.S - 1) + 2 * t), this.b0 = t * (t + 1 + (t - 1) * r + o), this.b1 = -2 * t * (t - 1 + (t + 1) * r), this.b2 = t * (t + 1 + (t - 1) * r - o), this.a0 = t + 1 - (t - 1) * r + o, this.a1 = 2 * (t - 1 - (t + 1) * r), this.a2 = t + 1 - (t - 1) * r - o
        }
        this.b0a0 = this.b0 / this.a0, this.b1a0 = this.b1 / this.a0, this.b2a0 = this.b2 / this.a0, this.a1a0 = this.a1 / this.a0, this.a2a0 = this.a2 / this.a0
    }, this.process = function(e) {
        var t = e.length, n = new Float32Array(t);
        for (var r = 0; r < e.length; r++)
            n[r] = this.b0a0 * e[r] + this.b1a0 * this.x_1_l + this.b2a0 * this.x_2_l - this.a1a0 * this.y_1_l - this.a2a0 * this.y_2_l, this.y_2_l = this.y_1_l, this.y_1_l = n[r], this.x_2_l = this.x_1_l, this.x_1_l = e[r];
        return n
    }, this.processStereo = function(e) {
        var t = e.length, n = new Float32Array(t);
        for (var r = 0; r < t / 2; r++)
            n[2 * r] = this.b0a0 * e[2 * r] + this.b1a0 * this.x_1_l + this.b2a0 * this.x_2_l - this.a1a0 * this.y_1_l - this.a2a0 * this.y_2_l, this.y_2_l = this.y_1_l, this.y_1_l = n[2 * r], this.x_2_l = this.x_1_l, this.x_1_l = e[2 * r], n[2 * r + 1] = this.b0a0 * e[2 * r + 1] + this.b1a0 * this.x_1_r + this.b2a0 * this.x_2_r - this.a1a0 * this.y_1_r - this.a2a0 * this.y_2_r, this.y_2_r = this.y_1_r, this.y_1_r = n[2 * r + 1], this.x_2_r = this.x_1_r, this.x_1_r = e[2 * r + 1];
        return n
    }
}
function GraphicalEq(e) {
    this.FS = e, this.minFreq = 40, this.maxFreq = 16e3, this.bandsPerOctave = 1, this.filters = [], this.freqzs = [], this.calculateFreqzs = !0, this.recalculateFilters = function() {
        var e = Math.round(Math.log(this.maxFreq / this.minFreq) * this.bandsPerOctave / Math.LN2);
        this.filters = [];
        for (var t = 0; t < e; t++) {
            var n = this.minFreq * Math.pow(2, t / this.bandsPerOctave), r = new Biquad(DSP.PEAKING_EQ, this.FS);
            r.setDbGain(0), r.setBW(1 / this.bandsPerOctave), r.setF0(n), this.filters[t] = r, this.recalculateFreqz(t)
        }
    }, this.setMinimumFrequency = function(e) {
        this.minFreq = e, this.recalculateFilters()
    }, this.setMaximumFrequency = function(e) {
        this.maxFreq = e, this.recalculateFilters()
    }, this.setBandsPerOctave = function(e) {
        this.bandsPerOctave = e, this.recalculateFilters()
    }, this.setBandGain = function(e, t) {
        if (e < 0 || e > this.filters.length - 1)
            throw"The band index of the graphical equalizer is out of bounds.";
        if (!t)
            throw"A gain must be passed.";
        this.filters[e].setDbGain(t), this.recalculateFreqz(e)
    }, this.recalculateFreqz = function(e) {
        if (!this.calculateFreqzs)
            return;
        if (e < 0 || e > this.filters.length - 1)
            throw"The band index of the graphical equalizer is out of bounds. " + e + " is out of [" + 0 + ", " + this.filters.length - 1 + "]";
        if (!this.w) {
            this.w = Float32Array(400);
            for (var t = 0; t < this.w.length; t++)
                this.w[t] = Math.PI / this.w.length * t
        }
        var n = [this.filters[e].b0, this.filters[e].b1, this.filters[e].b2], r = [this.filters[e].a0, this.filters[e].a1, this.filters[e].a2];
        this.freqzs[e] = DSP.mag2db(DSP.freqz(n, r, this.w))
    }, this.process = function(e) {
        var t = e;
        for (var n = 0; n < this.filters.length; n++)
            t = this.filters[n].process(t);
        return t
    }, this.processStereo = function(e) {
        var t = e;
        for (var n = 0; n < this.filters.length; n++)
            t = this.filters[n].processStereo(t);
        return t
    }
}
function MultiDelay(e, t, n, r) {
    this.delayBufferSamples = new Float32Array(e), this.delayInputPointer = t, this.delayOutputPointer = 0, this.delayInSamples = t, this.masterVolume = n, this.delayVolume = r
}
function SingleDelay(e, t, n) {
    this.delayBufferSamples = new Float32Array(e), this.delayInputPointer = t, this.delayOutputPointer = 0, this.delayInSamples = t, this.delayVolume = n
}
function Reverb(e, t, n, r, i, s) {
    this.delayInSamples = t, this.masterVolume = n, this.mixVolume = r, this.delayVolume = i, this.dampFrequency = s, this.NR_OF_MULTIDELAYS = 6, this.NR_OF_SINGLEDELAYS = 6, this.LOWPASSL = new IIRFilter2(DSP.LOWPASS, s, 0, 44100), this.LOWPASSR = new IIRFilter2(DSP.LOWPASS, s, 0, 44100), this.singleDelays = [];
    var o, u;
    for (o = 0; o < this.NR_OF_SINGLEDELAYS; o++)
        u = 1 + o / 7, this.singleDelays[o] = new SingleDelay(e, Math.round(this.delayInSamples * u), this.delayVolume);
    this.multiDelays = [];
    for (o = 0; o < this.NR_OF_MULTIDELAYS; o++)
        u = 1 + o / 10, this.multiDelays[o] = new MultiDelay(e, Math.round(this.delayInSamples * u), this.masterVolume, this.delayVolume)
}
(function(e, undefined) {
    function j(e) {
        var t = e.length, n = x.type(e);
        return x.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === n || "function" !== n && (0 === t || "number" == typeof t && t > 0 && t - 1 in e)
    }
    function A(e) {
        var t = D[e] = {};
        return x.each(e.match(w) || [], function(e, n) {
            t[n] = !0
        }), t
    }
    function F() {
        Object.defineProperty(this.cache = {}, 0, {get: function() {
                return{}
            }}), this.expando = x.expando + Math.random()
    }
    function P(e, t, n) {
        var r;
        if (n === undefined && 1 === e.nodeType)
            if (r = "data-" + t.replace(O, "-$1").toLowerCase(), n = e.getAttribute(r), "string" == typeof n) {
                try {
                    n = "true" === n ? !0 : "false" === n ? !1 : "null" === n ? null : +n + "" === n ? +n : H.test(n) ? JSON.parse(n) : n
                } catch (i) {
                }
                L.set(e, t, n)
            } else
                n = undefined;
        return n
    }
    function U() {
        return!0
    }
    function Y() {
        return!1
    }
    function V() {
        try {
            return o.activeElement
        } catch (e) {
        }
    }
    function Z(e, t) {
        while ((e = e[t]) && 1 !== e.nodeType)
            ;
        return e
    }
    function et(e, t, n) {
        if (x.isFunction(t))
            return x.grep(e, function(e, r) {
                return!!t.call(e, r, e) !== n
            });
        if (t.nodeType)
            return x.grep(e, function(e) {
                return e === t !== n
            });
        if ("string" == typeof t) {
            if (G.test(t))
                return x.filter(t, e, n);
            t = x.filter(t, e)
        }
        return x.grep(e, function(e) {
            return g.call(t, e) >= 0 !== n
        })
    }
    function pt(e, t) {
        return x.nodeName(e, "table") && x.nodeName(1 === t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
    }
    function ft(e) {
        return e.type = (null !== e.getAttribute("type")) + "/" + e.type, e
    }
    function ht(e) {
        var t = ut.exec(e.type);
        return t ? e.type = t[1] : e.removeAttribute("type"), e
    }
    function dt(e, t) {
        var n = e.length, r = 0;
        for (; n > r; r++)
            q.set(e[r], "globalEval", !t || q.get(t[r], "globalEval"))
    }
    function gt(e, t) {
        var n, r, i, s, o, u, a, f;
        if (1 === t.nodeType) {
            if (q.hasData(e) && (s = q.access(e), o = q.set(t, s), f = s.events)) {
                delete o.handle, o.events = {};
                for (i in f)
                    for (n = 0, r = f[i].length; r > n; n++)
                        x.event.add(t, i, f[i][n])
            }
            L.hasData(e) && (u = L.access(e), a = x.extend({}, u), L.set(t, a))
        }
    }
    function mt(e, t) {
        var n = e.getElementsByTagName ? e.getElementsByTagName(t || "*") : e.querySelectorAll ? e.querySelectorAll(t || "*") : [];
        return t === undefined || t && x.nodeName(e, t) ? x.merge([e], n) : n
    }
    function yt(e, t) {
        var n = t.nodeName.toLowerCase();
        "input" === n && ot.test(e.type) ? t.checked = e.checked : ("input" === n || "textarea" === n) && (t.defaultValue = e.defaultValue)
    }
    function At(e, t) {
        if (t in e)
            return t;
        var n = t.charAt(0).toUpperCase() + t.slice(1), r = t, i = Dt.length;
        while (i--)
            if (t = Dt[i] + n, t in e)
                return t;
        return r
    }
    function Lt(e, t) {
        return e = t || e, "none" === x.css(e, "display") || !x.contains(e.ownerDocument, e)
    }
    function qt(t) {
        return e.getComputedStyle(t, null)
    }
    function Ht(e, t) {
        var n, r, i, s = [], o = 0, u = e.length;
        for (; u > o; o++)
            r = e[o], r.style && (s[o] = q.get(r, "olddisplay"), n = r.style.display, t ? (s[o] || "none" !== n || (r.style.display = ""), "" === r.style.display && Lt(r) && (s[o] = q.access(r, "olddisplay", Rt(r.nodeName)))) : s[o] || (i = Lt(r), (n && "none" !== n || !i) && q.set(r, "olddisplay", i ? n : x.css(r, "display"))));
        for (o = 0; u > o; o++)
            r = e[o], r.style && (t && "none" !== r.style.display && "" !== r.style.display || (r.style.display = t ? s[o] || "" : "none"));
        return e
    }
    function Ot(e, t, n) {
        var r = Tt.exec(t);
        return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
    }
    function Ft(e, t, n, r, i) {
        var s = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0, o = 0;
        for (; 4 > s; s += 2)
            "margin" === n && (o += x.css(e, n + jt[s], !0, i)), r ? ("content" === n && (o -= x.css(e, "padding" + jt[s], !0, i)), "margin" !== n && (o -= x.css(e, "border" + jt[s] + "Width", !0, i))) : (o += x.css(e, "padding" + jt[s], !0, i), "padding" !== n && (o += x.css(e, "border" + jt[s] + "Width", !0, i)));
        return o
    }
    function Pt(e, t, n) {
        var r = !0, i = "width" === t ? e.offsetWidth : e.offsetHeight, s = qt(e), o = x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, s);
        if (0 >= i || null == i) {
            if (i = vt(e, t, s), (0 > i || null == i) && (i = e.style[t]), Ct.test(i))
                return i;
            r = o && (x.support.boxSizingReliable || i === e.style[t]), i = parseFloat(i) || 0
        }
        return i + Ft(e, t, n || (o ? "border" : "content"), r, s) + "px"
    }
    function Rt(e) {
        var t = o, n = Nt[e];
        return n || (n = Mt(e, t), "none" !== n && n || (xt = (xt || x("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(t.documentElement), t = (xt[0].contentWindow || xt[0].contentDocument).document, t.write("<!doctype html><html><body>"), t.close(), n = Mt(e, t), xt.detach()), Nt[e] = n), n
    }
    function Mt(e, t) {
        var n = x(t.createElement(e)).appendTo(t.body), r = x.css(n[0], "display");
        return n.remove(), r
    }
    function _t(e, t, n, r) {
        var i;
        if (x.isArray(t))
            x.each(t, function(t, i) {
                n || $t.test(e) ? r(e, i) : _t(e + "[" + ("object" == typeof i ? t : "") + "]", i, n, r)
            });
        else if (n || "object" !== x.type(t))
            r(e, t);
        else
            for (i in t)
                _t(e + "[" + i + "]", t[i], n, r)
    }
    function un(e) {
        return function(t, n) {
            "string" != typeof t && (n = t, t = "*");
            var r, i = 0, s = t.toLowerCase().match(w) || [];
            if (x.isFunction(n))
                while (r = s[i++])
                    "+" === r[0] ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
        }
    }
    function ln(e, t, n, r) {
        function o(u) {
            var a;
            return i[u] = !0, x.each(e[u] || [], function(e, u) {
                var f = u(t, n, r);
                return"string" != typeof f || s || i[f] ? s ? !(a = f) : undefined : (t.dataTypes.unshift(f), o(f), !1)
            }), a
        }
        var i = {}, s = e === on;
        return o(t.dataTypes[0]) || !i["*"] && o("*")
    }
    function cn(e, t) {
        var n, r, i = x.ajaxSettings.flatOptions || {};
        for (n in t)
            t[n] !== undefined && ((i[n] ? e : r || (r = {}))[n] = t[n]);
        return r && x.extend(!0, e, r), e
    }
    function pn(e, t, n) {
        var r, i, s, o, u = e.contents, a = e.dataTypes;
        while ("*" === a[0])
            a.shift(), r === undefined && (r = e.mimeType || t.getResponseHeader("Content-Type"));
        if (r)
            for (i in u)
                if (u[i] && u[i].test(r)) {
                    a.unshift(i);
                    break
                }
        if (a[0]in n)
            s = a[0];
        else {
            for (i in n) {
                if (!a[0] || e.converters[i + " " + a[0]]) {
                    s = i;
                    break
                }
                o || (o = i)
            }
            s = s || o
        }
        return s ? (s !== a[0] && a.unshift(s), n[s]) : undefined
    }
    function fn(e, t, n, r) {
        var i, s, o, u, a, f = {}, l = e.dataTypes.slice();
        if (l[1])
            for (o in e.converters)
                f[o.toLowerCase()] = e.converters[o];
        s = l.shift();
        while (s)
            if (e.responseFields[s] && (n[e.responseFields[s]] = t), !a && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), a = s, s = l.shift())
                if ("*" === s)
                    s = a;
                else if ("*" !== a && a !== s) {
                    if (o = f[a + " " + s] || f["* " + s], !o)
                        for (i in f)
                            if (u = i.split(" "), u[1] === s && (o = f[a + " " + u[0]] || f["* " + u[0]])) {
                                o === !0 ? o = f[i] : f[i] !== !0 && (s = u[0], l.unshift(u[1]));
                                break
                            }
                    if (o !== !0)
                        if (o && e["throws"])
                            t = o(t);
                        else
                            try {
                                t = o(t)
                            } catch (c) {
                                return{state: "parsererror", error: o ? c : "No conversion from " + a + " to " + s}
                            }
                }
        return{state: "success", data: t}
    }
    function En() {
        return setTimeout(function() {
            xn = undefined
        }), xn = x.now()
    }
    function Sn(e, t, n) {
        var r, i = (Nn[t] || []).concat(Nn["*"]), s = 0, o = i.length;
        for (; o > s; s++)
            if (r = i[s].call(n, t, e))
                return r
    }
    function jn(e, t, n) {
        var r, i, s = 0, o = kn.length, u = x.Deferred().always(function() {
            delete a.elem
        }), a = function() {
            if (i)
                return!1;
            var t = xn || En(), n = Math.max(0, f.startTime + f.duration - t), r = n / f.duration || 0, s = 1 - r, o = 0, a = f.tweens.length;
            for (; a > o; o++)
                f.tweens[o].run(s);
            return u.notifyWith(e, [f, s, n]), 1 > s && a ? n : (u.resolveWith(e, [f]), !1)
        }, f = u.promise({elem: e, props: x.extend({}, t), opts: x.extend(!0, {specialEasing: {}}, n), originalProperties: t, originalOptions: n, startTime: xn || En(), duration: n.duration, tweens: [], createTween: function(t, n) {
                var r = x.Tween(e, f.opts, t, n, f.opts.specialEasing[t] || f.opts.easing);
                return f.tweens.push(r), r
            }, stop: function(t) {
                var n = 0, r = t ? f.tweens.length : 0;
                if (i)
                    return this;
                for (i = !0; r > n; n++)
                    f.tweens[n].run(1);
                return t ? u.resolveWith(e, [f, t]) : u.rejectWith(e, [f, t]), this
            }}), l = f.props;
        for (Dn(l, f.opts.specialEasing); o > s; s++)
            if (r = kn[s].call(f, e, l, f.opts))
                return r;
        return x.map(l, Sn, f), x.isFunction(f.opts.start) && f.opts.start.call(e, f), x.fx.timer(x.extend(a, {elem: e, anim: f, queue: f.opts.queue})), f.progress(f.opts.progress).done(f.opts.done, f.opts.complete).fail(f.opts.fail).always(f.opts.always)
    }
    function Dn(e, t) {
        var n, r, i, s, o;
        for (n in e)
            if (r = x.camelCase(n), i = t[r], s = e[n], x.isArray(s) && (i = s[1], s = e[n] = s[0]), n !== r && (e[r] = s, delete e[n]), o = x.cssHooks[r], o && "expand"in o) {
                s = o.expand(s), delete e[r];
                for (n in s)
                    n in e || (e[n] = s[n], t[n] = i)
            } else
                t[r] = i
    }
    function An(e, t, n) {
        var r, i, s, o, u, a, f = this, l = {}, c = e.style, h = e.nodeType && Lt(e), p = q.get(e, "fxshow");
        n.queue || (u = x._queueHooks(e, "fx"), null == u.unqueued && (u.unqueued = 0, a = u.empty.fire, u.empty.fire = function() {
            u.unqueued || a()
        }), u.unqueued++, f.always(function() {
            f.always(function() {
                u.unqueued--, x.queue(e, "fx").length || u.empty.fire()
            })
        })), 1 === e.nodeType && ("height"in t || "width"in t) && (n.overflow = [c.overflow, c.overflowX, c.overflowY], "inline" === x.css(e, "display") && "none" === x.css(e, "float") && (c.display = "inline-block")), n.overflow && (c.overflow = "hidden", f.always(function() {
            c.overflow = n.overflow[0], c.overflowX = n.overflow[1], c.overflowY = n.overflow[2]
        }));
        for (r in t)
            if (i = t[r], wn.exec(i)) {
                if (delete t[r], s = s || "toggle" === i, i === (h ? "hide" : "show")) {
                    if ("show" !== i || !p || p[r] === undefined)
                        continue;
                    h = !0
                }
                l[r] = p && p[r] || x.style(e, r)
            }
        if (!x.isEmptyObject(l)) {
            p ? "hidden"in p && (h = p.hidden) : p = q.access(e, "fxshow", {}), s && (p.hidden = !h), h ? x(e).show() : f.done(function() {
                x(e).hide()
            }), f.done(function() {
                var t;
                q.remove(e, "fxshow");
                for (t in l)
                    x.style(e, t, l[t])
            });
            for (r in l)
                o = Sn(h ? p[r] : 0, r, f), r in p || (p[r] = o.start, h && (o.end = o.start, o.start = "width" === r || "height" === r ? 1 : 0))
        }
    }
    function Ln(e, t, n, r, i) {
        return new Ln.prototype.init(e, t, n, r, i)
    }
    function qn(e, t) {
        var n, r = {height: e}, i = 0;
        for (t = t?1:0; 4 > i; i += 2 - t)
            n = jt[i], r["margin" + n] = r["padding" + n] = e;
        return t && (r.opacity = r.width = e), r
    }
    function Hn(e) {
        return x.isWindow(e) ? e : 9 === e.nodeType && e.defaultView
    }
    var t, n, r = typeof undefined, i = e.location, o = e.document, s = o.documentElement, a = e.jQuery, u = e.$, l = {}, c = [], p = "2.0.3", f = c.concat, h = c.push, d = c.slice, g = c.indexOf, m = l.toString, y = l.hasOwnProperty, v = p.trim, x = function(e, n) {
        return new x.fn.init(e, n, t)
    }, b = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, w = /\S+/g, T = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, C = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, k = /^-ms-/, N = /-([\da-z])/gi, E = function(e, t) {
        return t.toUpperCase()
    }, S = function() {
        o.removeEventListener("DOMContentLoaded", S, !1), e.removeEventListener("load", S, !1), x.ready()
    };
    x.fn = x.prototype = {jquery: p, constructor: x, init: function(e, t, n) {
            var r, i;
            if (!e)
                return this;
            if ("string" == typeof e) {
                if (r = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : T.exec(e), !r || !r[1] && t)
                    return!t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
                if (r[1]) {
                    if (t = t instanceof x ? t[0] : t, x.merge(this, x.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : o, !0)), C.test(r[1]) && x.isPlainObject(t))
                        for (r in t)
                            x.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
                    return this
                }
                return i = o.getElementById(r[2]), i && i.parentNode && (this.length = 1, this[0] = i), this.context = o, this.selector = e, this
            }
            return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : x.isFunction(e) ? n.ready(e) : (e.selector !== undefined && (this.selector = e.selector, this.context = e.context), x.makeArray(e, this))
        }, selector: "", length: 0, toArray: function() {
            return d.call(this)
        }, get: function(e) {
            return null == e ? this.toArray() : 0 > e ? this[this.length + e] : this[e]
        }, pushStack: function(e) {
            var t = x.merge(this.constructor(), e);
            return t.prevObject = this, t.context = this.context, t
        }, each: function(e, t) {
            return x.each(this, e, t)
        }, ready: function(e) {
            return x.ready.promise().done(e), this
        }, slice: function() {
            return this.pushStack(d.apply(this, arguments))
        }, first: function() {
            return this.eq(0)
        }, last: function() {
            return this.eq(-1)
        }, eq: function(e) {
            var t = this.length, n = +e + (0 > e ? t : 0);
            return this.pushStack(n >= 0 && t > n ? [this[n]] : [])
        }, map: function(e) {
            return this.pushStack(x.map(this, function(t, n) {
                return e.call(t, n, t)
            }))
        }, end: function() {
            return this.prevObject || this.constructor(null)
        }, push: h, sort: [].sort, splice: [].splice}, x.fn.init.prototype = x.fn, x.extend = x.fn.extend = function() {
        var e, t, n, r, i, s, o = arguments[0] || {}, u = 1, a = arguments.length, f = !1;
        for ("boolean" == typeof o && (f = o, o = arguments[1] || {}, u = 2), "object" == typeof o || x.isFunction(o) || (o = {}), a === u && (o = this, --u); a > u; u++)
            if (null != (e = arguments[u]))
                for (t in e)
                    n = o[t], r = e[t], o !== r && (f && r && (x.isPlainObject(r) || (i = x.isArray(r))) ? (i ? (i = !1, s = n && x.isArray(n) ? n : []) : s = n && x.isPlainObject(n) ? n : {}, o[t] = x.extend(f, s, r)) : r !== undefined && (o[t] = r));
        return o
    }, x.extend({expando: "jQuery" + (p + Math.random()).replace(/\D/g, ""), noConflict: function(t) {
            return e.$ === x && (e.$ = u), t && e.jQuery === x && (e.jQuery = a), x
        }, isReady: !1, readyWait: 1, holdReady: function(e) {
            e ? x.readyWait++ : x.ready(!0)
        }, ready: function(e) {
            (e === !0 ? --x.readyWait : x.isReady) || (x.isReady = !0, e !== !0 && --x.readyWait > 0 || (n.resolveWith(o, [x]), x.fn.trigger && x(o).trigger("ready").off("ready")))
        }, isFunction: function(e) {
            return"function" === x.type(e)
        }, isArray: Array.isArray, isWindow: function(e) {
            return null != e && e === e.window
        }, isNumeric: function(e) {
            return!isNaN(parseFloat(e)) && isFinite(e)
        }, type: function(e) {
            return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? l[m.call(e)] || "object" : typeof e
        }, isPlainObject: function(e) {
            if ("object" !== x.type(e) || e.nodeType || x.isWindow(e))
                return!1;
            try {
                if (e.constructor && !y.call(e.constructor.prototype, "isPrototypeOf"))
                    return!1
            } catch (t) {
                return!1
            }
            return!0
        }, isEmptyObject: function(e) {
            var t;
            for (t in e)
                return!1;
            return!0
        }, error: function(e) {
            throw Error(e)
        }, parseHTML: function(e, t, n) {
            if (!e || "string" != typeof e)
                return null;
            "boolean" == typeof t && (n = t, t = !1), t = t || o;
            var r = C.exec(e), i = !n && [];
            return r ? [t.createElement(r[1])] : (r = x.buildFragment([e], t, i), i && x(i).remove(), x.merge([], r.childNodes))
        }, parseJSON: JSON.parse, parseXML: function(e) {
            var t, n;
            if (!e || "string" != typeof e)
                return null;
            try {
                n = new DOMParser, t = n.parseFromString(e, "text/xml")
            } catch (r) {
                t = undefined
            }
            return(!t || t.getElementsByTagName("parsererror").length) && x.error("Invalid XML: " + e), t
        }, noop: function() {
        }, globalEval: function(e) {
            var t, n = eval;
            e = x.trim(e), e && (1 === e.indexOf("use strict") ? (t = o.createElement("script"), t.text = e, o.head.appendChild(t).parentNode.removeChild(t)) : n(e))
        }, camelCase: function(e) {
            return e.replace(k, "ms-").replace(N, E)
        }, nodeName: function(e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        }, each: function(e, t, n) {
            var r, i = 0, s = e.length, o = j(e);
            if (n) {
                if (o) {
                    for (; s > i; i++)
                        if (r = t.apply(e[i], n), r === !1)
                            break
                } else
                    for (i in e)
                        if (r = t.apply(e[i], n), r === !1)
                            break
            } else if (o) {
                for (; s > i; i++)
                    if (r = t.call(e[i], i, e[i]), r === !1)
                        break
            } else
                for (i in e)
                    if (r = t.call(e[i], i, e[i]), r === !1)
                        break;
            return e
        }, trim: function(e) {
            return null == e ? "" : v.call(e)
        }, makeArray: function(e, t) {
            var n = t || [];
            return null != e && (j(Object(e)) ? x.merge(n, "string" == typeof e ? [e] : e) : h.call(n, e)), n
        }, inArray: function(e, t, n) {
            return null == t ? -1 : g.call(t, e, n)
        }, merge: function(e, t) {
            var n = t.length, r = e.length, i = 0;
            if ("number" == typeof n)
                for (; n > i; i++)
                    e[r++] = t[i];
            else
                while (t[i] !== undefined)
                    e[r++] = t[i++];
            return e.length = r, e
        }, grep: function(e, t, n) {
            var r, i = [], s = 0, o = e.length;
            for (n = !!n; o > s; s++)
                r = !!t(e[s], s), n !== r && i.push(e[s]);
            return i
        }, map: function(e, t, n) {
            var r, i = 0, s = e.length, o = j(e), u = [];
            if (o)
                for (; s > i; i++)
                    r = t(e[i], i, n), null != r && (u[u.length] = r);
            else
                for (i in e)
                    r = t(e[i], i, n), null != r && (u[u.length] = r);
            return f.apply([], u)
        }, guid: 1, proxy: function(e, t) {
            var n, r, i;
            return"string" == typeof t && (n = e[t], t = e, e = n), x.isFunction(e) ? (r = d.call(arguments, 2), i = function() {
                return e.apply(t || this, r.concat(d.call(arguments)))
            }, i.guid = e.guid = e.guid || x.guid++, i) : undefined
        }, access: function(e, t, n, r, i, s, o) {
            var u = 0, a = e.length, f = null == n;
            if ("object" === x.type(n)) {
                i = !0;
                for (u in n)
                    x.access(e, t, u, n[u], !0, s, o)
            } else if (r !== undefined && (i = !0, x.isFunction(r) || (o = !0), f && (o ? (t.call(e, r), t = null) : (f = t, t = function(e, t, n) {
                return f.call(x(e), n)
            })), t))
                for (; a > u; u++)
                    t(e[u], n, o ? r : r.call(e[u], u, t(e[u], n)));
            return i ? e : f ? t.call(e) : a ? t(e[0], n) : s
        }, now: Date.now, swap: function(e, t, n, r) {
            var i, s, o = {};
            for (s in t)
                o[s] = e.style[s], e.style[s] = t[s];
            i = n.apply(e, r || []);
            for (s in t)
                e.style[s] = o[s];
            return i
        }}), x.ready.promise = function(t) {
        return n || (n = x.Deferred(), "complete" === o.readyState ? setTimeout(x.ready) : (o.addEventListener("DOMContentLoaded", S, !1), e.addEventListener("load", S, !1))), n.promise(t)
    }, x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(e, t) {
        l["[object " + t + "]"] = t.toLowerCase()
    }), t = x(o), function(e, t) {
        function ot(e, t, n, i) {
            var s, o, u, a, f, l, p, m, g, E;
            if ((t ? t.ownerDocument || t : w) !== h && c(t), t = t || h, n = n || [], !e || "string" != typeof e)
                return n;
            if (1 !== (a = t.nodeType) && 9 !== a)
                return[];
            if (d && !i) {
                if (s = Z.exec(e))
                    if (u = s[1]) {
                        if (9 === a) {
                            if (o = t.getElementById(u), !o || !o.parentNode)
                                return n;
                            if (o.id === u)
                                return n.push(o), n
                        } else if (t.ownerDocument && (o = t.ownerDocument.getElementById(u)) && y(t, o) && o.id === u)
                            return n.push(o), n
                    } else {
                        if (s[2])
                            return H.apply(n, t.getElementsByTagName(e)), n;
                        if ((u = s[3]) && r.getElementsByClassName && t.getElementsByClassName)
                            return H.apply(n, t.getElementsByClassName(u)), n
                    }
                if (r.qsa && (!v || !v.test(e))) {
                    if (m = p = b, g = t, E = 9 === a && e, 1 === a && "object" !== t.nodeName.toLowerCase()) {
                        l = mt(e), (p = t.getAttribute("id")) ? m = p.replace(nt, "\\$&") : t.setAttribute("id", m), m = "[id='" + m + "'] ", f = l.length;
                        while (f--)
                            l[f] = m + gt(l[f]);
                        g = $.test(e) && t.parentNode || t, E = l.join(",")
                    }
                    if (E)
                        try {
                            return H.apply(n, g.querySelectorAll(E)), n
                        } catch (S) {
                        } finally {
                            p || t.removeAttribute("id")
                        }
                }
            }
            return Nt(e.replace(W, "$1"), t, n, i)
        }
        function ut() {
            function t(n, r) {
                return e.push(n += " ") > s.cacheLength && delete t[e.shift()], t[n] = r
            }
            var e = [];
            return t
        }
        function at(e) {
            return e[b] = !0, e
        }
        function ft(e) {
            var t = h.createElement("div");
            try {
                return!!e(t)
            } catch (n) {
                return!1
            } finally {
                t.parentNode && t.parentNode.removeChild(t), t = null
            }
        }
        function lt(e, t) {
            var n = e.split("|"), r = e.length;
            while (r--)
                s.attrHandle[n[r]] = t
        }
        function ct(e, t) {
            var n = t && e, r = n && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || O) - (~e.sourceIndex || O);
            if (r)
                return r;
            if (n)
                while (n = n.nextSibling)
                    if (n === t)
                        return-1;
            return e ? 1 : -1
        }
        function ht(e) {
            return function(t) {
                var n = t.nodeName.toLowerCase();
                return"input" === n && t.type === e
            }
        }
        function pt(e) {
            return function(t) {
                var n = t.nodeName.toLowerCase();
                return("input" === n || "button" === n) && t.type === e
            }
        }
        function dt(e) {
            return at(function(t) {
                return t = +t, at(function(n, r) {
                    var i, s = e([], n.length, t), o = s.length;
                    while (o--)
                        n[i = s[o]] && (n[i] = !(r[i] = n[i]))
                })
            })
        }
        function vt() {
        }
        function mt(e, t) {
            var n, r, i, o, u, a, f, l = N[e + " "];
            if (l)
                return t ? 0 : l.slice(0);
            u = e, a = [], f = s.preFilter;
            while (u) {
                (!n || (r = X.exec(u))) && (r && (u = u.slice(r[0].length) || u), a.push(i = [])), n = !1, (r = V.exec(u)) && (n = r.shift(), i.push({value: n, type: r[0].replace(W, " ")}), u = u.slice(n.length));
                for (o in s.filter)
                    !(r = G[o].exec(u)) || f[o] && !(r = f[o](r)) || (n = r.shift(), i.push({value: n, type: o, matches: r}), u = u.slice(n.length));
                if (!n)
                    break
            }
            return t ? u.length : u ? ot.error(e) : N(e, a).slice(0)
        }
        function gt(e) {
            var t = 0, n = e.length, r = "";
            for (; n > t; t++)
                r += e[t].value;
            return r
        }
        function yt(e, t, n) {
            var r = t.dir, s = n && "parentNode" === r, o = S++;
            return t.first ? function(t, n, i) {
                while (t = t[r])
                    if (1 === t.nodeType || s)
                        return e(t, n, i)
            } : function(t, n, u) {
                var a, f, l, c = E + " " + o;
                if (u) {
                    while (t = t[r])
                        if ((1 === t.nodeType || s) && e(t, n, u))
                            return!0
                } else
                    while (t = t[r])
                        if (1 === t.nodeType || s)
                            if (l = t[b] || (t[b] = {}), (f = l[r]) && f[0] === c) {
                                if ((a = f[1]) === !0 || a === i)
                                    return a === !0
                            } else if (f = l[r] = [c], f[1] = e(t, n, u) || i, f[1] === !0)
                                return!0
            }
        }
        function bt(e) {
            return e.length > 1 ? function(t, n, r) {
                var i = e.length;
                while (i--)
                    if (!e[i](t, n, r))
                        return!1;
                return!0
            } : e[0]
        }
        function wt(e, t, n, r, i) {
            var s, o = [], u = 0, a = e.length, f = null != t;
            for (; a > u; u++)
                (s = e[u]) && (!n || n(s, r, i)) && (o.push(s), f && t.push(u));
            return o
        }
        function Et(e, t, n, r, i, s) {
            return r && !r[b] && (r = Et(r)), i && !i[b] && (i = Et(i, s)), at(function(s, o, u, a) {
                var f, l, c, h = [], p = [], d = o.length, v = s || Tt(t || "*", u.nodeType ? [u] : u, []), m = !e || !s && t ? v : wt(v, h, e, u, a), g = n ? i || (s ? e : d || r) ? [] : o : m;
                if (n && n(m, g, u, a), r) {
                    f = wt(g, p), r(f, [], u, a), l = f.length;
                    while (l--)
                        (c = f[l]) && (g[p[l]] = !(m[p[l]] = c))
                }
                if (s) {
                    if (i || e) {
                        if (i) {
                            f = [], l = g.length;
                            while (l--)
                                (c = g[l]) && f.push(m[l] = c);
                            i(null, g = [], f, a)
                        }
                        l = g.length;
                        while (l--)
                            (c = g[l]) && (f = i ? j.call(s, c) : h[l]) > -1 && (s[f] = !(o[f] = c))
                    }
                } else
                    g = wt(g === o ? g.splice(d, g.length) : g), i ? i(null, o, g, a) : H.apply(o, g)
            })
        }
        function St(e) {
            var t, n, r, i = e.length, o = s.relative[e[0].type], u = o || s.relative[" "], a = o ? 1 : 0, l = yt(function(e) {
                return e === t
            }, u, !0), c = yt(function(e) {
                return j.call(t, e) > -1
            }, u, !0), h = [function(e, n, r) {
                    return!o && (r || n !== f) || ((t = n).nodeType ? l(e, n, r) : c(e, n, r))
                }];
            for (; i > a; a++)
                if (n = s.relative[e[a].type])
                    h = [yt(bt(h), n)];
                else {
                    if (n = s.filter[e[a].type].apply(null, e[a].matches), n[b]) {
                        for (r = ++a; i > r; r++)
                            if (s.relative[e[r].type])
                                break;
                        return Et(a > 1 && bt(h), a > 1 && gt(e.slice(0, a - 1).concat({value: " " === e[a - 2].type ? "*" : ""})).replace(W, "$1"), n, r > a && St(e.slice(a, r)), i > r && St(e = e.slice(r)), i > r && gt(e))
                    }
                    h.push(n)
                }
            return bt(h)
        }
        function xt(e, t) {
            var n = 0, r = t.length > 0, o = e.length > 0, u = function(u, a, l, c, p) {
                var d, v, m, g = [], y = 0, b = "0", w = u && [], S = null != p, x = f, T = u || o && s.find.TAG("*", p && a.parentNode || a), N = E += null == x ? 1 : Math.random() || .1;
                for (S && (f = a !== h && a, i = n); null != (d = T[b]); b++) {
                    if (o && d) {
                        v = 0;
                        while (m = e[v++])
                            if (m(d, a, l)) {
                                c.push(d);
                                break
                            }
                        S && (E = N, i = ++n)
                    }
                    r && ((d = !m && d) && y--, u && w.push(d))
                }
                if (y += b, r && b !== y) {
                    v = 0;
                    while (m = t[v++])
                        m(w, g, a, l);
                    if (u) {
                        if (y > 0)
                            while (b--)
                                w[b] || g[b] || (g[b] = D.call(c));
                        g = wt(g)
                    }
                    H.apply(c, g), S && !u && g.length > 0 && y + t.length > 1 && ot.uniqueSort(c)
                }
                return S && (E = N, f = x), w
            };
            return r ? at(u) : u
        }
        function Tt(e, t, n) {
            var r = 0, i = t.length;
            for (; i > r; r++)
                ot(e, t[r], n);
            return n
        }
        function Nt(e, t, n, i) {
            var o, u, f, l, c, h = mt(e);
            if (!i && 1 === h.length) {
                if (u = h[0] = h[0].slice(0), u.length > 2 && "ID" === (f = u[0]).type && r.getById && 9 === t.nodeType && d && s.relative[u[1].type]) {
                    if (t = (s.find.ID(f.matches[0].replace(rt, it), t) || [])[0], !t)
                        return n;
                    e = e.slice(u.shift().value.length)
                }
                o = G.needsContext.test(e) ? 0 : u.length;
                while (o--) {
                    if (f = u[o], s.relative[l = f.type])
                        break;
                    if ((c = s.find[l]) && (i = c(f.matches[0].replace(rt, it), $.test(u[0].type) && t.parentNode || t))) {
                        if (u.splice(o, 1), e = i.length && gt(u), !e)
                            return H.apply(n, i), n;
                        break
                    }
                }
            }
            return a(e, h)(i, t, !d, n, $.test(e)), n
        }
        var n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y, b = "sizzle" + -(new Date), w = e.document, E = 0, S = 0, T = ut(), N = ut(), C = ut(), k = !1, L = function(e, t) {
            return e === t ? (k = !0, 0) : 0
        }, A = typeof t, O = 1 << 31, M = {}.hasOwnProperty, _ = [], D = _.pop, P = _.push, H = _.push, B = _.slice, j = _.indexOf || function(e) {
            var t = 0, n = this.length;
            for (; n > t; t++)
                if (this[t] === e)
                    return t;
            return-1
        }, F = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", I = "[\\x20\\t\\r\\n\\f]", q = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", R = q.replace("w", "w#"), U = "\\[" + I + "*(" + q + ")" + I + "*(?:([*^$|!~]?=)" + I + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + R + ")|)|)" + I + "*\\]", z = ":(" + q + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + U.replace(3, 8) + ")*)|.*)\\)|)", W = RegExp("^" + I + "+|((?:^|[^\\\\])(?:\\\\.)*)" + I + "+$", "g"), X = RegExp("^" + I + "*," + I + "*"), V = RegExp("^" + I + "*([>+~]|" + I + ")" + I + "*"), $ = RegExp(I + "*[+~]"), J = RegExp("=" + I + "*([^\\]'\"]*)" + I + "*\\]", "g"), K = RegExp(z), Q = RegExp("^" + R + "$"), G = {ID: RegExp("^#(" + q + ")"), CLASS: RegExp("^\\.(" + q + ")"), TAG: RegExp("^(" + q.replace("w", "w*") + ")"), ATTR: RegExp("^" + U), PSEUDO: RegExp("^" + z), CHILD: RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + I + "*(even|odd|(([+-]|)(\\d*)n|)" + I + "*(?:([+-]|)" + I + "*(\\d+)|))" + I + "*\\)|)", "i"), bool: RegExp("^(?:" + F + ")$", "i"), needsContext: RegExp("^" + I + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + I + "*((?:-\\d)?\\d*)" + I + "*\\)|)(?=[^-]|$)", "i")}, Y = /^[^{]+\{\s*\[native \w/, Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, et = /^(?:input|select|textarea|button)$/i, tt = /^h\d$/i, nt = /'|\\/g, rt = RegExp("\\\\([\\da-f]{1,6}" + I + "?|(" + I + ")|.)", "ig"), it = function(e, t, n) {
            var r = "0x" + t - 65536;
            return r !== r || n ? t : 0 > r ? String.fromCharCode(r + 65536) : String.fromCharCode(55296 | r >> 10, 56320 | 1023 & r)
        };
        try {
            H.apply(_ = B.call(w.childNodes), w.childNodes), _[w.childNodes.length].nodeType
        } catch (st) {
            H = {apply: _.length ? function(e, t) {
                    P.apply(e, B.call(t))
                } : function(e, t) {
                    var n = e.length, r = 0;
                    while (e[n++] = t[r++])
                        ;
                    e.length = n - 1
                }}
        }
        u = ot.isXML = function(e) {
            var t = e && (e.ownerDocument || e).documentElement;
            return t ? "HTML" !== t.nodeName : !1
        }, r = ot.support = {}, c = ot.setDocument = function(e) {
            var n = e ? e.ownerDocument || e : w, i = n.defaultView;
            return n !== h && 9 === n.nodeType && n.documentElement ? (h = n, p = n.documentElement, d = !u(n), i && i.attachEvent && i !== i.top && i.attachEvent("onbeforeunload", function() {
                c()
            }), r.attributes = ft(function(e) {
                return e.className = "i", !e.getAttribute("className")
            }), r.getElementsByTagName = ft(function(e) {
                return e.appendChild(n.createComment("")), !e.getElementsByTagName("*").length
            }), r.getElementsByClassName = ft(function(e) {
                return e.innerHTML = "<div class='a'></div><div class='a i'></div>", e.firstChild.className = "i", 2 === e.getElementsByClassName("i").length
            }), r.getById = ft(function(e) {
                return p.appendChild(e).id = b, !n.getElementsByName || !n.getElementsByName(b).length
            }), r.getById ? (s.find.ID = function(e, t) {
                if (typeof t.getElementById !== A && d) {
                    var n = t.getElementById(e);
                    return n && n.parentNode ? [n] : []
                }
            }, s.filter.ID = function(e) {
                var t = e.replace(rt, it);
                return function(e) {
                    return e.getAttribute("id") === t
                }
            }) : (delete s.find.ID, s.filter.ID = function(e) {
                var t = e.replace(rt, it);
                return function(e) {
                    var n = typeof e.getAttributeNode !== A && e.getAttributeNode("id");
                    return n && n.value === t
                }
            }), s.find.TAG = r.getElementsByTagName ? function(e, n) {
                return typeof n.getElementsByTagName !== A ? n.getElementsByTagName(e) : t
            } : function(e, t) {
                var n, r = [], i = 0, s = t.getElementsByTagName(e);
                if ("*" === e) {
                    while (n = s[i++])
                        1 === n.nodeType && r.push(n);
                    return r
                }
                return s
            }, s.find.CLASS = r.getElementsByClassName && function(e, n) {
                return typeof n.getElementsByClassName !== A && d ? n.getElementsByClassName(e) : t
            }, m = [], v = [], (r.qsa = Y.test(n.querySelectorAll)) && (ft(function(e) {
                e.innerHTML = "<select><option selected=''></option></select>", e.querySelectorAll("[selected]").length || v.push("\\[" + I + "*(?:value|" + F + ")"), e.querySelectorAll(":checked").length || v.push(":checked")
            }), ft(function(e) {
                var t = n.createElement("input");
                t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("t", ""), e.querySelectorAll("[t^='']").length && v.push("[*^$]=" + I + "*(?:''|\"\")"), e.querySelectorAll(":enabled").length || v.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), v.push(",.*:")
            })), (r.matchesSelector = Y.test(g = p.webkitMatchesSelector || p.mozMatchesSelector || p.oMatchesSelector || p.msMatchesSelector)) && ft(function(e) {
                r.disconnectedMatch = g.call(e, "div"), g.call(e, "[s!='']:x"), m.push("!=", z)
            }), v = v.length && RegExp(v.join("|")), m = m.length && RegExp(m.join("|")), y = Y.test(p.contains) || p.compareDocumentPosition ? function(e, t) {
                var n = 9 === e.nodeType ? e.documentElement : e, r = t && t.parentNode;
                return e === r || !!r && 1 === r.nodeType && !!(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r))
            } : function(e, t) {
                if (t)
                    while (t = t.parentNode)
                        if (t === e)
                            return!0;
                return!1
            }, L = p.compareDocumentPosition ? function(e, t) {
                if (e === t)
                    return k = !0, 0;
                var i = t.compareDocumentPosition && e.compareDocumentPosition && e.compareDocumentPosition(t);
                return i ? 1 & i || !r.sortDetached && t.compareDocumentPosition(e) === i ? e === n || y(w, e) ? -1 : t === n || y(w, t) ? 1 : l ? j.call(l, e) - j.call(l, t) : 0 : 4 & i ? -1 : 1 : e.compareDocumentPosition ? -1 : 1
            } : function(e, t) {
                var r, i = 0, s = e.parentNode, o = t.parentNode, u = [e], a = [t];
                if (e === t)
                    return k = !0, 0;
                if (!s || !o)
                    return e === n ? -1 : t === n ? 1 : s ? -1 : o ? 1 : l ? j.call(l, e) - j.call(l, t) : 0;
                if (s === o)
                    return ct(e, t);
                r = e;
                while (r = r.parentNode)
                    u.unshift(r);
                r = t;
                while (r = r.parentNode)
                    a.unshift(r);
                while (u[i] === a[i])
                    i++;
                return i ? ct(u[i], a[i]) : u[i] === w ? -1 : a[i] === w ? 1 : 0
            }, n) : h
        }, ot.matches = function(e, t) {
            return ot(e, null, null, t)
        }, ot.matchesSelector = function(e, t) {
            if ((e.ownerDocument || e) !== h && c(e), t = t.replace(J, "='$1']"), !(!r.matchesSelector || !d || m && m.test(t) || v && v.test(t)))
                try {
                    var n = g.call(e, t);
                    if (n || r.disconnectedMatch || e.document && 11 !== e.document.nodeType)
                        return n
                } catch (i) {
                }
            return ot(t, h, null, [e]).length > 0
        }, ot.contains = function(e, t) {
            return(e.ownerDocument || e) !== h && c(e), y(e, t)
        }, ot.attr = function(e, n) {
            (e.ownerDocument || e) !== h && c(e);
            var i = s.attrHandle[n.toLowerCase()], o = i && M.call(s.attrHandle, n.toLowerCase()) ? i(e, n, !d) : t;
            return o === t ? r.attributes || !d ? e.getAttribute(n) : (o = e.getAttributeNode(n)) && o.specified ? o.value : null : o
        }, ot.error = function(e) {
            throw Error("Syntax error, unrecognized expression: " + e)
        }, ot.uniqueSort = function(e) {
            var t, n = [], i = 0, s = 0;
            if (k = !r.detectDuplicates, l = !r.sortStable && e.slice(0), e.sort(L), k) {
                while (t = e[s++])
                    t === e[s] && (i = n.push(s));
                while (i--)
                    e.splice(n[i], 1)
            }
            return e
        }, o = ot.getText = function(e) {
            var t, n = "", r = 0, i = e.nodeType;
            if (i) {
                if (1 === i || 9 === i || 11 === i) {
                    if ("string" == typeof e.textContent)
                        return e.textContent;
                    for (e = e.firstChild; e; e = e.nextSibling)
                        n += o(e)
                } else if (3 === i || 4 === i)
                    return e.nodeValue
            } else
                for (; t = e[r]; r++)
                    n += o(t);
            return n
        }, s = ot.selectors = {cacheLength: 50, createPseudo: at, match: G, attrHandle: {}, find: {}, relative: {">": {dir: "parentNode", first: !0}, " ": {dir: "parentNode"}, "+": {dir: "previousSibling", first: !0}, "~": {dir: "previousSibling"}}, preFilter: {ATTR: function(e) {
                    return e[1] = e[1].replace(rt, it), e[3] = (e[4] || e[5] || "").replace(rt, it), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
                }, CHILD: function(e) {
                    return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || ot.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && ot.error(e[0]), e
                }, PSEUDO: function(e) {
                    var n, r = !e[5] && e[2];
                    return G.CHILD.test(e[0]) ? null : (e[3] && e[4] !== t ? e[2] = e[4] : r && K.test(r) && (n = mt(r, !0)) && (n = r.indexOf(")", r.length - n) - r.length) && (e[0] = e[0].slice(0, n), e[2] = r.slice(0, n)), e.slice(0, 3))
                }}, filter: {TAG: function(e) {
                    var t = e.replace(rt, it).toLowerCase();
                    return"*" === e ? function() {
                        return!0
                    } : function(e) {
                        return e.nodeName && e.nodeName.toLowerCase() === t
                    }
                }, CLASS: function(e) {
                    var t = T[e + " "];
                    return t || (t = RegExp("(^|" + I + ")" + e + "(" + I + "|$)")) && T(e, function(e) {
                        return t.test("string" == typeof e.className && e.className || typeof e.getAttribute !== A && e.getAttribute("class") || "")
                    })
                }, ATTR: function(e, t, n) {
                    return function(r) {
                        var i = ot.attr(r, e);
                        return null == i ? "!=" === t : t ? (i += "", "=" === t ? i === n : "!=" === t ? i !== n : "^=" === t ? n && 0 === i.indexOf(n) : "*=" === t ? n && i.indexOf(n) > -1 : "$=" === t ? n && i.slice(-n.length) === n : "~=" === t ? (" " + i + " ").indexOf(n) > -1 : "|=" === t ? i === n || i.slice(0, n.length + 1) === n + "-" : !1) : !0
                    }
                }, CHILD: function(e, t, n, r, i) {
                    var s = "nth" !== e.slice(0, 3), o = "last" !== e.slice(-4), u = "of-type" === t;
                    return 1 === r && 0 === i ? function(e) {
                        return!!e.parentNode
                    } : function(t, n, a) {
                        var f, l, c, h, p, d, v = s !== o ? "nextSibling" : "previousSibling", m = t.parentNode, g = u && t.nodeName.toLowerCase(), y = !a && !u;
                        if (m) {
                            if (s) {
                                while (v) {
                                    c = t;
                                    while (c = c[v])
                                        if (u ? c.nodeName.toLowerCase() === g : 1 === c.nodeType)
                                            return!1;
                                    d = v = "only" === e && !d && "nextSibling"
                                }
                                return!0
                            }
                            if (d = [o ? m.firstChild : m.lastChild], o && y) {
                                l = m[b] || (m[b] = {}), f = l[e] || [], p = f[0] === E && f[1], h = f[0] === E && f[2], c = p && m.childNodes[p];
                                while (c = ++p && c && c[v] || (h = p = 0) || d.pop())
                                    if (1 === c.nodeType && ++h && c === t) {
                                        l[e] = [E, p, h];
                                        break
                                    }
                            } else if (y && (f = (t[b] || (t[b] = {}))[e]) && f[0] === E)
                                h = f[1];
                            else
                                while (c = ++p && c && c[v] || (h = p = 0) || d.pop())
                                    if ((u ? c.nodeName.toLowerCase() === g : 1 === c.nodeType) && ++h && (y && ((c[b] || (c[b] = {}))[e] = [E, h]), c === t))
                                        break;
                            return h -= i, h === r || 0 === h % r && h / r >= 0
                        }
                    }
                }, PSEUDO: function(e, t) {
                    var n, r = s.pseudos[e] || s.setFilters[e.toLowerCase()] || ot.error("unsupported pseudo: " + e);
                    return r[b] ? r(t) : r.length > 1 ? (n = [e, e, "", t], s.setFilters.hasOwnProperty(e.toLowerCase()) ? at(function(e, n) {
                        var i, s = r(e, t), o = s.length;
                        while (o--)
                            i = j.call(e, s[o]), e[i] = !(n[i] = s[o])
                    }) : function(e) {
                        return r(e, 0, n)
                    }) : r
                }}, pseudos: {not: at(function(e) {
                    var t = [], n = [], r = a(e.replace(W, "$1"));
                    return r[b] ? at(function(e, t, n, i) {
                        var s, o = r(e, null, i, []), u = e.length;
                        while (u--)
                            (s = o[u]) && (e[u] = !(t[u] = s))
                    }) : function(e, i, s) {
                        return t[0] = e, r(t, null, s, n), !n.pop()
                    }
                }), has: at(function(e) {
                    return function(t) {
                        return ot(e, t).length > 0
                    }
                }), contains: at(function(e) {
                    return function(t) {
                        return(t.textContent || t.innerText || o(t)).indexOf(e) > -1
                    }
                }), lang: at(function(e) {
                    return Q.test(e || "") || ot.error("unsupported lang: " + e), e = e.replace(rt, it).toLowerCase(), function(t) {
                        var n;
                        do
                            if (n = d ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang"))
                                return n = n.toLowerCase(), n === e || 0 === n.indexOf(e + "-");
                        while ((t = t.parentNode) && 1 === t.nodeType);
                        return!1
                    }
                }), target: function(t) {
                    var n = e.location && e.location.hash;
                    return n && n.slice(1) === t.id
                }, root: function(e) {
                    return e === p
                }, focus: function(e) {
                    return e === h.activeElement && (!h.hasFocus || h.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                }, enabled: function(e) {
                    return e.disabled === !1
                }, disabled: function(e) {
                    return e.disabled === !0
                }, checked: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return"input" === t && !!e.checked || "option" === t && !!e.selected
                }, selected: function(e) {
                    return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
                }, empty: function(e) {
                    for (e = e.firstChild; e; e = e.nextSibling)
                        if (e.nodeName > "@" || 3 === e.nodeType || 4 === e.nodeType)
                            return!1;
                    return!0
                }, parent: function(e) {
                    return!s.pseudos.empty(e)
                }, header: function(e) {
                    return tt.test(e.nodeName)
                }, input: function(e) {
                    return et.test(e.nodeName)
                }, button: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return"input" === t && "button" === e.type || "button" === t
                }, text: function(e) {
                    var t;
                    return"input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || t.toLowerCase() === e.type)
                }, first: dt(function() {
                    return[0]
                }), last: dt(function(e, t) {
                    return[t - 1]
                }), eq: dt(function(e, t, n) {
                    return[0 > n ? n + t : n]
                }), even: dt(function(e, t) {
                    var n = 0;
                    for (; t > n; n += 2)
                        e.push(n);
                    return e
                }), odd: dt(function(e, t) {
                    var n = 1;
                    for (; t > n; n += 2)
                        e.push(n);
                    return e
                }), lt: dt(function(e, t, n) {
                    var r = 0 > n ? n + t : n;
                    for (; --r >= 0; )
                        e.push(r);
                    return e
                }), gt: dt(function(e, t, n) {
                    var r = 0 > n ? n + t : n;
                    for (; t > ++r; )
                        e.push(r);
                    return e
                })}}, s.pseudos.nth = s.pseudos.eq;
        for (n in{radio:!0, checkbox:!0, file:!0, password:!0, image:!0})
            s.pseudos[n] = ht(n);
        for (n in{submit:!0, reset:!0})
            s.pseudos[n] = pt(n);
        vt.prototype = s.filters = s.pseudos, s.setFilters = new vt, a = ot.compile = function(e, t) {
            var n, r = [], i = [], s = C[e + " "];
            if (!s) {
                t || (t = mt(e)), n = t.length;
                while (n--)
                    s = St(t[n]), s[b] ? r.push(s) : i.push(s);
                s = C(e, xt(i, r))
            }
            return s
        }, r.sortStable = b.split("").sort(L).join("") === b, r.detectDuplicates = k, c(), r.sortDetached = ft(function(e) {
            return 1 & e.compareDocumentPosition(h.createElement("div"))
        }), ft(function(e) {
            return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href")
        }) || lt("type|href|height|width", function(e, n, r) {
            return r ? t : e.getAttribute(n, "type" === n.toLowerCase() ? 1 : 2)
        }), r.attributes && ft(function(e) {
            return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
        }) || lt("value", function(e, n, r) {
            return r || "input" !== e.nodeName.toLowerCase() ? t : e.defaultValue
        }), ft(function(e) {
            return null == e.getAttribute("disabled")
        }) || lt(F, function(e, n, r) {
            var i;
            return r ? t : (i = e.getAttributeNode(n)) && i.specified ? i.value : e[n] === !0 ? n.toLowerCase() : null
        }), x.find = ot, x.expr = ot.selectors, x.expr[":"] = x.expr.pseudos, x.unique = ot.uniqueSort, x.text = ot.getText, x.isXMLDoc = ot.isXML, x.contains = ot.contains
    }(e);
    var D = {};
    x.Callbacks = function(e) {
        e = "string" == typeof e ? D[e] || A(e) : x.extend({}, e);
        var t, n, r, i, s, o, u = [], a = !e.once && [], f = function(h) {
            for (t = e.memory && h, n = !0, o = i || 0, i = 0, s = u.length, r = !0; u && s > o; o++)
                if (u[o].apply(h[0], h[1]) === !1 && e.stopOnFalse) {
                    t = !1;
                    break
                }
            r = !1, u && (a ? a.length && f(a.shift()) : t ? u = [] : l.disable())
        }, l = {add: function() {
                if (u) {
                    var n = u.length;
                    (function o(t) {
                        x.each(t, function(t, n) {
                            var r = x.type(n);
                            "function" === r ? e.unique && l.has(n) || u.push(n) : n && n.length && "string" !== r && o(n)
                        })
                    })(arguments), r ? s = u.length : t && (i = n, f(t))
                }
                return this
            }, remove: function() {
                return u && x.each(arguments, function(e, t) {
                    var n;
                    while ((n = x.inArray(t, u, n)) > - 1)
                        u.splice(n, 1), r && (s >= n && s--, o >= n && o--)
                }), this
            }, has: function(e) {
                return e ? x.inArray(e, u) > -1 : !!u && !!u.length
            }, empty: function() {
                return u = [], s = 0, this
            }, disable: function() {
                return u = a = t = undefined, this
            }, disabled: function() {
                return!u
            }, lock: function() {
                return a = undefined, t || l.disable(), this
            }, locked: function() {
                return!a
            }, fireWith: function(e, t) {
                return!u || n && !a || (t = t || [], t = [e, t.slice ? t.slice() : t], r ? a.push(t) : f(t)), this
            }, fire: function() {
                return l.fireWith(this, arguments), this
            }, fired: function() {
                return!!n
            }};
        return l
    }, x.extend({Deferred: function(e) {
            var t = [["resolve", "done", x.Callbacks("once memory"), "resolved"], ["reject", "fail", x.Callbacks("once memory"), "rejected"], ["notify", "progress", x.Callbacks("memory")]], n = "pending", r = {state: function() {
                    return n
                }, always: function() {
                    return i.done(arguments).fail(arguments), this
                }, then: function() {
                    var e = arguments;
                    return x.Deferred(function(n) {
                        x.each(t, function(t, s) {
                            var o = s[0], u = x.isFunction(e[t]) && e[t];
                            i[s[1]](function() {
                                var e = u && u.apply(this, arguments);
                                e && x.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[o + "With"](this === r ? n.promise() : this, u ? [e] : arguments)
                            })
                        }), e = null
                    }).promise()
                }, promise: function(e) {
                    return null != e ? x.extend(e, r) : r
                }}, i = {};
            return r.pipe = r.then, x.each(t, function(e, s) {
                var o = s[2], u = s[3];
                r[s[1]] = o.add, u && o.add(function() {
                    n = u
                }, t[1 ^ e][2].disable, t[2][2].lock), i[s[0]] = function() {
                    return i[s[0] + "With"](this === i ? r : this, arguments), this
                }, i[s[0] + "With"] = o.fireWith
            }), r.promise(i), e && e.call(i, i), i
        }, when: function(e) {
            var t = 0, n = d.call(arguments), r = n.length, i = 1 !== r || e && x.isFunction(e.promise) ? r : 0, s = 1 === i ? e : x.Deferred(), o = function(e, t, n) {
                return function(r) {
                    t[e] = this, n[e] = arguments.length > 1 ? d.call(arguments) : r, n === u ? s.notifyWith(t, n) : --i || s.resolveWith(t, n)
                }
            }, u, a, f;
            if (r > 1)
                for (u = Array(r), a = Array(r), f = Array(r); r > t; t++)
                    n[t] && x.isFunction(n[t].promise) ? n[t].promise().done(o(t, f, n)).fail(s.reject).progress(o(t, a, u)) : --i;
            return i || s.resolveWith(f, n), s.promise()
        }}), x.support = function(t) {
        var n = o.createElement("input"), r = o.createDocumentFragment(), i = o.createElement("div"), s = o.createElement("select"), u = s.appendChild(o.createElement("option"));
        return n.type ? (n.type = "checkbox", t.checkOn = "" !== n.value, t.optSelected = u.selected, t.reliableMarginRight = !0, t.boxSizingReliable = !0, t.pixelPosition = !1, n.checked = !0, t.noCloneChecked = n.cloneNode(!0).checked, s.disabled = !0, t.optDisabled = !u.disabled, n = o.createElement("input"), n.value = "t", n.type = "radio", t.radioValue = "t" === n.value, n.setAttribute("checked", "t"), n.setAttribute("name", "t"), r.appendChild(n), t.checkClone = r.cloneNode(!0).cloneNode(!0).lastChild.checked, t.focusinBubbles = "onfocusin"in e, i.style.backgroundClip = "content-box", i.cloneNode(!0).style.backgroundClip = "", t.clearCloneStyle = "content-box" === i.style.backgroundClip, x(function() {
            var n, r, s = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box", u = o.getElementsByTagName("body")[0];
            u && (n = o.createElement("div"), n.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", u.appendChild(n).appendChild(i), i.innerHTML = "", i.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%", x.swap(u, null != u.style.zoom ? {zoom: 1} : {}, function() {
                t.boxSizing = 4 === i.offsetWidth
            }), e.getComputedStyle && (t.pixelPosition = "1%" !== (e.getComputedStyle(i, null) || {}).top, t.boxSizingReliable = "4px" === (e.getComputedStyle(i, null) || {width: "4px"}).width, r = i.appendChild(o.createElement("div")), r.style.cssText = i.style.cssText = s, r.style.marginRight = r.style.width = "0", i.style.width = "1px", t.reliableMarginRight = !parseFloat((e.getComputedStyle(r, null) || {}).marginRight)), u.removeChild(n))
        }), t) : t
    }({});
    var L, q, H = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, O = /([A-Z])/g;
    F.uid = 1, F.accepts = function(e) {
        return e.nodeType ? 1 === e.nodeType || 9 === e.nodeType : !0
    }, F.prototype = {key: function(e) {
            if (!F.accepts(e))
                return 0;
            var t = {}, n = e[this.expando];
            if (!n) {
                n = F.uid++;
                try {
                    t[this.expando] = {value: n}, Object.defineProperties(e, t)
                } catch (r) {
                    t[this.expando] = n, x.extend(e, t)
                }
            }
            return this.cache[n] || (this.cache[n] = {}), n
        }, set: function(e, t, n) {
            var r, i = this.key(e), s = this.cache[i];
            if ("string" == typeof t)
                s[t] = n;
            else if (x.isEmptyObject(s))
                x.extend(this.cache[i], t);
            else
                for (r in t)
                    s[r] = t[r];
            return s
        }, get: function(e, t) {
            var n = this.cache[this.key(e)];
            return t === undefined ? n : n[t]
        }, access: function(e, t, n) {
            var r;
            return t === undefined || t && "string" == typeof t && n === undefined ? (r = this.get(e, t), r !== undefined ? r : this.get(e, x.camelCase(t))) : (this.set(e, t, n), n !== undefined ? n : t)
        }, remove: function(e, t) {
            var n, r, i, s = this.key(e), o = this.cache[s];
            if (t === undefined)
                this.cache[s] = {};
            else {
                x.isArray(t) ? r = t.concat(t.map(x.camelCase)) : (i = x.camelCase(t), t in o ? r = [t, i] : (r = i, r = r in o ? [r] : r.match(w) || [])), n = r.length;
                while (n--)
                    delete o[r[n]]
            }
        }, hasData: function(e) {
            return!x.isEmptyObject(this.cache[e[this.expando]] || {})
        }, discard: function(e) {
            e[this.expando] && delete this.cache[e[this.expando]]
        }}, L = new F, q = new F, x.extend({acceptData: F.accepts, hasData: function(e) {
            return L.hasData(e) || q.hasData(e)
        }, data: function(e, t, n) {
            return L.access(e, t, n)
        }, removeData: function(e, t) {
            L.remove(e, t)
        }, _data: function(e, t, n) {
            return q.access(e, t, n)
        }, _removeData: function(e, t) {
            q.remove(e, t)
        }}), x.fn.extend({data: function(e, t) {
            var n, r, i = this[0], s = 0, o = null;
            if (e === undefined) {
                if (this.length && (o = L.get(i), 1 === i.nodeType && !q.get(i, "hasDataAttrs"))) {
                    for (n = i.attributes; n.length > s; s++)
                        r = n[s].name, 0 === r.indexOf("data-") && (r = x.camelCase(r.slice(5)), P(i, r, o[r]));
                    q.set(i, "hasDataAttrs", !0)
                }
                return o
            }
            return"object" == typeof e ? this.each(function() {
                L.set(this, e)
            }) : x.access(this, function(t) {
                var n, r = x.camelCase(e);
                if (i && t === undefined) {
                    if (n = L.get(i, e), n !== undefined)
                        return n;
                    if (n = L.get(i, r), n !== undefined)
                        return n;
                    if (n = P(i, r, undefined), n !== undefined)
                        return n
                } else
                    this.each(function() {
                        var n = L.get(this, r);
                        L.set(this, r, t), -1 !== e.indexOf("-") && n !== undefined && L.set(this, e, t)
                    })
            }, null, t, arguments.length > 1, null, !0)
        }, removeData: function(e) {
            return this.each(function() {
                L.remove(this, e)
            })
        }}), x.extend({queue: function(e, t, n) {
            var r;
            return e ? (t = (t || "fx") + "queue", r = q.get(e, t), n && (!r || x.isArray(n) ? r = q.access(e, t, x.makeArray(n)) : r.push(n)), r || []) : undefined
        }, dequeue: function(e, t) {
            t = t || "fx";
            var n = x.queue(e, t), r = n.length, i = n.shift(), s = x._queueHooks(e, t), o = function() {
                x.dequeue(e, t)
            };
            "inprogress" === i && (i = n.shift(), r--), i && ("fx" === t && n.unshift("inprogress"), delete s.stop, i.call(e, o, s)), !r && s && s.empty.fire()
        }, _queueHooks: function(e, t) {
            var n = t + "queueHooks";
            return q.get(e, n) || q.access(e, n, {empty: x.Callbacks("once memory").add(function() {
                    q.remove(e, [t + "queue", n])
                })})
        }}), x.fn.extend({queue: function(e, t) {
            var n = 2;
            return"string" != typeof e && (t = e, e = "fx", n--), n > arguments.length ? x.queue(this[0], e) : t === undefined ? this : this.each(function() {
                var n = x.queue(this, e, t);
                x._queueHooks(this, e), "fx" === e && "inprogress" !== n[0] && x.dequeue(this, e)
            })
        }, dequeue: function(e) {
            return this.each(function() {
                x.dequeue(this, e)
            })
        }, delay: function(e, t) {
            return e = x.fx ? x.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
                var r = setTimeout(t, e);
                n.stop = function() {
                    clearTimeout(r)
                }
            })
        }, clearQueue: function(e) {
            return this.queue(e || "fx", [])
        }, promise: function(e, t) {
            var n, r = 1, i = x.Deferred(), s = this, o = this.length, u = function() {
                --r || i.resolveWith(s, [s])
            };
            "string" != typeof e && (t = e, e = undefined), e = e || "fx";
            while (o--)
                n = q.get(s[o], e + "queueHooks"), n && n.empty && (r++, n.empty.add(u));
            return u(), i.promise(t)
        }});
    var R, M, W = /[\t\r\n\f]/g, $ = /\r/g, B = /^(?:input|select|textarea|button)$/i;
    x.fn.extend({attr: function(e, t) {
            return x.access(this, x.attr, e, t, arguments.length > 1)
        }, removeAttr: function(e) {
            return this.each(function() {
                x.removeAttr(this, e)
            })
        }, prop: function(e, t) {
            return x.access(this, x.prop, e, t, arguments.length > 1)
        }, removeProp: function(e) {
            return this.each(function() {
                delete this[x.propFix[e] || e]
            })
        }, addClass: function(e) {
            var t, n, r, i, s, o = 0, u = this.length, a = "string" == typeof e && e;
            if (x.isFunction(e))
                return this.each(function(t) {
                    x(this).addClass(e.call(this, t, this.className))
                });
            if (a)
                for (t = (e || "").match(w) || []; u > o; o++)
                    if (n = this[o], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(W, " ") : " ")) {
                        s = 0;
                        while (i = t[s++])
                            0 > r.indexOf(" " + i + " ") && (r += i + " ");
                        n.className = x.trim(r)
                    }
            return this
        }, removeClass: function(e) {
            var t, n, r, i, s, o = 0, u = this.length, a = 0 === arguments.length || "string" == typeof e && e;
            if (x.isFunction(e))
                return this.each(function(t) {
                    x(this).removeClass(e.call(this, t, this.className))
                });
            if (a)
                for (t = (e || "").match(w) || []; u > o; o++)
                    if (n = this[o], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(W, " ") : "")) {
                        s = 0;
                        while (i = t[s++])
                            while (r.indexOf(" " + i + " ") >= 0)
                                r = r.replace(" " + i + " ", " ");
                        n.className = e ? x.trim(r) : ""
                    }
            return this
        }, toggleClass: function(e, t) {
            var n = typeof e;
            return"boolean" == typeof t && "string" === n ? t ? this.addClass(e) : this.removeClass(e) : x.isFunction(e) ? this.each(function(n) {
                x(this).toggleClass(e.call(this, n, this.className, t), t)
            }) : this.each(function() {
                if ("string" === n) {
                    var t, i = 0, s = x(this), o = e.match(w) || [];
                    while (t = o[i++])
                        s.hasClass(t) ? s.removeClass(t) : s.addClass(t)
                } else
                    (n === r || "boolean" === n) && (this.className && q.set(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : q.get(this, "__className__") || "")
            })
        }, hasClass: function(e) {
            var t = " " + e + " ", n = 0, r = this.length;
            for (; r > n; n++)
                if (1 === this[n].nodeType && (" " + this[n].className + " ").replace(W, " ").indexOf(t) >= 0)
                    return!0;
            return!1
        }, val: function(e) {
            var t, n, r, i = this[0];
            if (arguments.length)
                return r = x.isFunction(e), this.each(function(n) {
                    var i;
                    1 === this.nodeType && (i = r ? e.call(this, n, x(this).val()) : e, null == i ? i = "" : "number" == typeof i ? i += "" : x.isArray(i) && (i = x.map(i, function(e) {
                        return null == e ? "" : e + ""
                    })), t = x.valHooks[this.type] || x.valHooks[this.nodeName.toLowerCase()], t && "set"in t && t.set(this, i, "value") !== undefined || (this.value = i))
                });
            if (i)
                return t = x.valHooks[i.type] || x.valHooks[i.nodeName.toLowerCase()], t && "get"in t && (n = t.get(i, "value")) !== undefined ? n : (n = i.value, "string" == typeof n ? n.replace($, "") : null == n ? "" : n)
        }}), x.extend({valHooks: {option: {get: function(e) {
                    var t = e.attributes.value;
                    return!t || t.specified ? e.value : e.text
                }}, select: {get: function(e) {
                    var t, n, r = e.options, i = e.selectedIndex, s = "select-one" === e.type || 0 > i, o = s ? null : [], u = s ? i + 1 : r.length, a = 0 > i ? u : s ? i : 0;
                    for (; u > a; a++)
                        if (n = r[a], !(!n.selected && a !== i || (x.support.optDisabled ? n.disabled : null !== n.getAttribute("disabled")) || n.parentNode.disabled && x.nodeName(n.parentNode, "optgroup"))) {
                            if (t = x(n).val(), s)
                                return t;
                            o.push(t)
                        }
                    return o
                }, set: function(e, t) {
                    var n, r, i = e.options, s = x.makeArray(t), o = i.length;
                    while (o--)
                        r = i[o], (r.selected = x.inArray(x(r).val(), s) >= 0) && (n = !0);
                    return n || (e.selectedIndex = -1), s
                }}}, attr: function(e, t, n) {
            var i, s, o = e.nodeType;
            if (e && 3 !== o && 8 !== o && 2 !== o)
                return typeof e.getAttribute === r ? x.prop(e, t, n) : (1 === o && x.isXMLDoc(e) || (t = t.toLowerCase(), i = x.attrHooks[t] || (x.expr.match.bool.test(t) ? M : R)), n === undefined ? i && "get"in i && null !== (s = i.get(e, t)) ? s : (s = x.find.attr(e, t), null == s ? undefined : s) : null !== n ? i && "set"in i && (s = i.set(e, n, t)) !== undefined ? s : (e.setAttribute(t, n + ""), n) : (x.removeAttr(e, t), undefined))
        }, removeAttr: function(e, t) {
            var n, r, i = 0, s = t && t.match(w);
            if (s && 1 === e.nodeType)
                while (n = s[i++])
                    r = x.propFix[n] || n, x.expr.match.bool.test(n) && (e[r] = !1), e.removeAttribute(n)
        }, attrHooks: {type: {set: function(e, t) {
                    if (!x.support.radioValue && "radio" === t && x.nodeName(e, "input")) {
                        var n = e.value;
                        return e.setAttribute("type", t), n && (e.value = n), t
                    }
                }}}, propFix: {"for": "htmlFor", "class": "className"}, prop: function(e, t, n) {
            var r, i, s, o = e.nodeType;
            if (e && 3 !== o && 8 !== o && 2 !== o)
                return s = 1 !== o || !x.isXMLDoc(e), s && (t = x.propFix[t] || t, i = x.propHooks[t]), n !== undefined ? i && "set"in i && (r = i.set(e, n, t)) !== undefined ? r : e[t] = n : i && "get"in i && null !== (r = i.get(e, t)) ? r : e[t]
        }, propHooks: {tabIndex: {get: function(e) {
                    return e.hasAttribute("tabindex") || B.test(e.nodeName) || e.href ? e.tabIndex : -1
                }}}}), M = {set: function(e, t, n) {
            return t === !1 ? x.removeAttr(e, n) : e.setAttribute(n, n), n
        }}, x.each(x.expr.match.bool.source.match(/\w+/g), function(e, t) {
        var n = x.expr.attrHandle[t] || x.find.attr;
        x.expr.attrHandle[t] = function(e, t, r) {
            var i = x.expr.attrHandle[t], s = r ? undefined : (x.expr.attrHandle[t] = undefined) != n(e, t, r) ? t.toLowerCase() : null;
            return x.expr.attrHandle[t] = i, s
        }
    }), x.support.optSelected || (x.propHooks.selected = {get: function(e) {
            var t = e.parentNode;
            return t && t.parentNode && t.parentNode.selectedIndex, null
        }}), x.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        x.propFix[this.toLowerCase()] = this
    }), x.each(["radio", "checkbox"], function() {
        x.valHooks[this] = {set: function(e, t) {
                return x.isArray(t) ? e.checked = x.inArray(x(e).val(), t) >= 0 : undefined
            }}, x.support.checkOn || (x.valHooks[this].get = function(e) {
            return null === e.getAttribute("value") ? "on" : e.value
        })
    });
    var I = /^key/, z = /^(?:mouse|contextmenu)|click/, _ = /^(?:focusinfocus|focusoutblur)$/, X = /^([^.]*)(?:\.(.+)|)$/;
    x.event = {global: {}, add: function(e, t, n, i, s) {
            var o, u, a, f, l, c, h, p, d, v, m, g = q.get(e);
            if (g) {
                n.handler && (o = n, n = o.handler, s = o.selector), n.guid || (n.guid = x.guid++), (f = g.events) || (f = g.events = {}), (u = g.handle) || (u = g.handle = function(e) {
                    return typeof x === r || e && x.event.triggered === e.type ? undefined : x.event.dispatch.apply(u.elem, arguments)
                }, u.elem = e), t = (t || "").match(w) || [""], l = t.length;
                while (l--)
                    a = X.exec(t[l]) || [], d = m = a[1], v = (a[2] || "").split(".").sort(), d && (h = x.event.special[d] || {}, d = (s ? h.delegateType : h.bindType) || d, h = x.event.special[d] || {}, c = x.extend({type: d, origType: m, data: i, handler: n, guid: n.guid, selector: s, needsContext: s && x.expr.match.needsContext.test(s), namespace: v.join(".")}, o), (p = f[d]) || (p = f[d] = [], p.delegateCount = 0, h.setup && h.setup.call(e, i, v, u) !== !1 || e.addEventListener && e.addEventListener(d, u, !1)), h.add && (h.add.call(e, c), c.handler.guid || (c.handler.guid = n.guid)), s ? p.splice(p.delegateCount++, 0, c) : p.push(c), x.event.global[d] = !0);
                e = null
            }
        }, remove: function(e, t, n, r, i) {
            var s, o, u, a, f, l, c, h, p, d, v, m = q.hasData(e) && q.get(e);
            if (m && (a = m.events)) {
                t = (t || "").match(w) || [""], f = t.length;
                while (f--)
                    if (u = X.exec(t[f]) || [], p = v = u[1], d = (u[2] || "").split(".").sort(), p) {
                        c = x.event.special[p] || {}, p = (r ? c.delegateType : c.bindType) || p, h = a[p] || [], u = u[2] && RegExp("(^|\\.)" + d.join("\\.(?:.*\\.|)") + "(\\.|$)"), o = s = h.length;
                        while (s--)
                            l = h[s], !i && v !== l.origType || n && n.guid !== l.guid || u && !u.test(l.namespace) || r && r !== l.selector && ("**" !== r || !l.selector) || (h.splice(s, 1), l.selector && h.delegateCount--, c.remove && c.remove.call(e, l));
                        o && !h.length && (c.teardown && c.teardown.call(e, d, m.handle) !== !1 || x.removeEvent(e, p, m.handle), delete a[p])
                    } else
                        for (p in a)
                            x.event.remove(e, p + t[f], n, r, !0);
                x.isEmptyObject(a) && (delete m.handle, q.remove(e, "events"))
            }
        }, trigger: function(t, n, r, i) {
            var s, u, a, f, l, c, h, p = [r || o], d = y.call(t, "type") ? t.type : t, v = y.call(t, "namespace") ? t.namespace.split(".") : [];
            if (u = a = r = r || o, 3 !== r.nodeType && 8 !== r.nodeType && !_.test(d + x.event.triggered) && (d.indexOf(".") >= 0 && (v = d.split("."), d = v.shift(), v.sort()), l = 0 > d.indexOf(":") && "on" + d, t = t[x.expando] ? t : new x.Event(d, "object" == typeof t && t), t.isTrigger = i ? 2 : 3, t.namespace = v.join("."), t.namespace_re = t.namespace ? RegExp("(^|\\.)" + v.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, t.result = undefined, t.target || (t.target = r), n = null == n ? [t] : x.makeArray(n, [t]), h = x.event.special[d] || {}, i || !h.trigger || h.trigger.apply(r, n) !== !1)) {
                if (!i && !h.noBubble && !x.isWindow(r)) {
                    for (f = h.delegateType || d, _.test(f + d) || (u = u.parentNode); u; u = u.parentNode)
                        p.push(u), a = u;
                    a === (r.ownerDocument || o) && p.push(a.defaultView || a.parentWindow || e)
                }
                s = 0;
                while ((u = p[s++]) && !t.isPropagationStopped())
                    t.type = s > 1 ? f : h.bindType || d, c = (q.get(u, "events") || {})[t.type] && q.get(u, "handle"), c && c.apply(u, n), c = l && u[l], c && x.acceptData(u) && c.apply && c.apply(u, n) === !1 && t.preventDefault();
                return t.type = d, i || t.isDefaultPrevented() || h._default && h._default.apply(p.pop(), n) !== !1 || !x.acceptData(r) || l && x.isFunction(r[d]) && !x.isWindow(r) && (a = r[l], a && (r[l] = null), x.event.triggered = d, r[d](), x.event.triggered = undefined, a && (r[l] = a)), t.result
            }
        }, dispatch: function(e) {
            e = x.event.fix(e);
            var t, n, r, i, s, o = [], u = d.call(arguments), a = (q.get(this, "events") || {})[e.type] || [], f = x.event.special[e.type] || {};
            if (u[0] = e, e.delegateTarget = this, !f.preDispatch || f.preDispatch.call(this, e) !== !1) {
                o = x.event.handlers.call(this, e, a), t = 0;
                while ((i = o[t++]) && !e.isPropagationStopped()) {
                    e.currentTarget = i.elem, n = 0;
                    while ((s = i.handlers[n++]) && !e.isImmediatePropagationStopped())
                        (!e.namespace_re || e.namespace_re.test(s.namespace)) && (e.handleObj = s, e.data = s.data, r = ((x.event.special[s.origType] || {}).handle || s.handler).apply(i.elem, u), r !== undefined && (e.result = r) === !1 && (e.preventDefault(), e.stopPropagation()))
                }
                return f.postDispatch && f.postDispatch.call(this, e), e.result
            }
        }, handlers: function(e, t) {
            var n, r, i, s, o = [], u = t.delegateCount, a = e.target;
            if (u && a.nodeType && (!e.button || "click" !== e.type))
                for (; a !== this; a = a.parentNode || this)
                    if (a.disabled !== !0 || "click" !== e.type) {
                        for (r = [], n = 0; u > n; n++)
                            s = t[n], i = s.selector + " ", r[i] === undefined && (r[i] = s.needsContext ? x(i, this).index(a) >= 0 : x.find(i, this, null, [a]).length), r[i] && r.push(s);
                        r.length && o.push({elem: a, handlers: r})
                    }
            return t.length > u && o.push({elem: this, handlers: t.slice(u)}), o
        }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: {props: "char charCode key keyCode".split(" "), filter: function(e, t) {
                return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode), e
            }}, mouseHooks: {props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function(e, t) {
                var n, r, i, s = t.button;
                return null == e.pageX && null != t.clientX && (n = e.target.ownerDocument || o, r = n.documentElement, i = n.body, e.pageX = t.clientX + (r && r.scrollLeft || i && i.scrollLeft || 0) - (r && r.clientLeft || i && i.clientLeft || 0), e.pageY = t.clientY + (r && r.scrollTop || i && i.scrollTop || 0) - (r && r.clientTop || i && i.clientTop || 0)), e.which || s === undefined || (e.which = 1 & s ? 1 : 2 & s ? 3 : 4 & s ? 2 : 0), e
            }}, fix: function(e) {
            if (e[x.expando])
                return e;
            var t, n, r, i = e.type, s = e, u = this.fixHooks[i];
            u || (this.fixHooks[i] = u = z.test(i) ? this.mouseHooks : I.test(i) ? this.keyHooks : {}), r = u.props ? this.props.concat(u.props) : this.props, e = new x.Event(s), t = r.length;
            while (t--)
                n = r[t], e[n] = s[n];
            return e.target || (e.target = o), 3 === e.target.nodeType && (e.target = e.target.parentNode), u.filter ? u.filter(e, s) : e
        }, special: {load: {noBubble: !0}, focus: {trigger: function() {
                    return this !== V() && this.focus ? (this.focus(), !1) : undefined
                }, delegateType: "focusin"}, blur: {trigger: function() {
                    return this === V() && this.blur ? (this.blur(), !1) : undefined
                }, delegateType: "focusout"}, click: {trigger: function() {
                    return"checkbox" === this.type && this.click && x.nodeName(this, "input") ? (this.click(), !1) : undefined
                }, _default: function(e) {
                    return x.nodeName(e.target, "a")
                }}, beforeunload: {postDispatch: function(e) {
                    e.result !== undefined && (e.originalEvent.returnValue = e.result)
                }}}, simulate: function(e, t, n, r) {
            var i = x.extend(new x.Event, n, {type: e, isSimulated: !0, originalEvent: {}});
            r ? x.event.trigger(i, null, t) : x.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault()
        }}, x.removeEvent = function(e, t, n) {
        e.removeEventListener && e.removeEventListener(t, n, !1)
    }, x.Event = function(e, t) {
        return this instanceof x.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.getPreventDefault && e.getPreventDefault() ? U : Y) : this.type = e, t && x.extend(this, t), this.timeStamp = e && e.timeStamp || x.now(), this[x.expando] = !0, undefined) : new x.Event(e, t)
    }, x.Event.prototype = {isDefaultPrevented: Y, isPropagationStopped: Y, isImmediatePropagationStopped: Y, preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = U, e && e.preventDefault && e.preventDefault()
        }, stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = U, e && e.stopPropagation && e.stopPropagation()
        }, stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = U, this.stopPropagation()
        }}, x.each({mouseenter: "mouseover", mouseleave: "mouseout"}, function(e, t) {
        x.event.special[e] = {delegateType: t, bindType: t, handle: function(e) {
                var n, r = this, i = e.relatedTarget, s = e.handleObj;
                return(!i || i !== r && !x.contains(r, i)) && (e.type = s.origType, n = s.handler.apply(this, arguments), e.type = t), n
            }}
    }), x.support.focusinBubbles || x.each({focus: "focusin", blur: "focusout"}, function(e, t) {
        var n = 0, r = function(e) {
            x.event.simulate(t, e.target, x.event.fix(e), !0)
        };
        x.event.special[t] = {setup: function() {
                0 === n++ && o.addEventListener(e, r, !0)
            }, teardown: function() {
                0 === --n && o.removeEventListener(e, r, !0)
            }}
    }), x.fn.extend({on: function(e, t, n, r, i) {
            var s, o;
            if ("object" == typeof e) {
                "string" != typeof t && (n = n || t, t = undefined);
                for (o in e)
                    this.on(o, t, n, e[o], i);
                return this
            }
            if (null == n && null == r ? (r = t, n = t = undefined) : null == r && ("string" == typeof t ? (r = n, n = undefined) : (r = n, n = t, t = undefined)), r === !1)
                r = Y;
            else if (!r)
                return this;
            return 1 === i && (s = r, r = function(e) {
                return x().off(e), s.apply(this, arguments)
            }, r.guid = s.guid || (s.guid = x.guid++)), this.each(function() {
                x.event.add(this, e, r, n, t)
            })
        }, one: function(e, t, n, r) {
            return this.on(e, t, n, r, 1)
        }, off: function(e, t, n) {
            var r, i;
            if (e && e.preventDefault && e.handleObj)
                return r = e.handleObj, x(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), this;
            if ("object" == typeof e) {
                for (i in e)
                    this.off(i, t, e[i]);
                return this
            }
            return(t === !1 || "function" == typeof t) && (n = t, t = undefined), n === !1 && (n = Y), this.each(function() {
                x.event.remove(this, e, n, t)
            })
        }, trigger: function(e, t) {
            return this.each(function() {
                x.event.trigger(e, t, this)
            })
        }, triggerHandler: function(e, t) {
            var n = this[0];
            return n ? x.event.trigger(e, t, n, !0) : undefined
        }});
    var G = /^.[^:#\[\.,]*$/, J = /^(?:parents|prev(?:Until|All))/, Q = x.expr.match.needsContext, K = {children: !0, contents: !0, next: !0, prev: !0};
    x.fn.extend({find: function(e) {
            var t, n = [], r = this, i = r.length;
            if ("string" != typeof e)
                return this.pushStack(x(e).filter(function() {
                    for (t = 0; i > t; t++)
                        if (x.contains(r[t], this))
                            return!0
                }));
            for (t = 0; i > t; t++)
                x.find(e, r[t], n);
            return n = this.pushStack(i > 1 ? x.unique(n) : n), n.selector = this.selector ? this.selector + " " + e : e, n
        }, has: function(e) {
            var t = x(e, this), n = t.length;
            return this.filter(function() {
                var e = 0;
                for (; n > e; e++)
                    if (x.contains(this, t[e]))
                        return!0
            })
        }, not: function(e) {
            return this.pushStack(et(this, e || [], !0))
        }, filter: function(e) {
            return this.pushStack(et(this, e || [], !1))
        }, is: function(e) {
            return!!et(this, "string" == typeof e && Q.test(e) ? x(e) : e || [], !1).length
        }, closest: function(e, t) {
            var n, r = 0, i = this.length, s = [], o = Q.test(e) || "string" != typeof e ? x(e, t || this.context) : 0;
            for (; i > r; r++)
                for (n = this[r]; n && n !== t; n = n.parentNode)
                    if (11 > n.nodeType && (o ? o.index(n) > -1 : 1 === n.nodeType && x.find.matchesSelector(n, e))) {
                        n = s.push(n);
                        break
                    }
            return this.pushStack(s.length > 1 ? x.unique(s) : s)
        }, index: function(e) {
            return e ? "string" == typeof e ? g.call(x(e), this[0]) : g.call(this, e.jquery ? e[0] : e) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        }, add: function(e, t) {
            var n = "string" == typeof e ? x(e, t) : x.makeArray(e && e.nodeType ? [e] : e), r = x.merge(this.get(), n);
            return this.pushStack(x.unique(r))
        }, addBack: function(e) {
            return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
        }}), x.each({parent: function(e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null
        }, parents: function(e) {
            return x.dir(e, "parentNode")
        }, parentsUntil: function(e, t, n) {
            return x.dir(e, "parentNode", n)
        }, next: function(e) {
            return Z(e, "nextSibling")
        }, prev: function(e) {
            return Z(e, "previousSibling")
        }, nextAll: function(e) {
            return x.dir(e, "nextSibling")
        }, prevAll: function(e) {
            return x.dir(e, "previousSibling")
        }, nextUntil: function(e, t, n) {
            return x.dir(e, "nextSibling", n)
        }, prevUntil: function(e, t, n) {
            return x.dir(e, "previousSibling", n)
        }, siblings: function(e) {
            return x.sibling((e.parentNode || {}).firstChild, e)
        }, children: function(e) {
            return x.sibling(e.firstChild)
        }, contents: function(e) {
            return e.contentDocument || x.merge([], e.childNodes)
        }}, function(e, t) {
        x.fn[e] = function(n, r) {
            var i = x.map(this, t, n);
            return"Until" !== e.slice(-5) && (r = n), r && "string" == typeof r && (i = x.filter(r, i)), this.length > 1 && (K[e] || x.unique(i), J.test(e) && i.reverse()), this.pushStack(i)
        }
    }), x.extend({filter: function(e, t, n) {
            var r = t[0];
            return n && (e = ":not(" + e + ")"), 1 === t.length && 1 === r.nodeType ? x.find.matchesSelector(r, e) ? [r] : [] : x.find.matches(e, x.grep(t, function(e) {
                return 1 === e.nodeType
            }))
        }, dir: function(e, t, n) {
            var r = [], i = n !== undefined;
            while ((e = e[t]) && 9 !== e.nodeType)
                if (1 === e.nodeType) {
                    if (i && x(e).is(n))
                        break;
                    r.push(e)
                }
            return r
        }, sibling: function(e, t) {
            var n = [];
            for (; e; e = e.nextSibling)
                1 === e.nodeType && e !== t && n.push(e);
            return n
        }});
    var tt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, nt = /<([\w:]+)/, rt = /<|&#?\w+;/, it = /<(?:script|style|link)/i, ot = /^(?:checkbox|radio)$/i, st = /checked\s*(?:[^=]|=\s*.checked.)/i, at = /^$|\/(?:java|ecma)script/i, ut = /^true\/(.*)/, lt = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, ct = {option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""]};
    ct.optgroup = ct.option, ct.tbody = ct.tfoot = ct.colgroup = ct.caption = ct.thead, ct.th = ct.td, x.fn.extend({text: function(e) {
            return x.access(this, function(e) {
                return e === undefined ? x.text(this) : this.empty().append((this[0] && this[0].ownerDocument || o).createTextNode(e))
            }, null, e, arguments.length)
        }, append: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = pt(this, e);
                    t.appendChild(e)
                }
            })
        }, prepend: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = pt(this, e);
                    t.insertBefore(e, t.firstChild)
                }
            })
        }, before: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this)
            })
        }, after: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
            })
        }, remove: function(e, t) {
            var n, r = e ? x.filter(e, this) : this, i = 0;
            for (; null != (n = r[i]); i++)
                t || 1 !== n.nodeType || x.cleanData(mt(n)), n.parentNode && (t && x.contains(n.ownerDocument, n) && dt(mt(n, "script")), n.parentNode.removeChild(n));
            return this
        }, empty: function() {
            var e, t = 0;
            for (; null != (e = this[t]); t++)
                1 === e.nodeType && (x.cleanData(mt(e, !1)), e.textContent = "");
            return this
        }, clone: function(e, t) {
            return e = null == e ? !1 : e, t = null == t ? e : t, this.map(function() {
                return x.clone(this, e, t)
            })
        }, html: function(e) {
            return x.access(this, function(e) {
                var t = this[0] || {}, n = 0, r = this.length;
                if (e === undefined && 1 === t.nodeType)
                    return t.innerHTML;
                if ("string" == typeof e && !it.test(e) && !ct[(nt.exec(e) || ["", ""])[1].toLowerCase()]) {
                    e = e.replace(tt, "<$1></$2>");
                    try {
                        for (; r > n; n++)
                            t = this[n] || {}, 1 === t.nodeType && (x.cleanData(mt(t, !1)), t.innerHTML = e);
                        t = 0
                    } catch (i) {
                    }
                }
                t && this.empty().append(e)
            }, null, e, arguments.length)
        }, replaceWith: function() {
            var e = x.map(this, function(e) {
                return[e.nextSibling, e.parentNode]
            }), t = 0;
            return this.domManip(arguments, function(n) {
                var r = e[t++], i = e[t++];
                i && (r && r.parentNode !== i && (r = this.nextSibling), x(this).remove(), i.insertBefore(n, r))
            }, !0), t ? this : this.remove()
        }, detach: function(e) {
            return this.remove(e, !0)
        }, domManip: function(e, t, n) {
            e = f.apply([], e);
            var r, i, s, o, u, a, l = 0, c = this.length, h = this, p = c - 1, d = e[0], v = x.isFunction(d);
            if (v || !(1 >= c || "string" != typeof d || x.support.checkClone) && st.test(d))
                return this.each(function(r) {
                    var i = h.eq(r);
                    v && (e[0] = d.call(this, r, i.html())), i.domManip(e, t, n)
                });
            if (c && (r = x.buildFragment(e, this[0].ownerDocument, !1, !n && this), i = r.firstChild, 1 === r.childNodes.length && (r = i), i)) {
                for (s = x.map(mt(r, "script"), ft), o = s.length; c > l; l++)
                    u = r, l !== p && (u = x.clone(u, !0, !0), o && x.merge(s, mt(u, "script"))), t.call(this[l], u, l);
                if (o)
                    for (a = s[s.length - 1].ownerDocument, x.map(s, ht), l = 0; o > l; l++)
                        u = s[l], at.test(u.type || "") && !q.access(u, "globalEval") && x.contains(a, u) && (u.src ? x._evalUrl(u.src) : x.globalEval(u.textContent.replace(lt, "")))
            }
            return this
        }}), x.each({appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith"}, function(e, t) {
        x.fn[e] = function(e) {
            var n, r = [], i = x(e), s = i.length - 1, o = 0;
            for (; s >= o; o++)
                n = o === s ? this : this.clone(!0), x(i[o])[t](n), h.apply(r, n.get());
            return this.pushStack(r)
        }
    }), x.extend({clone: function(e, t, n) {
            var r, i, s, o, u = e.cloneNode(!0), a = x.contains(e.ownerDocument, e);
            if (!(x.support.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || x.isXMLDoc(e)))
                for (o = mt(u), s = mt(e), r = 0, i = s.length; i > r; r++)
                    yt(s[r], o[r]);
            if (t)
                if (n)
                    for (s = s || mt(e), o = o || mt(u), r = 0, i = s.length; i > r; r++)
                        gt(s[r], o[r]);
                else
                    gt(e, u);
            return o = mt(u, "script"), o.length > 0 && dt(o, !a && mt(e, "script")), u
        }, buildFragment: function(e, t, n, r) {
            var i, s, o, u, a, f, l = 0, c = e.length, h = t.createDocumentFragment(), p = [];
            for (; c > l; l++)
                if (i = e[l], i || 0 === i)
                    if ("object" === x.type(i))
                        x.merge(p, i.nodeType ? [i] : i);
                    else if (rt.test(i)) {
                        s = s || h.appendChild(t.createElement("div")), o = (nt.exec(i) || ["", ""])[1].toLowerCase(), u = ct[o] || ct._default, s.innerHTML = u[1] + i.replace(tt, "<$1></$2>") + u[2], f = u[0];
                        while (f--)
                            s = s.lastChild;
                        x.merge(p, s.childNodes), s = h.firstChild, s.textContent = ""
                    } else
                        p.push(t.createTextNode(i));
            h.textContent = "", l = 0;
            while (i = p[l++])
                if ((!r || -1 === x.inArray(i, r)) && (a = x.contains(i.ownerDocument, i), s = mt(h.appendChild(i), "script"), a && dt(s), n)) {
                    f = 0;
                    while (i = s[f++])
                        at.test(i.type || "") && n.push(i)
                }
            return h
        }, cleanData: function(e) {
            var t, n, r, i, s, o, u = x.event.special, a = 0;
            for (; (n = e[a]) !== undefined; a++) {
                if (F.accepts(n) && (s = n[q.expando], s && (t = q.cache[s]))) {
                    if (r = Object.keys(t.events || {}), r.length)
                        for (o = 0; (i = r[o]) !== undefined; o++)
                            u[i] ? x.event.remove(n, i) : x.removeEvent(n, i, t.handle);
                    q.cache[s] && delete q.cache[s]
                }
                delete L.cache[n[L.expando]]
            }
        }, _evalUrl: function(e) {
            return x.ajax({url: e, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0})
        }}), x.fn.extend({wrapAll: function(e) {
            var t;
            return x.isFunction(e) ? this.each(function(t) {
                x(this).wrapAll(e.call(this, t))
            }) : (this[0] && (t = x(e, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
                var e = this;
                while (e.firstElementChild)
                    e = e.firstElementChild;
                return e
            }).append(this)), this)
        }, wrapInner: function(e) {
            return x.isFunction(e) ? this.each(function(t) {
                x(this).wrapInner(e.call(this, t))
            }) : this.each(function() {
                var t = x(this), n = t.contents();
                n.length ? n.wrapAll(e) : t.append(e)
            })
        }, wrap: function(e) {
            var t = x.isFunction(e);
            return this.each(function(n) {
                x(this).wrapAll(t ? e.call(this, n) : e)
            })
        }, unwrap: function() {
            return this.parent().each(function() {
                x.nodeName(this, "body") || x(this).replaceWith(this.childNodes)
            }).end()
        }});
    var vt, xt, bt = /^(none|table(?!-c[ea]).+)/, wt = /^margin/, Tt = RegExp("^(" + b + ")(.*)$", "i"), Ct = RegExp("^(" + b + ")(?!px)[a-z%]+$", "i"), kt = RegExp("^([+-])=(" + b + ")", "i"), Nt = {BODY: "block"}, Et = {position: "absolute", visibility: "hidden", display: "block"}, St = {letterSpacing: 0, fontWeight: 400}, jt = ["Top", "Right", "Bottom", "Left"], Dt = ["Webkit", "O", "Moz", "ms"];
    x.fn.extend({css: function(e, t) {
            return x.access(this, function(e, t, n) {
                var r, i, s = {}, o = 0;
                if (x.isArray(t)) {
                    for (r = qt(e), i = t.length; i > o; o++)
                        s[t[o]] = x.css(e, t[o], !1, r);
                    return s
                }
                return n !== undefined ? x.style(e, t, n) : x.css(e, t)
            }, e, t, arguments.length > 1)
        }, show: function() {
            return Ht(this, !0)
        }, hide: function() {
            return Ht(this)
        }, toggle: function(e) {
            return"boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function() {
                Lt(this) ? x(this).show() : x(this).hide()
            })
        }}), x.extend({cssHooks: {opacity: {get: function(e, t) {
                    if (t) {
                        var n = vt(e, "opacity");
                        return"" === n ? "1" : n
                    }
                }}}, cssNumber: {columnCount: !0, fillOpacity: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0}, cssProps: {"float": "cssFloat"}, style: function(e, t, n, r) {
            if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                var i, s, o, u = x.camelCase(t), a = e.style;
                return t = x.cssProps[u] || (x.cssProps[u] = At(a, u)), o = x.cssHooks[t] || x.cssHooks[u], n === undefined ? o && "get"in o && (i = o.get(e, !1, r)) !== undefined ? i : a[t] : (s = typeof n, "string" === s && (i = kt.exec(n)) && (n = (i[1] + 1) * i[2] + parseFloat(x.css(e, t)), s = "number"), null == n || "number" === s && isNaN(n) || ("number" !== s || x.cssNumber[u] || (n += "px"), x.support.clearCloneStyle || "" !== n || 0 !== t.indexOf("background") || (a[t] = "inherit"), o && "set"in o && (n = o.set(e, n, r)) === undefined || (a[t] = n)), undefined)
            }
        }, css: function(e, t, n, r) {
            var i, s, o, u = x.camelCase(t);
            return t = x.cssProps[u] || (x.cssProps[u] = At(e.style, u)), o = x.cssHooks[t] || x.cssHooks[u], o && "get"in o && (i = o.get(e, !0, n)), i === undefined && (i = vt(e, t, r)), "normal" === i && t in St && (i = St[t]), "" === n || n ? (s = parseFloat(i), n === !0 || x.isNumeric(s) ? s || 0 : i) : i
        }}), vt = function(e, t, n) {
        var r, i, s, o = n || qt(e), u = o ? o.getPropertyValue(t) || o[t] : undefined, a = e.style;
        return o && ("" !== u || x.contains(e.ownerDocument, e) || (u = x.style(e, t)), Ct.test(u) && wt.test(t) && (r = a.width, i = a.minWidth, s = a.maxWidth, a.minWidth = a.maxWidth = a.width = u, u = o.width, a.width = r, a.minWidth = i, a.maxWidth = s)), u
    }, x.each(["height", "width"], function(e, t) {
        x.cssHooks[t] = {get: function(e, n, r) {
                return n ? 0 === e.offsetWidth && bt.test(x.css(e, "display")) ? x.swap(e, Et, function() {
                    return Pt(e, t, r)
                }) : Pt(e, t, r) : undefined
            }, set: function(e, n, r) {
                var i = r && qt(e);
                return Ot(e, n, r ? Ft(e, t, r, x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, i), i) : 0)
            }}
    }), x(function() {
        x.support.reliableMarginRight || (x.cssHooks.marginRight = {get: function(e, t) {
                return t ? x.swap(e, {display: "inline-block"}, vt, [e, "marginRight"]) : undefined
            }}), !x.support.pixelPosition && x.fn.position && x.each(["top", "left"], function(e, t) {
            x.cssHooks[t] = {get: function(e, n) {
                    return n ? (n = vt(e, t), Ct.test(n) ? x(e).position()[t] + "px" : n) : undefined
                }}
        })
    }), x.expr && x.expr.filters && (x.expr.filters.hidden = function(e) {
        return 0 >= e.offsetWidth && 0 >= e.offsetHeight
    }, x.expr.filters.visible = function(e) {
        return!x.expr.filters.hidden(e)
    }), x.each({margin: "", padding: "", border: "Width"}, function(e, t) {
        x.cssHooks[e + t] = {expand: function(n) {
                var r = 0, i = {}, s = "string" == typeof n ? n.split(" ") : [n];
                for (; 4 > r; r++)
                    i[e + jt[r] + t] = s[r] || s[r - 2] || s[0];
                return i
            }}, wt.test(e) || (x.cssHooks[e + t].set = Ot)
    });
    var Wt = /%20/g, $t = /\[\]$/, Bt = /\r?\n/g, It = /^(?:submit|button|image|reset|file)$/i, zt = /^(?:input|select|textarea|keygen)/i;
    x.fn.extend({serialize: function() {
            return x.param(this.serializeArray())
        }, serializeArray: function() {
            return this.map(function() {
                var e = x.prop(this, "elements");
                return e ? x.makeArray(e) : this
            }).filter(function() {
                var e = this.type;
                return this.name && !x(this).is(":disabled") && zt.test(this.nodeName) && !It.test(e) && (this.checked || !ot.test(e))
            }).map(function(e, t) {
                var n = x(this).val();
                return null == n ? null : x.isArray(n) ? x.map(n, function(e) {
                    return{name: t.name, value: e.replace(Bt, "\r\n")}
                }) : {name: t.name, value: n.replace(Bt, "\r\n")}
            }).get()
        }}), x.param = function(e, t) {
        var n, r = [], i = function(e, t) {
            t = x.isFunction(t) ? t() : null == t ? "" : t, r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
        };
        if (t === undefined && (t = x.ajaxSettings && x.ajaxSettings.traditional), x.isArray(e) || e.jquery && !x.isPlainObject(e))
            x.each(e, function() {
                i(this.name, this.value)
            });
        else
            for (n in e)
                _t(n, e[n], t, i);
        return r.join("&").replace(Wt, "+")
    }, x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
        x.fn[t] = function(e, n) {
            return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
        }
    }), x.fn.extend({hover: function(e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        }, bind: function(e, t, n) {
            return this.on(e, null, t, n)
        }, unbind: function(e, t) {
            return this.off(e, null, t)
        }, delegate: function(e, t, n, r) {
            return this.on(t, e, n, r)
        }, undelegate: function(e, t, n) {
            return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
        }});
    var Xt, Ut, Yt = x.now(), Vt = /\?/, Gt = /#.*$/, Jt = /([?&])_=[^&]*/, Qt = /^(.*?):[ \t]*([^\r\n]*)$/gm, Kt = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, Zt = /^(?:GET|HEAD)$/, en = /^\/\//, tn = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, nn = x.fn.load, rn = {}, on = {}, sn = "*/".concat("*");
    try {
        Ut = i.href
    } catch (an) {
        Ut = o.createElement("a"), Ut.href = "", Ut = Ut.href
    }
    Xt = tn.exec(Ut.toLowerCase()) || [], x.fn.load = function(e, t, n) {
        if ("string" != typeof e && nn)
            return nn.apply(this, arguments);
        var r, i, s, o = this, u = e.indexOf(" ");
        return u >= 0 && (r = e.slice(u), e = e.slice(0, u)), x.isFunction(t) ? (n = t, t = undefined) : t && "object" == typeof t && (i = "POST"), o.length > 0 && x.ajax({url: e, type: i, dataType: "html", data: t}).done(function(e) {
            s = arguments, o.html(r ? x("<div>").append(x.parseHTML(e)).find(r) : e)
        }).complete(n && function(e, t) {
            o.each(n, s || [e.responseText, t, e])
        }), this
    }, x.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
        x.fn[t] = function(e) {
            return this.on(t, e)
        }
    }), x.extend({active: 0, lastModified: {}, etag: {}, ajaxSettings: {url: Ut, type: "GET", isLocal: Kt.test(Xt[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: {"*": sn, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript"}, contents: {xml: /xml/, html: /html/, json: /json/}, responseFields: {xml: "responseXML", text: "responseText", json: "responseJSON"}, converters: {"* text": String, "text html": !0, "text json": x.parseJSON, "text xml": x.parseXML}, flatOptions: {url: !0, context: !0}}, ajaxSetup: function(e, t) {
            return t ? cn(cn(e, x.ajaxSettings), t) : cn(x.ajaxSettings, e)
        }, ajaxPrefilter: un(rn), ajaxTransport: un(on), ajax: function(e, t) {
            function T(e, t, s, u) {
                var f, m, g, b, w, S = t;
                2 !== y && (y = 2, o && clearTimeout(o), n = undefined, i = u || "", E.readyState = e > 0 ? 4 : 0, f = e >= 200 && 300 > e || 304 === e, s && (b = pn(l, E, s)), b = fn(l, b, E, f), f ? (l.ifModified && (w = E.getResponseHeader("Last-Modified"), w && (x.lastModified[r] = w), w = E.getResponseHeader("etag"), w && (x.etag[r] = w)), 204 === e || "HEAD" === l.type ? S = "nocontent" : 304 === e ? S = "notmodified" : (S = b.state, m = b.data, g = b.error, f = !g)) : (g = S, (e || !S) && (S = "error", 0 > e && (e = 0))), E.status = e, E.statusText = (t || S) + "", f ? p.resolveWith(c, [m, S, E]) : p.rejectWith(c, [E, S, g]), E.statusCode(v), v = undefined, a && h.trigger(f ? "ajaxSuccess" : "ajaxError", [E, l, f ? m : g]), d.fireWith(c, [E, S]), a && (h.trigger("ajaxComplete", [E, l]), --x.active || x.event.trigger("ajaxStop")))
            }
            "object" == typeof e && (t = e, e = undefined), t = t || {};
            var n, r, i, s, o, u, a, f, l = x.ajaxSetup({}, t), c = l.context || l, h = l.context && (c.nodeType || c.jquery) ? x(c) : x.event, p = x.Deferred(), d = x.Callbacks("once memory"), v = l.statusCode || {}, m = {}, g = {}, y = 0, b = "canceled", E = {readyState: 0, getResponseHeader: function(e) {
                    var t;
                    if (2 === y) {
                        if (!s) {
                            s = {};
                            while (t = Qt.exec(i))
                                s[t[1].toLowerCase()] = t[2]
                        }
                        t = s[e.toLowerCase()]
                    }
                    return null == t ? null : t
                }, getAllResponseHeaders: function() {
                    return 2 === y ? i : null
                }, setRequestHeader: function(e, t) {
                    var n = e.toLowerCase();
                    return y || (e = g[n] = g[n] || e, m[e] = t), this
                }, overrideMimeType: function(e) {
                    return y || (l.mimeType = e), this
                }, statusCode: function(e) {
                    var t;
                    if (e)
                        if (2 > y)
                            for (t in e)
                                v[t] = [v[t], e[t]];
                        else
                            E.always(e[E.status]);
                    return this
                }, abort: function(e) {
                    var t = e || b;
                    return n && n.abort(t), T(0, t), this
                }};
            if (p.promise(E).complete = d.add, E.success = E.done, E.error = E.fail, l.url = ((e || l.url || Ut) + "").replace(Gt, "").replace(en, Xt[1] + "//"), l.type = t.method || t.type || l.method || l.type, l.dataTypes = x.trim(l.dataType || "*").toLowerCase().match(w) || [""], null == l.crossDomain && (u = tn.exec(l.url.toLowerCase()), l.crossDomain = !(!u || u[1] === Xt[1] && u[2] === Xt[2] && (u[3] || ("http:" === u[1] ? "80" : "443")) === (Xt[3] || ("http:" === Xt[1] ? "80" : "443")))), l.data && l.processData && "string" != typeof l.data && (l.data = x.param(l.data, l.traditional)), ln(rn, l, t, E), 2 === y)
                return E;
            a = l.global, a && 0 === x.active++ && x.event.trigger("ajaxStart"), l.type = l.type.toUpperCase(), l.hasContent = !Zt.test(l.type), r = l.url, l.hasContent || (l.data && (r = l.url += (Vt.test(r) ? "&" : "?") + l.data, delete l.data), l.cache === !1 && (l.url = Jt.test(r) ? r.replace(Jt, "$1_=" + Yt++) : r + (Vt.test(r) ? "&" : "?") + "_=" + Yt++)), l.ifModified && (x.lastModified[r] && E.setRequestHeader("If-Modified-Since", x.lastModified[r]), x.etag[r] && E.setRequestHeader("If-None-Match", x.etag[r])), (l.data && l.hasContent && l.contentType !== !1 || t.contentType) && E.setRequestHeader("Content-Type", l.contentType), E.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + ("*" !== l.dataTypes[0] ? ", " + sn + "; q=0.01" : "") : l.accepts["*"]);
            for (f in l.headers)
                E.setRequestHeader(f, l.headers[f]);
            if (!l.beforeSend || l.beforeSend.call(c, E, l) !== !1 && 2 !== y) {
                b = "abort";
                for (f in{success:1, error:1, complete:1})
                    E[f](l[f]);
                if (n = ln(on, l, t, E)) {
                    E.readyState = 1, a && h.trigger("ajaxSend", [E, l]), l.async && l.timeout > 0 && (o = setTimeout(function() {
                        E.abort("timeout")
                    }, l.timeout));
                    try {
                        y = 1, n.send(m, T)
                    } catch (S) {
                        if (!(2 > y))
                            throw S;
                        T(-1, S)
                    }
                } else
                    T(-1, "No Transport");
                return E
            }
            return E.abort()
        }, getJSON: function(e, t, n) {
            return x.get(e, t, n, "json")
        }, getScript: function(e, t) {
            return x.get(e, undefined, t, "script")
        }}), x.each(["get", "post"], function(e, t) {
        x[t] = function(e, n, r, i) {
            return x.isFunction(n) && (i = i || r, r = n, n = undefined), x.ajax({url: e, type: t, dataType: i, data: n, success: r})
        }
    }), x.ajaxSetup({accepts: {script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"}, contents: {script: /(?:java|ecma)script/}, converters: {"text script": function(e) {
                return x.globalEval(e), e
            }}}), x.ajaxPrefilter("script", function(e) {
        e.cache === undefined && (e.cache = !1), e.crossDomain && (e.type = "GET")
    }), x.ajaxTransport("script", function(e) {
        if (e.crossDomain) {
            var t, n;
            return{send: function(r, i) {
                    t = x("<script>").prop({async: !0, charset: e.scriptCharset, src: e.url}).on("load error", n = function(e) {
                        t.remove(), n = null, e && i("error" === e.type ? 404 : 200, e.type)
                    }), o.head.appendChild(t[0])
                }, abort: function() {
                    n && n()
                }}
        }
    });
    var hn = [], dn = /(=)\?(?=&|$)|\?\?/;
    x.ajaxSetup({jsonp: "callback", jsonpCallback: function() {
            var e = hn.pop() || x.expando + "_" + Yt++;
            return this[e] = !0, e
        }}), x.ajaxPrefilter("json jsonp", function(t, n, r) {
        var i, s, o, u = t.jsonp !== !1 && (dn.test(t.url) ? "url" : "string" == typeof t.data && !(t.contentType || "").indexOf("application/x-www-form-urlencoded") && dn.test(t.data) && "data");
        return u || "jsonp" === t.dataTypes[0] ? (i = t.jsonpCallback = x.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback, u ? t[u] = t[u].replace(dn, "$1" + i) : t.jsonp !== !1 && (t.url += (Vt.test(t.url) ? "&" : "?") + t.jsonp + "=" + i), t.converters["script json"] = function() {
            return o || x.error(i + " was not called"), o[0]
        }, t.dataTypes[0] = "json", s = e[i], e[i] = function() {
            o = arguments
        }, r.always(function() {
            e[i] = s, t[i] && (t.jsonpCallback = n.jsonpCallback, hn.push(i)), o && x.isFunction(s) && s(o[0]), o = s = undefined
        }), "script") : undefined
    }), x.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest
        } catch (e) {
        }
    };
    var gn = x.ajaxSettings.xhr(), mn = {0: 200, 1223: 204}, yn = 0, vn = {};
    e.ActiveXObject && x(e).on("unload", function() {
        for (var e in vn)
            vn[e]();
        vn = undefined
    }), x.support.cors = !!gn && "withCredentials"in gn, x.support.ajax = gn = !!gn, x.ajaxTransport(function(e) {
        var t;
        return x.support.cors || gn && !e.crossDomain ? {send: function(n, r) {
                var i, s, o = e.xhr();
                if (o.open(e.type, e.url, e.async, e.username, e.password), e.xhrFields)
                    for (i in e.xhrFields)
                        o[i] = e.xhrFields[i];
                e.mimeType && o.overrideMimeType && o.overrideMimeType(e.mimeType), e.crossDomain || n["X-Requested-With"] || (n["X-Requested-With"] = "XMLHttpRequest");
                for (i in n)
                    o.setRequestHeader(i, n[i]);
                t = function(e) {
                    return function() {
                        t && (delete vn[s], t = o.onload = o.onerror = null, "abort" === e ? o.abort() : "error" === e ? r(o.status || 404, o.statusText) : r(mn[o.status] || o.status, o.statusText, "string" == typeof o.responseText ? {text: o.responseText} : undefined, o.getAllResponseHeaders()))
                    }
                }, o.onload = t(), o.onerror = t("error"), t = vn[s = yn++] = t("abort"), o.send(e.hasContent && e.data || null)
            }, abort: function() {
                t && t()
            }} : undefined
    });
    var xn, bn, wn = /^(?:toggle|show|hide)$/, Tn = RegExp("^(?:([+-])=|)(" + b + ")([a-z%]*)$", "i"), Cn = /queueHooks$/, kn = [An], Nn = {"*": [function(e, t) {
                var n = this.createTween(e, t), r = n.cur(), i = Tn.exec(t), s = i && i[3] || (x.cssNumber[e] ? "" : "px"), o = (x.cssNumber[e] || "px" !== s && +r) && Tn.exec(x.css(n.elem, e)), u = 1, a = 20;
                if (o && o[3] !== s) {
                    s = s || o[3], i = i || [], o = +r || 1;
                    do
                        u = u || ".5", o /= u, x.style(n.elem, e, o + s);
                    while (u !== (u = n.cur() / r) && 1 !== u && --a)
                }
                return i && (o = n.start = +o || +r || 0, n.unit = s, n.end = i[1] ? o + (i[1] + 1) * i[2] : +i[2]), n
            }]};
    x.Animation = x.extend(jn, {tweener: function(e, t) {
            x.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" ");
            var n, r = 0, i = e.length;
            for (; i > r; r++)
                n = e[r], Nn[n] = Nn[n] || [], Nn[n].unshift(t)
        }, prefilter: function(e, t) {
            t ? kn.unshift(e) : kn.push(e)
        }}), x.Tween = Ln, Ln.prototype = {constructor: Ln, init: function(e, t, n, r, i, s) {
            this.elem = e, this.prop = n, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = s || (x.cssNumber[n] ? "" : "px")
        }, cur: function() {
            var e = Ln.propHooks[this.prop];
            return e && e.get ? e.get(this) : Ln.propHooks._default.get(this)
        }, run: function(e) {
            var t, n = Ln.propHooks[this.prop];
            return this.pos = t = this.options.duration ? x.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : Ln.propHooks._default.set(this), this
        }}, Ln.prototype.init.prototype = Ln.prototype, Ln.propHooks = {_default: {get: function(e) {
                var t;
                return null == e.elem[e.prop] || e.elem.style && null != e.elem.style[e.prop] ? (t = x.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0) : e.elem[e.prop]
            }, set: function(e) {
                x.fx.step[e.prop] ? x.fx.step[e.prop](e) : e.elem.style && (null != e.elem.style[x.cssProps[e.prop]] || x.cssHooks[e.prop]) ? x.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
            }}}, Ln.propHooks.scrollTop = Ln.propHooks.scrollLeft = {set: function(e) {
            e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
        }}, x.each(["toggle", "show", "hide"], function(e, t) {
        var n = x.fn[t];
        x.fn[t] = function(e, r, i) {
            return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(qn(t, !0), e, r, i)
        }
    }), x.fn.extend({fadeTo: function(e, t, n, r) {
            return this.filter(Lt).css("opacity", 0).show().end().animate({opacity: t}, e, n, r)
        }, animate: function(e, t, n, r) {
            var i = x.isEmptyObject(e), s = x.speed(t, n, r), o = function() {
                var t = jn(this, x.extend({}, e), s);
                (i || q.get(this, "finish")) && t.stop(!0)
            };
            return o.finish = o, i || s.queue === !1 ? this.each(o) : this.queue(s.queue, o)
        }, stop: function(e, t, n) {
            var r = function(e) {
                var t = e.stop;
                delete e.stop, t(n)
            };
            return"string" != typeof e && (n = t, t = e, e = undefined), t && e !== !1 && this.queue(e || "fx", []), this.each(function() {
                var t = !0, i = null != e && e + "queueHooks", s = x.timers, o = q.get(this);
                if (i)
                    o[i] && o[i].stop && r(o[i]);
                else
                    for (i in o)
                        o[i] && o[i].stop && Cn.test(i) && r(o[i]);
                for (i = s.length; i--; )
                    s[i].elem !== this || null != e && s[i].queue !== e || (s[i].anim.stop(n), t = !1, s.splice(i, 1));
                (t || !n) && x.dequeue(this, e)
            })
        }, finish: function(e) {
            return e !== !1 && (e = e || "fx"), this.each(function() {
                var t, n = q.get(this), r = n[e + "queue"], i = n[e + "queueHooks"], s = x.timers, o = r ? r.length : 0;
                for (n.finish = !0, x.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = s.length; t--; )
                    s[t].elem === this && s[t].queue === e && (s[t].anim.stop(!0), s.splice(t, 1));
                for (t = 0; o > t; t++)
                    r[t] && r[t].finish && r[t].finish.call(this);
                delete n.finish
            })
        }}), x.each({slideDown: qn("show"), slideUp: qn("hide"), slideToggle: qn("toggle"), fadeIn: {opacity: "show"}, fadeOut: {opacity: "hide"}, fadeToggle: {opacity: "toggle"}}, function(e, t) {
        x.fn[e] = function(e, n, r) {
            return this.animate(t, e, n, r)
        }
    }), x.speed = function(e, t, n) {
        var r = e && "object" == typeof e ? x.extend({}, e) : {complete: n || !n && t || x.isFunction(e) && e, duration: e, easing: n && t || t && !x.isFunction(t) && t};
        return r.duration = x.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in x.fx.speeds ? x.fx.speeds[r.duration] : x.fx.speeds._default, (null == r.queue || r.queue === !0) && (r.queue = "fx"), r.old = r.complete, r.complete = function() {
            x.isFunction(r.old) && r.old.call(this), r.queue && x.dequeue(this, r.queue)
        }, r
    }, x.easing = {linear: function(e) {
            return e
        }, swing: function(e) {
            return.5 - Math.cos(e * Math.PI) / 2
        }}, x.timers = [], x.fx = Ln.prototype.init, x.fx.tick = function() {
        var e, t = x.timers, n = 0;
        for (xn = x.now(); t.length > n; n++)
            e = t[n], e() || t[n] !== e || t.splice(n--, 1);
        t.length || x.fx.stop(), xn = undefined
    }, x.fx.timer = function(e) {
        e() && x.timers.push(e) && x.fx.start()
    }, x.fx.interval = 13, x.fx.start = function() {
        bn || (bn = setInterval(x.fx.tick, x.fx.interval))
    }, x.fx.stop = function() {
        clearInterval(bn), bn = null
    }, x.fx.speeds = {slow: 600, fast: 200, _default: 400}, x.fx.step = {}, x.expr && x.expr.filters && (x.expr.filters.animated = function(e) {
        return x.grep(x.timers, function(t) {
            return e === t.elem
        }).length
    }), x.fn.offset = function(e) {
        if (arguments.length)
            return e === undefined ? this : this.each(function(t) {
                x.offset.setOffset(this, e, t)
            });
        var t, n, i = this[0], s = {top: 0, left: 0}, o = i && i.ownerDocument;
        if (o)
            return t = o.documentElement, x.contains(t, i) ? (typeof i.getBoundingClientRect !== r && (s = i.getBoundingClientRect()), n = Hn(o), {top: s.top + n.pageYOffset - t.clientTop, left: s.left + n.pageXOffset - t.clientLeft}) : s
    }, x.offset = {setOffset: function(e, t, n) {
            var r, i, s, o, u, a, f, l = x.css(e, "position"), c = x(e), h = {};
            "static" === l && (e.style.position = "relative"), u = c.offset(), s = x.css(e, "top"), a = x.css(e, "left"), f = ("absolute" === l || "fixed" === l) && (s + a).indexOf("auto") > -1, f ? (r = c.position(), o = r.top, i = r.left) : (o = parseFloat(s) || 0, i = parseFloat(a) || 0), x.isFunction(t) && (t = t.call(e, n, u)), null != t.top && (h.top = t.top - u.top + o), null != t.left && (h.left = t.left - u.left + i), "using"in t ? t.using.call(e, h) : c.css(h)
        }}, x.fn.extend({position: function() {
            if (this[0]) {
                var e, t, n = this[0], r = {top: 0, left: 0};
                return"fixed" === x.css(n, "position") ? t = n.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), x.nodeName(e[0], "html") || (r = e.offset()), r.top += x.css(e[0], "borderTopWidth", !0), r.left += x.css(e[0], "borderLeftWidth", !0)), {top: t.top - r.top - x.css(n, "marginTop", !0), left: t.left - r.left - x.css(n, "marginLeft", !0)}
            }
        }, offsetParent: function() {
            return this.map(function() {
                var e = this.offsetParent || s;
                while (e && !x.nodeName(e, "html") && "static" === x.css(e, "position"))
                    e = e.offsetParent;
                return e || s
            })
        }}), x.each({scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function(t, n) {
        var r = "pageYOffset" === n;
        x.fn[t] = function(i) {
            return x.access(this, function(t, i, s) {
                var o = Hn(t);
                return s === undefined ? o ? o[n] : t[i] : (o ? o.scrollTo(r ? e.pageXOffset : s, r ? s : e.pageYOffset) : t[i] = s, undefined)
            }, t, i, arguments.length, null)
        }
    }), x.each({Height: "height", Width: "width"}, function(e, t) {
        x.each({padding: "inner" + e, content: t, "": "outer" + e}, function(n, r) {
            x.fn[r] = function(r, i) {
                var s = arguments.length && (n || "boolean" != typeof r), o = n || (r === !0 || i === !0 ? "margin" : "border");
                return x.access(this, function(t, n, r) {
                    var i;
                    return x.isWindow(t) ? t.document.documentElement["client" + e] : 9 === t.nodeType ? (i = t.documentElement, Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : r === undefined ? x.css(t, n, o) : x.style(t, n, r, o)
                }, t, s ? r : undefined, s, null)
            }
        })
    }), x.fn.size = function() {
        return this.length
    }, x.fn.andSelf = x.fn.addBack, "object" == typeof module && module && "object" == typeof module.exports ? module.exports = x : "function" == typeof define && define.amd && define("jquery", [], function() {
        return x
    }), "object" == typeof e && "object" == typeof e.document && (e.jQuery = e.$ = x)
})(window);
var DSP = {LEFT: 0, RIGHT: 1, MIX: 2, SINE: 1, TRIANGLE: 2, SAW: 3, SQUARE: 4, LOWPASS: 0, HIGHPASS: 1, BANDPASS: 2, NOTCH: 3, BARTLETT: 1, BARTLETTHANN: 2, BLACKMAN: 3, COSINE: 4, GAUSS: 5, HAMMING: 6, HANN: 7, LANCZOS: 8, RECTANGULAR: 9, TRIANGULAR: 10, OFF: 0, FW: 1, BW: 2, FWBW: 3, TWO_PI: 2 * Math.PI};
setupTypedArray("Float32Array", "WebGLFloatArray"), setupTypedArray("Int32Array", "WebGLIntArray"), setupTypedArray("Uint16Array", "WebGLUnsignedShortArray"), setupTypedArray("Uint8Array", "WebGLUnsignedByteArray"), DSP.invert = function(e) {
    for (var t = 0, n = e.length; t < n; t++)
        e[t] *= -1;
    return e
}, DSP.interleave = function(e, t) {
    if (e.length !== t.length)
        throw"Can not interleave. Channel lengths differ.";
    var n = new Float32Array(e.length * 2);
    for (var r = 0, i = e.length; r < i; r++)
        n[2 * r] = e[r], n[2 * r + 1] = t[r];
    return n
}, DSP.deinterleave = function() {
    var e, t, n, r = [];
    return r[DSP.MIX] = function(e) {
        for (var t = 0, r = e.length / 2; t < r; t++)
            n[t] = (e[2 * t] + e[2 * t + 1]) / 2;
        return n
    }, r[DSP.LEFT] = function(t) {
        for (var n = 0, r = t.length / 2; n < r; n++)
            e[n] = t[2 * n];
        return e
    }, r[DSP.RIGHT] = function(e) {
        for (var n = 0, r = e.length / 2; n < r; n++)
            t[n] = e[2 * n + 1];
        return t
    }, function(i, s) {
        return e = e || new Float32Array(s.length / 2), t = t || new Float32Array(s.length / 2), n = n || new Float32Array(s.length / 2), s.length / 2 !== e.length && (e = new Float32Array(s.length / 2), t = new Float32Array(s.length / 2), n = new Float32Array(s.length / 2)), r[i](s)
    }
}(), DSP.getChannel = DSP.deinterleave, DSP.mixSampleBuffers = function(e, t, n, r) {
    var i = new Float32Array(e);
    for (var s = 0; s < e.length; s++)
        i[s] += (n ? -t[s] : t[s]) / r;
    return i
}, DSP.LPF = 0, DSP.HPF = 1, DSP.BPF_CONSTANT_SKIRT = 2, DSP.BPF_CONSTANT_PEAK = 3, DSP.NOTCH = 4, DSP.APF = 5, DSP.PEAKING_EQ = 6, DSP.LOW_SHELF = 7, DSP.HIGH_SHELF = 8, DSP.Q = 1, DSP.BW = 2, DSP.S = 3, DSP.RMS = function(e) {
    var t = 0;
    for (var n = 0, r = e.length; n < r; n++)
        t += e[n] * e[n];
    return Math.sqrt(t / r)
}, DSP.Peak = function(e) {
    var t = 0;
    for (var n = 0, r = e.length; n < r; n++)
        t = Math.abs(e[n]) > t ? Math.abs(e[n]) : t;
    return t
}, DFT.prototype.forward = function(e) {
    var t = this.real, n = this.imag, r, i;
    for (var s = 0; s < this.bufferSize / 2; s++) {
        r = 0, i = 0;
        for (var o = 0; o < e.length; o++)
            r += this.cosTable[s * o] * e[o], i += this.sinTable[s * o] * e[o];
        t[s] = r, n[s] = i
    }
    return this.calculateSpectrum()
}, FFT.prototype.forward = function(e) {
    var t = this.bufferSize, n = this.cosTable, r = this.sinTable, i = this.reverseTable, s = this.real, o = this.imag, u = this.spectrum, a = Math.floor(Math.log(t) / Math.LN2);
    if (Math.pow(2, a) !== t)
        throw"Invalid buffer size, must be a power of 2.";
    if (t !== e.length)
        throw"Supplied buffer is not the same size as defined FFT. FFT Size: " + t + " Buffer Size: " + e.length;
    var f = 1, l, c, h, p, d, v, m, g, y;
    for (y = 0; y < t; y++)
        s[y] = e[i[y]], o[y] = 0;
    while (f < t) {
        l = n[f], c = r[f], h = 1, p = 0;
        for (var b = 0; b < f; b++) {
            y = b;
            while (y < t)
                d = y + f, v = h * s[d] - p * o[d], m = h * o[d] + p * s[d], s[d] = s[y] - v, o[d] = o[y] - m, s[y] += v, o[y] += m, y += f << 1;
            g = h, h = g * l - p * c, p = g * c + p * l
        }
        f <<= 1
    }
    return this.calculateSpectrum()
}, FFT.prototype.inverse = function(e, t) {
    var n = this.bufferSize, r = this.cosTable, i = this.sinTable, s = this.reverseTable, o = this.spectrum;
    e = e || this.real, t = t || this.imag;
    var u = 1, a, f, l, c, h, p, d, v, m;
    for (m = 0; m < n; m++)
        t[m] *= -1;
    var g = new Float32Array(n), y = new Float32Array(n);
    for (m = 0; m < e.length; m++)
        g[m] = e[s[m]], y[m] = t[s[m]];
    e = g, t = y;
    while (u < n) {
        a = r[u], f = i[u], l = 1, c = 0;
        for (var b = 0; b < u; b++) {
            m = b;
            while (m < n)
                h = m + u, p = l * e[h] - c * t[h], d = l * t[h] + c * e[h], e[h] = e[m] - p, t[h] = t[m] - d, e[m] += p, t[m] += d, m += u << 1;
            v = l, l = v * a - c * f, c = v * f + c * a
        }
        u <<= 1
    }
    var w = new Float32Array(n);
    for (m = 0; m < n; m++)
        w[m] = e[m] / n;
    return w
}, RFFT.prototype.forward = function(e) {
    var t = this.bufferSize, n = this.spectrum, r = this.trans, i = 2 * Math.PI, s = Math.sqrt, o = t >>> 1, u = 2 / t, a, f, l, c, h, p, d, v, m, g, y, b, w, E, S, x, T, N, C, k, L, A, O, M, _, D;
    this.reverseBinPermute(r, e);
    for (var P = 0, H = 4; P < t; H *= 4) {
        for (var B = P; B < t; B += H)
            T = r[B] - r[B + 1], r[B] += r[B + 1], r[B + 1] = T;
        P = 2 * (H - 1)
    }
    a = 2, c = t >>> 1;
    while (c >>>= 1) {
        P = 0, a <<= 1, H = a << 1, f = a >>> 2, l = a >>> 3;
        do {
            if (f !== 1)
                for (B = P; B < t; B += H)
                    m = B, g = m + f, y = g + f, b = y + f, h = r[y] + r[b], r[b] -= r[y], r[y] = r[m] - h, r[m] += h, m += l, g += l, y += l, b += l, h = r[y] + r[b], p = r[y] - r[b], h = -h * Math.SQRT1_2, p *= Math.SQRT1_2, T = r[g], r[b] = h + T, r[y] = h - T, r[g] = r[m] - p, r[m] += p;
            else
                for (B = P; B < t; B += H)
                    m = B, g = m + f, y = g + f, b = y + f, h = r[y] + r[b], r[b] -= r[y], r[y] = r[m] - h, r[m] += h;
            P = (H << 1) - a, H <<= 2
        } while (P < t);
        A = i / a;
        for (var j = 1; j < l; j++) {
            O = j * A, C = Math.sin(O), N = Math.cos(O), k = 4 * N * (N * N - .75), L = 4 * C * (.75 - C * C), P = 0, H = a << 1;
            do {
                for (B = P; B < t; B += H)
                    m = B + j, g = m + f, y = g + f, b = y + f, w = B + f - j, E = w + f, S = E + f, x = S + f, p = r[S] * N - r[y] * C, h = r[S] * C + r[y] * N, v = r[x] * k - r[b] * L, d = r[x] * L + r[b] * k, T = p - v, p += v, v = T, r[x] = p + r[E], r[y] = p - r[E], T = d - h, h += d, d = T, r[b] = d + r[g], r[S] = d - r[g], r[E] = r[m] - h, r[m] += h, r[g] = v + r[w], r[w] -= v;
                P = (H << 1) - a, H <<= 2
            } while (P < t)
        }
    }
    while (--o)
        M = r[o], _ = r[t - o - 1], D = u * s(M * M + _ * _), D > this.peak && (this.peakBand = o, this.peak = D), n[o] = D;
    return n[0] = u * r[0], n
}, Sampler.prototype.applyEnvelope = function() {
    return this.envelope.process(this.signal), this.signal
}, Sampler.prototype.generate = function() {
    var e = this.frameCount * this.bufferSize, t = this.playEnd * this.samples.length - this.playStart * this.samples.length, n = this.playStart * this.samples.length, r = this.playEnd * this.samples.length, i;
    for (var s = 0; s < this.bufferSize; s++) {
        switch (this.loopMode) {
            case DSP.OFF:
                this.playhead = Math.round(this.samplesProcessed * this.step + n), this.playhead < this.playEnd * this.samples.length ? this.signal[s] = this.samples[this.playhead] * this.amplitude : this.signal[s] = 0;
                break;
            case DSP.FW:
                this.playhead = Math.round(this.samplesProcessed * this.step % t + n), this.playhead < this.playEnd * this.samples.length && (this.signal[s] = this.samples[this.playhead] * this.amplitude);
                break;
            case DSP.BW:
                this.playhead = r - Math.round(this.samplesProcessed * this.step % t), this.playhead < this.playEnd * this.samples.length && (this.signal[s] = this.samples[this.playhead] * this.amplitude);
                break;
            case DSP.FWBW:
                Math.floor(this.samplesProcessed * this.step / t) % 2 === 0 ? this.playhead = Math.round(this.samplesProcessed * this.step % t + n) : this.playhead = r - Math.round(this.samplesProcessed * this.step % t), this.playhead < this.playEnd * this.samples.length && (this.signal[s] = this.samples[this.playhead] * this.amplitude)
        }
        this.samplesProcessed++
    }
    return this.frameCount++, this.signal
}, Sampler.prototype.setFreq = function(e) {
    var t = this.samplesProcessed * this.step;
    this.frequency = e, this.step = this.frequency / this.rootFrequency, this.samplesProcessed = Math.round(t / this.step)
}, Sampler.prototype.reset = function() {
    this.samplesProcessed = 0, this.playhead = 0
}, Oscillator.prototype.setAmp = function(e) {
    if (!(e >= 0 && e <= 1))
        throw"Amplitude out of range (0..1).";
    this.amplitude = e
}, Oscillator.prototype.setFreq = function(e) {
    this.frequency = e, this.cyclesPerSample = e / this.sampleRate
}, Oscillator.prototype.add = function(e) {
    for (var t = 0; t < this.bufferSize; t++)
        this.signal[t] += e.signal[t];
    return this.signal
}, Oscillator.prototype.addSignal = function(e) {
    for (var t = 0; t < e.length; t++) {
        if (t >= this.bufferSize)
            break;
        this.signal[t] += e[t]
    }
    return this.signal
}, Oscillator.prototype.addEnvelope = function(e) {
    this.envelope = e
}, Oscillator.prototype.applyEnvelope = function() {
    this.envelope.process(this.signal)
}, Oscillator.prototype.valueAt = function(e) {
    return this.waveTable[e % this.waveTableLength]
}, Oscillator.prototype.generate = function() {
    var e = this.frameCount * this.bufferSize, t = this.waveTableLength * this.frequency / this.sampleRate, n;
    for (var r = 0; r < this.bufferSize; r++)
        n = Math.round((e + r) * t), this.signal[r] = this.waveTable[n % this.waveTableLength] * this.amplitude;
    return this.frameCount++, this.signal
}, Oscillator.Sine = function(e) {
    return Math.sin(DSP.TWO_PI * e)
}, Oscillator.Square = function(e) {
    return e < .5 ? 1 : -1
}, Oscillator.Saw = function(e) {
    return 2 * (e - Math.round(e))
}, Oscillator.Triangle = function(e) {
    return 1 - 4 * Math.abs(Math.round(e) - e)
}, Oscillator.Pulse = function(e) {
}, ADSR.prototype.noteOn = function() {
    this.samplesProcessed = 0, this.sustainSamples = this.sustainLength * this.sampleRate, this.update()
}, ADSR.prototype.noteOff = function() {
    this.sustainSamples = this.samplesProcessed - this.decaySamples, this.update()
}, ADSR.prototype.processSample = function(e) {
    var t = 0;
    return this.samplesProcessed <= this.attack ? t = 0 + 1 * ((this.samplesProcessed - 0) / (this.attack - 0)) : this.samplesProcessed > this.attack && this.samplesProcessed <= this.decay ? t = 1 + (this.sustainLevel - 1) * ((this.samplesProcessed - this.attack) / (this.decay - this.attack)) : this.samplesProcessed > this.decay && this.samplesProcessed <= this.sustain ? t = this.sustainLevel : this.samplesProcessed > this.sustain && this.samplesProcessed <= this.release && (t = this.sustainLevel + (0 - this.sustainLevel) * ((this.samplesProcessed - this.sustain) / (this.release - this.sustain))), e * t
}, ADSR.prototype.value = function() {
    var e = 0;
    return this.samplesProcessed <= this.attack ? e = 0 + 1 * ((this.samplesProcessed - 0) / (this.attack - 0)) : this.samplesProcessed > this.attack && this.samplesProcessed <= this.decay ? e = 1 + (this.sustainLevel - 1) * ((this.samplesProcessed - this.attack) / (this.decay - this.attack)) : this.samplesProcessed > this.decay && this.samplesProcessed <= this.sustain ? e = this.sustainLevel : this.samplesProcessed > this.sustain && this.samplesProcessed <= this.release && (e = this.sustainLevel + (0 - this.sustainLevel) * ((this.samplesProcessed - this.sustain) / (this.release - this.sustain))), e
}, ADSR.prototype.process = function(e) {
    for (var t = 0; t < e.length; t++)
        e[t] *= this.value(), this.samplesProcessed++;
    return e
}, ADSR.prototype.isActive = function() {
    return this.samplesProcessed > this.release || this.samplesProcessed === -1 ? !1 : !0
}, ADSR.prototype.disable = function() {
    this.samplesProcessed = -1
}, IIRFilter.prototype.__defineGetter__("cutoff", function() {
    return this.func.cutoff
}), IIRFilter.prototype.__defineGetter__("resonance", function() {
    return this.func.resonance
}), IIRFilter.prototype.set = function(e, t) {
    this.func.calcCoeff(e, t)
}, IIRFilter.prototype.process = function(e) {
    this.func.process(e)
}, IIRFilter.prototype.addEnvelope = function(e) {
    if (!(e instanceof ADSR))
        throw"Not an envelope.";
    this.func.addEnvelope(e)
}, IIRFilter.LP12 = function(e, t, n) {
    this.sampleRate = n, this.vibraPos = 0, this.vibraSpeed = 0, this.envelope = !1, this.calcCoeff = function(e, t) {
        this.w = 2 * Math.PI * e / this.sampleRate, this.q = 1 - this.w / (2 * (t + .5 / (1 + this.w)) + this.w - 2), this.r = this.q * this.q, this.c = this.r + 1 - 2 * Math.cos(this.w) * this.q, this.cutoff = e, this.resonance = t
    }, this.calcCoeff(e, t), this.process = function(e) {
        for (var t = 0; t < e.length; t++)
            this.vibraSpeed += (e[t] - this.vibraPos) * this.c, this.vibraPos += this.vibraSpeed, this.vibraSpeed *= this.r, this.envelope ? (e[t] = e[t] * (1 - this.envelope.value()) + this.vibraPos * this.envelope.value(), this.envelope.samplesProcessed++) : e[t] = this.vibraPos
    }
}, IIRFilter.LP12.prototype.addEnvelope = function(e) {
    this.envelope = e
}, IIRFilter2.prototype.process = function(e) {
    var t, n, r = this.f;
    for (var i = 0; i < e.length; i++)
        t = e[i], r[3] = t - this.damp * r[2], r[0] = r[0] + this.freq * r[2], r[1] = r[3] - r[0], r[2] = this.freq * r[1] + r[2], n = .5 * r[this.type], r[3] = t - this.damp * r[2], r[0] = r[0] + this.freq * r[2], r[1] = r[3] - r[0], r[2] = this.freq * r[1] + r[2], n += .5 * r[this.type], this.envelope ? (e[i] = e[i] * (1 - this.envelope.value()) + n * this.envelope.value(), this.envelope.samplesProcessed++) : e[i] = n
}, IIRFilter2.prototype.addEnvelope = function(e) {
    if (!(e instanceof ADSR))
        throw"This is not an envelope.";
    this.envelope = e
}, IIRFilter2.prototype.set = function(e, t) {
    this.calcCoeff(e, t)
}, WindowFunction.prototype.process = function(e) {
    var t = e.length;
    for (var n = 0; n < t; n++)
        e[n] *= this.func(t, n, this.alpha);
    return e
}, WindowFunction.Bartlett = function(e, t) {
    return 2 / (e - 1) * ((e - 1) / 2 - Math.abs(t - (e - 1) / 2))
}, WindowFunction.BartlettHann = function(e, t) {
    return.62 - .48 * Math.abs(t / (e - 1) - .5) - .38 * Math.cos(DSP.TWO_PI * t / (e - 1))
}, WindowFunction.Blackman = function(e, t, n) {
    var r = (1 - n) / 2, i = .5, s = n / 2;
    return r - i * Math.cos(DSP.TWO_PI * t / (e - 1)) + s * Math.cos(4 * Math.PI * t / (e - 1))
}, WindowFunction.Cosine = function(e, t) {
    return Math.cos(Math.PI * t / (e - 1) - Math.PI / 2)
}, WindowFunction.Gauss = function(e, t, n) {
    return Math.pow(Math.E, -0.5 * Math.pow((t - (e - 1) / 2) / (n * (e - 1) / 2), 2))
}, WindowFunction.Hamming = function(e, t) {
    return.54 - .46 * Math.cos(DSP.TWO_PI * t / (e - 1))
}, WindowFunction.Hann = function(e, t) {
    return.5 * (1 - Math.cos(DSP.TWO_PI * t / (e - 1)))
}, WindowFunction.Lanczos = function(e, t) {
    var n = 2 * t / (e - 1) - 1;
    return Math.sin(Math.PI * n) / (Math.PI * n)
}, WindowFunction.Rectangular = function(e, t) {
    return 1
}, WindowFunction.Triangular = function(e, t) {
    return 2 / e * (e / 2 - Math.abs(t - (e - 1) / 2))
}, DSP.mag2db = function(e) {
    var t = -120, n = Math.pow(10, t / 20), r = Math.log, i = Math.max, s = Float32Array(e.length);
    for (var o = 0; o < e.length; o++)
        s[o] = 20 * r(i(e[o], n));
    return s
}, DSP.freqz = function(e, t, n) {
    var r, i;
    if (!n) {
        n = Float32Array(200);
        for (r = 0; r < n.length; r++)
            n[r] = DSP.TWO_PI / n.length * r - Math.PI
    }
    var s = Float32Array(n.length), o = Math.sqrt, u = Math.cos, a = Math.sin;
    for (r = 0; r < n.length; r++) {
        var f = {real: 0, imag: 0};
        for (i = 0; i < e.length; i++)
            f.real += e[i] * u(-i * n[r]), f.imag += e[i] * a(-i * n[r]);
        var l = {real: 0, imag: 0};
        for (i = 0; i < t.length; i++)
            l.real += t[i] * u(-i * n[r]), l.imag += t[i] * a(-i * n[r]);
        s[r] = o(f.real * f.real + f.imag * f.imag) / o(l.real * l.real + l.imag * l.imag)
    }
    return s
}, MultiDelay.prototype.setDelayInSamples = function(e) {
    this.delayInSamples = e, this.delayInputPointer = this.delayOutputPointer + e, this.delayInputPointer >= this.delayBufferSamples.length - 1 && (this.delayInputPointer = this.delayInputPointer - this.delayBufferSamples.length)
}, MultiDelay.prototype.setMasterVolume = function(e) {
    this.masterVolume = e
}, MultiDelay.prototype.setDelayVolume = function(e) {
    this.delayVolume = e
}, MultiDelay.prototype.process = function(e) {
    var t = new Float32Array(e.length);
    for (var n = 0; n < e.length; n++) {
        var r = this.delayBufferSamples[this.delayOutputPointer] === null ? 0 : this.delayBufferSamples[this.delayOutputPointer], i = r * this.delayVolume + e[n];
        this.delayBufferSamples[this.delayInputPointer] = i, t[n] = i * this.masterVolume, this.delayInputPointer++, this.delayInputPointer >= this.delayBufferSamples.length - 1 && (this.delayInputPointer = 0), this.delayOutputPointer++, this.delayOutputPointer >= this.delayBufferSamples.length - 1 && (this.delayOutputPointer = 0)
    }
    return t
}, SingleDelay.prototype.setDelayInSamples = function(e) {
    this.delayInSamples = e, this.delayInputPointer = this.delayOutputPointer + e, this.delayInputPointer >= this.delayBufferSamples.length - 1 && (this.delayInputPointer = this.delayInputPointer - this.delayBufferSamples.length)
}, SingleDelay.prototype.setDelayVolume = function(e) {
    this.delayVolume = e
}, SingleDelay.prototype.process = function(e) {
    var t = new Float32Array(e.length);
    for (var n = 0; n < e.length; n++) {
        this.delayBufferSamples[this.delayInputPointer] = e[n];
        var r = this.delayBufferSamples[this.delayOutputPointer];
        t[n] = r * this.delayVolume, this.delayInputPointer++, this.delayInputPointer >= this.delayBufferSamples.length - 1 && (this.delayInputPointer = 0), this.delayOutputPointer++, this.delayOutputPointer >= this.delayBufferSamples.length - 1 && (this.delayOutputPointer = 0)
    }
    return t
}, Reverb.prototype.setDelayInSamples = function(e) {
    this.delayInSamples = e;
    var t, n;
    for (t = 0; t < this.NR_OF_SINGLEDELAYS; t++)
        n = 1 + t / 7, this.singleDelays[t].setDelayInSamples(Math.round(this.delayInSamples * n));
    for (t = 0; t < this.NR_OF_MULTIDELAYS; t++)
        n = 1 + t / 10, this.multiDelays[t].setDelayInSamples(Math.round(this.delayInSamples * n))
}, Reverb.prototype.setMasterVolume = function(e) {
    this.masterVolume = e
}, Reverb.prototype.setMixVolume = function(e) {
    this.mixVolume = e
}, Reverb.prototype.setDelayVolume = function(e) {
    this.delayVolume = e;
    var t;
    for (t = 0; t < this.NR_OF_SINGLEDELAYS; t++)
        this.singleDelays[t].setDelayVolume(this.delayVolume);
    for (t = 0; t < this.NR_OF_MULTIDELAYS; t++)
        this.multiDelays[t].setDelayVolume(this.delayVolume)
}, Reverb.prototype.setDampFrequency = function(e) {
    this.dampFrequency = e, this.LOWPASSL.set(e, 0), this.LOWPASSR.set(e, 0)
}, Reverb.prototype.process = function(e) {
    var t = new Float32Array(e.length), n = DSP.deinterleave(e);
    this.LOWPASSL.process(n[DSP.LEFT]), this.LOWPASSR.process(n[DSP.RIGHT]);
    var r = DSP.interleave(n[DSP.LEFT], n[DSP.RIGHT]), i;
    for (i = 0; i < this.NR_OF_MULTIDELAYS; i++)
        t = DSP.mixSampleBuffers(t, this.multiDelays[i].process(r), 2 % i === 0, this.NR_OF_MULTIDELAYS);
    var s = new Float32Array(t.length);
    for (i = 0; i < this.NR_OF_SINGLEDELAYS; i++)
        s = DSP.mixSampleBuffers(s, this.singleDelays[i].process(t), 2 % i === 0, 1);
    for (i = 0; i < s.length; i++)
        s[i] *= this.mixVolume;
    t = DSP.mixSampleBuffers(s, e, 0, 1);
    for (i = 0; i < t.length; i++)
        t[i] *= this.masterVolume;
    return t
}, define("dsp", function(e) {
    return function() {
        var t, n;
        return n = function() {
            return{DSP: DSP, FFT: FFT, WindowFunction: WindowFunction}
        }, t = n.apply(e, arguments), t || e.dsp
    }
}(this)), define("tools", ["jquery"], function(e) {
    function t() {
        console.log(Array.prototype.slice.call(arguments).join(" "))
    }
    function n(e, t) {
        for (var n in t)
            e[n] = t[n];
        return e
    }
    function r(e) {
        var t = Math.floor(e / 3600), n = Math.floor((e - t * 3600) / 60), e = (Math.floor((e - t * 3600 - n * 60) * 100) / 100).toFixed(2), r = "";
        t != 0 && (r = t + ":");
        if (n != 0 || r !== "")
            n = n < 10 && r !== "" ? "0" + n : String(n), r += n + ":";
        return r === "" ? r = e : r += e < 10 ? "0" + e : String(e), r
    }
    function i(e, n) {
        if (e.complete)
            t(n, "Done.");
        else {
            var r = 0, i = 0;
            e.total_stages > 0 && (r = 1 / e.total_stages, i = (e.current_stage - 1) / e.total_stages);
            var s = parseInt(e.current_window / e.total_windows * 100);
            if (this.last_pct != s && s % 10 == 0) {
                var o = i * 100 + r * s;
                e.total_stages == 0 ? (t(n, "Progress:", e.current_window, "/", e.total_windows, "(" + s + "%)"), this.last_pct = s) : (t(n, "Stage:", e.current_stage, "/", e.total_stages, "Progress:", e.current_window, "/", e.total_windows, "(" + o + "%)"), this.last_pct = s)
            }
        }
    }
    function s(e, t, n) {
        var r = new Number((e.length - 1) / (n - 1));
        t[0] = e[0];
        for (var s = 1; s < n - 1; s++) {
            var o = s * r, u = Math.floor(o), a = Math.ceil(o), f = o - u;
            t[s] = e[u] + (e[a] - e[u]) * f, i({current_stage: 1, total_stages: 0, current_window: s, total_windows: n - 1}, "Interpolating: ")
        }
        return i({complete: !0}, "Interpolating: "), t[n - 1] = e[e.length - 1], t
    }
    return{onProgress: i, merge: n, prettyTime: r, interpolateArray: s}
}), define("stretch", ["dsp", "tools"], function(e, t) {
    var n = function() {
        function o() {
            n && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        function u(e) {
            this.init(e)
        }
        function a(e, n) {
            n || (n = ""), t.onProgress(e, n)
        }
        function f(e, t) {
            return Math.atan2(e.imag[t], e.real[t])
        }
        var n = !0, r = e.DSP, i = e.FFT, s = e.WindowFunction;
        return u.prototype = {init: function(e) {
                return this.options = {vocode: !1, stftBins: 8192, stftHop: .25, stretchFactor: 1.5, sampleRate: 44100, progressCallback: a}, t.merge(this.options, e), this.stretched_buffer = null, this.resampled_buffer = null, this
            }, setBuffer: function(e, t) {
                return this.buffer = e, this.stretched_buffer = null, this.resampled_buffer = null, t && (this.options.sampleRate = t), this
            }, getBuffer: function() {
                return this.buffer
            }, getStretchFactor: function() {
                return this.options.stretchFactor
            }, getStretchedBuffer: function() {
                return this.stretched_buffer
            }, getPitchShiftedBuffer: function() {
                return this.resampled_buffer
            }, getOptions: function() {
                return this.options
            }, stretch: function() {
                function t(t, n, r, i) {
                    e.options.progressCallback({current_stage: t, total_stages: 2, current_window: n, total_windows: r, complete: i == 1}, "Time Stretching: ")
                }
                if (!this.buffer)
                    throw"Error: TimeStretcher.setBuffer() must be called before stretch()";
                if (this.stretched_buffer)
                    return this.stretched_buffer;
                var e = this, n = this.options.stftBins, u = this.options.vocode, a = parseInt(n * this.options.stftHop), l = parseInt(a * this.options.stretchFactor), c = this.options.sampleRate, h = this.buffer, p = 1 / c, d = h.length, v = new s(r.HANN), m = this.options.stretchFactor;
                o("Starting time stretch (" + m + "x). Buffer size: " + d);
                var g = 0, y = [];
                for (var b = 0; b < d - n; b += a) {
                    var w = new Float32Array(n);
                    w.set(h.subarray(b, b + n));
                    if (w.length < n)
                        break;
                    if (u) {
                        var E = new i(n, c);
                        E.forward(v.process(w)), y.push(E);
                        var S = E;
                        g++;
                        if (g > 1) {
                            var x = y[g - 2];
                            for (var T = 0; T < n; ++T) {
                                var N = f(S, T) - f(x, T), C = N / (a / c) - E.getBandFrequency(T), k = (C + Math.PI) % (2 * Math.PI) - Math.PI, A = E.getBandFrequency(T) + k, O = f(x, T) + l / c * A, M = Math.sqrt(S.real[T] * S.real[T] + S.imag[T] * S.imag[T]);
                                S.real[T] = M * Math.cos(O), S.imag[T] = M * Math.sin(O)
                            }
                        }
                    } else
                        y.push(v.process(w)), g++;
                    t(1, g, parseInt((d - n) / a))
                }
                o("Analysis complete: " + g + " frames.");
                var _ = new Float32Array(parseInt(d * m)), D = 0, P = 0;
                for (var H = 0; H < y.length; ++H) {
                    var E = y[H], B = u ? v.process(E.inverse()) : E;
                    for (var j = 0; j < B.length; ++j)
                        _[D + j] += B[j];
                    P += B.length, D += l, t(2, H + 1, y.length)
                }
                return t(2, y.length, y.length, !0), this.stretched_buffer = _, this
            }, resize: function(e) {
                var n = this.stretched_buffer, r = new Float32Array(e);
                return this.resampled_buffer = t.interpolateArray(n, r, e), this
            }}, u
    }();
    return{TimeStretcher: n}
}), define("graph", ["jquery", "dsp", "tools"], function(e, t, n) {
    var r = t.DSP, i = t.FFT, s = t.WindowFunction, o = function() {
        function t() {
            e && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        function i(e, t) {
            this.init(e, t)
        }
        var e = !0;
        return hanning = new s(r.HANN), i.calculatePeaks = function(e) {
            var t = 0, n = 0;
            for (var r = 0; r < e.length; ++r) {
                var i = e[r];
                i > 0 && i > t && (t = i), i < 0 && i < n && (n = i)
            }
            return[n, t]
        }, i.prototype = {init: function(e, t) {
                this.options = {fftSize: 256, frameSize: 8192, sampleRate: 44100}, this.buffers = e, n.merge(this.options, t)
            }, getSampleNumber: function(e) {
                return parseInt(e * this.options.sampleRate)
            }, getBuffer: function(e, n, r) {
                if (!n)
                    return this.buffers[e];
                var i = this.buffers[e].length, s = this.getSampleNumber(n), o = r > 0 ? this.getSampleNumber(r) : i - s;
                return t("getBuffer: ", s, o), this.buffers[e].subarray(s, s + o)
            }, getNumFrames: function(e) {
                return Math.ceil(buffers[e].length / frameSize)
            }, getNumChannels: function() {
                return this.buffers.length
            }, getFrameBuffer: function(e, t) {
                return this.buffers[e].subarray(t * frameSize, t * frameSize + frameSize)
            }, getLengthSeconds: function() {
                return this.buffers[0].length / this.options.sampleRate
            }, plot: function(e, t, r, s, o, u) {
                var a = this.getBuffer(s, o, u), f = i.calculatePeaks(a), l = r, c = l / 2, h = 0;
                for (var p = 0; p < a.length; p += parseInt(a.length / t) * 2) {
                    n.onProgress({total_stages: 0, current_window: p, total_windows: a.length}, "Plot: ");
                    var d = a[p];
                    d > 0 ? e.fillRect(h, c, 2, d / f[1] * c) : d < 0 && e.fillRect(h, c, 2, d / f[0] * -c), h += 2
                }
                return n.onProgress({complete: !0}, "Plot: "), this
            }}, i
    }(), u = function() {
        function i() {
            t && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        function o(e, t, n) {
            this.init(e, n)
        }
        var t = !0;
        return hanning = new s(r.HANN), o.prototype = {init: function(e, t) {
                return this.options = {num_bins: 128, sampleRate: 44100, start_s: 0, length_s: -1, width: 700, height: 128}, n.merge(this.options, t), this.spectrum = null, this.elem = e, this.mousedown = !1, this.selected = !1, this.selection_start = 0, this.selection_end = 0, this
            }, getSelection: function(e) {
                return[this.selection_start, this.selection_end]
            }, setSpectrum: function(e) {
                return this.spectrum = e, this.mousedown = !1, this.selected = !1, this.selection_start = 0, this.selection_end = 0, this.updateMarkers(), this
            }, setCursor: function(e) {
                var t = this.ctx_play_cursor.canvas.getBoundingClientRect(), n = this.spectrum ? this.spectrum.getLengthSeconds() : 0, r = e / n * this.options.width;
                this.ctx_play_cursor.clearRect(0, 0, this.options.width, this.options.height), this.ctx_play_cursor.fillRect(r, 0, 2, this.options.height)
            }, updateCursor: function(e) {
                var t = this.ctx_cursor.canvas.getBoundingClientRect(), r = e.clientX - t.left, i = e.clientY - t.top;
                this.ctx_cursor.clearRect(0, 0, this.options.width, this.options.height), this.ctx_cursor.fillRect(r, 0, 2, this.options.height), this.spectrum && this.$current_seconds.text(n.prettyTime(r / this.options.width * this.spectrum.getLengthSeconds()))
            }, onMouseMove: function(e) {
                if (this.mousedown && this.spectrum) {
                    var t = this.ctx_top.canvas.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top;
                    this.ctx_top.clearRect(0, 0, this.options.width, this.options.height), this.ctx_top.fillRect(this.selected_x, 0, n - this.selected_x, this.options.height), this.selected = !0
                }
            }, onMouseDown: function(e) {
                var t = this.ctx_top.canvas.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top;
                n < 0 && (n = 0), n > this.options.width && (n = this.options.width), this.mousedown = !0, this.selected_x = n, this.selected = !1, this.ctx_top.clearRect(0, 0, this.options.width, this.options.height)
            }, onMouseUp: function(e) {
                var t = this.ctx_top.canvas.getBoundingClientRect(), r = e.clientX - t.left, i = e.clientY - t.top;
                r < 0 && (r = 0), r > this.options.width && (r = this.options.width);
                if (this.selected) {
                    this.selected = !1, this.selection = [this.selected_x, r];
                    var s = this.spectrum.getLengthSeconds(), o = this.selected_x / this.options.width * s, u = r / this.options.width * s;
                    o > u ? (this.selection_end = o, this.selection_start = u) : (this.selection_end = u, this.selection_start = o), this.$selected_seconds.text("(" + n.prettyTime(this.selection_end - this.selection_start) + ")")
                } else
                    this.mousedown && (this.$selected_seconds.text(""), this.selection_start = 0, this.selection_end = 0);
                this.mousedown = !1
            }, drawMarkers: function() {
                var e = this.options.height / 2;
                this.ctx_marker.clearRect(0, 0, this.options.width, this.options.height), this.ctx_marker.fillRect(0, e, this.options.width, 1), this.ctx_marker.fillRect(0, this.options.height - 1, this.options.width, 1);
                var t = 0;
                for (var n = 0; n < this.options.width; n += this.options.width / 100) {
                    var r = t++ % 10 == 0 ? -10 : -5;
                    this.ctx_marker.fillRect(n, this.options.height, 1, r)
                }
                this.ctx_marker.fillRect(0, this.options.height, 1, -10), this.ctx_marker.fillRect(this.options.width - 1, this.options.height, 1, -10)
            }, updateMarkers: function() {
                var e = this.options.height / 2;
                this.drawMarkers(), this.spectrum
            }, create: function() {
                e(this.elem).css("position", "relative"), e(this.elem).css("text-align", "center");
                var t = e("<canvas/>").width(this.options.width).height(this.options.height).attr("width", this.options.width).attr("height", this.options.height).css("position", "absolute").css("left", "0").css("top", "0").css("z-index", "0"), n = e("<canvas/>").width(this.options.width).height(this.options.height).attr("width", this.options.width).attr("height", this.options.height).css("position", "absolute").css("left", "0").css("top", "0").css("z-index", "2"), r = e("<canvas/>").width(this.options.width).height(this.options.height).attr("width", this.options.width).attr("height", this.options.height).css("position", "absolute").css("left", "0").css("top", "0").css("z-index", "10"), i = e("<canvas/>").width(this.options.width).height(this.options.height).attr("width", this.options.width).attr("height", this.options.height).css("position", "absolute").css("left", "0").css("top", "0").css("z-index", "1"), s = e("<canvas/>").width(this.options.width).height(this.options.height).attr("width", this.options.width).attr("height", this.options.height).css("position", "absolute").css("left", "0").css("top", "0").css("z-index", "1");
                e(this.elem).append(t), e(this.elem).append(n), e(this.elem).append(r), e(this.elem).append(i), e(this.elem).append(s), e(this.elem).append(e("<div/>").width(this.options.width).height(this.options.height)), this.$current_seconds = e("<span/>").css("color", "green"), this.$total_seconds = e("<span/>").css("padding-left", "10px"), this.$selected_seconds = e("<span/>").css("padding-left", "10px").css("color", "blue"), e(this.elem).append(e("<div/>").append(this.$current_seconds).append(this.$selected_seconds).append(this.$total_seconds)), this.ctx_spectrum = t.get(0).getContext("2d"), this.ctx_spectrum.fillStyle = "rgb(200,90,90)", this.ctx_spectrum.strokeWidth = 0, this.ctx_top = r.get(0).getContext("2d"), this.ctx_top.fillStyle = "rgba(150,150,255,0.40)", this.ctx_top.strokeWidth = 0, this.ctx_cursor = i.get(0).getContext("2d"), this.ctx_cursor.fillStyle = "rgba(60,60,90,0.80)", this.ctx_cursor.strokeWidth = 0, this.ctx_marker = n.get(0).getContext("2d"), this.ctx_marker.fillStyle = "rgb(20,20,120)", this.ctx_marker.font = "12px Arial", this.ctx_marker.strokeWidth = 0, this.ctx_play_cursor = s.get(0).getContext("2d"), this.ctx_play_cursor.fillStyle = "rgba(180,40,40,0.70)", this.ctx_play_cursor.strokeWidth = 0, this.drawMarkers(), this.updateMarkers();
                var o = this;
                return r.on("mousedown", function(e) {
                    o.onMouseDown(e)
                }), r.mousemove(function(e) {
                    o.updateCursor(e)
                }), e(window).on("mousemove", function(e) {
                    o.onMouseMove(e)
                }), e(window).on("mouseup", function(e) {
                    o.onMouseUp(e)
                }), this
            }, draw: function() {
                return this.ctx_spectrum.clearRect(0, 0, this.ctx_spectrum.canvas.width, this.ctx_spectrum.canvas.height), this.spectrum.plot(this.ctx_spectrum, this.options.width, this.options.height, 0, this.options.start_s, this.options.length_s), this
            }}, o
    }();
    return{Spectrum: o, GraphWidget: u}
}), function(e, t) {
    var n = e.document, r;
    r = function() {
        var r = {}, i = {}, s = !1, o = {ENTER: 13, ESC: 27, SPACE: 32}, u = [], a, f, l, c, h, p;
        return i = {buttons: {holder: '<nav class="alertify-buttons">{{buttons}}</nav>', submit: '<button type="submit" class="alertify-button alertify-button-ok" id="alertify-ok" />{{ok}}</button>', ok: '<a href="#" class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</a>', cancel: '<a href="#" class="alertify-button alertify-button-cancel" id="alertify-cancel">{{cancel}}</a>'}, input: '<div class="alertify-text-wrapper"><input type="text" class="alertify-text" id="alertify-text"></div>', message: '<p class="alertify-message">{{message}}</p>', log: '<article class="alertify-log{{class}}">{{message}}</article>'}, p = function() {
            var e, r = n.createElement("fakeelement"), i = {transition: "transitionend", OTransition: "otransitionend", MSTransition: "msTransitionEnd", MozTransition: "transitionend", WebkitTransition: "webkitTransitionEnd"};
            for (e in i)
                if (r.style[e] !== t)
                    return i[e]
        }, a = function(e) {
            return n.getElementById(e)
        }, r = {labels: {ok: "OK", cancel: "Cancel"}, delay: 5e3, buttonReverse: !1, transition: t, addListeners: function(r) {
                var i = a("alertify-resetFocus"), s = a("alertify-ok") || t, u = a("alertify-cancel") || t, f = a("alertify-text") || t, l = a("alertify-form") || t, c = typeof s != "undefined", h = typeof u != "undefined", p = typeof f != "undefined", d = "", v = this, m, g, y, b, w;
                m = function(e) {
                    typeof e.preventDefault != "undefined" && e.preventDefault(), y(e), typeof f != "undefined" && (d = f.value), typeof r == "function" && r(!0, d)
                }, g = function(e) {
                    typeof e.preventDefault != "undefined" && e.preventDefault(), y(e), typeof r == "function" && r(!1)
                }, y = function(e) {
                    v.hide(), v.unbind(n.body, "keyup", b), v.unbind(i, "focus", w), p && v.unbind(l, "submit", m), c && v.unbind(s, "click", m), h && v.unbind(u, "click", g)
                }, b = function(e) {
                    var t = e.keyCode;
                    t === o.SPACE && !p && m(e), t === o.ESC && h && g(e)
                }, w = function(e) {
                    p ? f.focus() : h ? u.focus() : s.focus()
                }, this.bind(i, "focus", w), c && this.bind(s, "click", m), h && this.bind(u, "click", g), this.bind(n.body, "keyup", b), p && this.bind(l, "submit", m), e.setTimeout(function() {
                    f ? (f.focus(), f.select()) : s.focus()
                }, 50)
            }, bind: function(e, t, n) {
                typeof e.addEventListener == "function" ? e.addEventListener(t, n, !1) : e.attachEvent && e.attachEvent("on" + t, n)
            }, appendButtons: function(e, t) {
                return this.buttonReverse ? t + e : e + t
            }, build: function(e) {
                var t = "", n = e.type, r = e.message, s = e.cssClass || "";
                t += '<div class="alertify-dialog">', n === "prompt" && (t += '<form id="alertify-form">'), t += '<article class="alertify-inner">', t += i.message.replace("{{message}}", r), n === "prompt" && (t += i.input), t += i.buttons.holder, t += "</article>", n === "prompt" && (t += "</form>"), t += '<a id="alertify-resetFocus" class="alertify-resetFocus" href="#">Reset Focus</a>', t += "</div>";
                switch (n) {
                    case"confirm":
                        t = t.replace("{{buttons}}", this.appendButtons(i.buttons.cancel, i.buttons.ok)), t = t.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                        break;
                    case"prompt":
                        t = t.replace("{{buttons}}", this.appendButtons(i.buttons.cancel, i.buttons.submit)), t = t.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
                        break;
                    case"alert":
                        t = t.replace("{{buttons}}", i.buttons.ok), t = t.replace("{{ok}}", this.labels.ok);
                        break;
                    default:
                }
                return c.className = "alertify alertify-show alertify-" + n + " " + s, l.className = "alertify-cover", t
            }, close: function(e, t) {
                var n = t && !isNaN(t) ? +t : this.delay, r = this, i;
                this.bind(e, "click", function() {
                    h.removeChild(e)
                }), i = function(e) {
                    e.stopPropagation(), e.propertyName === "opacity" && h.removeChild(this)
                };
                if (t === 0)
                    return;
                setTimeout(function() {
                    typeof e != "undefined" && e.parentNode === h && (typeof r.transition != "undefined" ? (r.bind(e, r.transition, i), e.className += " alertify-log-hide") : h.removeChild(e))
                }, n)
            }, dialog: function(e, t, r, i, o) {
                f = n.activeElement;
                var a = function() {
                    if (c && c.scrollTop !== null)
                        return;
                    a()
                };
                if (typeof e != "string")
                    throw new Error("message must be a string");
                if (typeof t != "string")
                    throw new Error("type must be a string");
                if (typeof r != "undefined" && typeof r != "function")
                    throw new Error("fn must be a function");
                return typeof this.init == "function" && (this.init(), a()), u.push({type: t, message: e, callback: r, placeholder: i, cssClass: o}), s || this.setup(), this
            }, extend: function(e) {
                if (typeof e != "string")
                    throw new Error("extend method must have exactly one paramter");
                return function(t, n) {
                    return this.log(t, e, n), this
                }
            }, hide: function() {
                u.splice(0, 1), u.length > 0 ? this.setup() : (s = !1, c.className = "alertify alertify-hide alertify-hidden", l.className = "alertify-cover alertify-hidden", f.focus())
            }, init: function() {
                n.createElement("nav"), n.createElement("article"), n.createElement("section"), l = n.createElement("div"), l.setAttribute("id", "alertify-cover"), l.className = "alertify-cover alertify-hidden", n.body.appendChild(l), c = n.createElement("section"), c.setAttribute("id", "alertify"), c.className = "alertify alertify-hidden", n.body.appendChild(c), h = n.createElement("section"), h.setAttribute("id", "alertify-logs"), h.className = "alertify-logs", n.body.appendChild(h), n.body.setAttribute("tabindex", "0"), this.transition = p(), delete this.init
            }, log: function(e, t, n) {
                var r = function() {
                    if (h && h.scrollTop !== null)
                        return;
                    r()
                };
                return typeof this.init == "function" && (this.init(), r()), this.notify(e, t, n), this
            }, notify: function(e, t, r) {
                var i = n.createElement("article");
                i.className = "alertify-log" + (typeof t == "string" && t !== "" ? " alertify-log-" + t : ""), i.innerHTML = e, h.insertBefore(i, h.firstChild), setTimeout(function() {
                    i.className = i.className + " alertify-log-show"
                }, 50), this.close(i, r)
            }, set: function(e) {
                var t;
                if (typeof e != "object" && e instanceof Array)
                    throw new Error("args must be an object");
                for (t in e)
                    e.hasOwnProperty(t) && (this[t] = e[t])
            }, setup: function() {
                var e = u[0];
                s = !0, c.innerHTML = this.build(e), typeof e.placeholder == "string" && e.placeholder !== "" && (a("alertify-text").value = e.placeholder), this.addListeners(e.callback)
            }, unbind: function(e, t, n) {
                typeof e.removeEventListener == "function" ? e.removeEventListener(t, n, !1) : e.detachEvent && e.detachEvent("on" + t, n)
            }}, {alert: function(e, t, n) {
                return r.dialog(e, "alert", t, "", n), this
            }, confirm: function(e, t, n) {
                return r.dialog(e, "confirm", t, "", n), this
            }, extend: r.extend, init: r.init, log: function(e, t, n) {
                return r.log(e, t, n), this
            }, prompt: function(e, t, n, i) {
                return r.dialog(e, "prompt", t, n, i), this
            }, success: function(e, t) {
                return r.log(e, "success", t), this
            }, error: function(e, t) {
                return r.log(e, "error", t), this
            }, set: function(e) {
                r.set(e)
            }, labels: r.labels}
    }, typeof define == "function" ? define("alertify", [], function() {
        return new r
    }) : typeof e.alertify == "undefined" && (e.alertify = new r)
}(this);
if ("undefined" == typeof jQuery)
    throw new Error("Bootstrap requires jQuery");
+function(e) {
    function t() {
        var e = document.createElement("bootstrap"), t = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd otransitionend", transition: "transitionend"};
        for (var n in t)
            if (void 0 !== e.style[n])
                return{end: t[n]};
        return!1
    }
    e.fn.emulateTransitionEnd = function(t) {
        var n = !1, r = this;
        e(this).one(e.support.transition.end, function() {
            n = !0
        });
        var i = function() {
            n || e(r).trigger(e.support.transition.end)
        };
        return setTimeout(i, t), this
    }, e(function() {
        e.support.transition = t()
    })
}(jQuery), +function(e) {
    var t = '[data-dismiss="alert"]', n = function(n) {
        e(n).on("click", t, this.close)
    };
    n.prototype.close = function(t) {
        function n() {
            s.trigger("closed.bs.alert").remove()
        }
        var r = e(this), i = r.attr("data-target");
        i || (i = r.attr("href"), i = i && i.replace(/.*(?=#[^\s]*$)/, ""));
        var s = e(i);
        t && t.preventDefault(), s.length || (s = r.hasClass("alert") ? r : r.parent()), s.trigger(t = e.Event("close.bs.alert")), t.isDefaultPrevented() || (s.removeClass("in"), e.support.transition && s.hasClass("fade") ? s.one(e.support.transition.end, n).emulateTransitionEnd(150) : n())
    };
    var r = e.fn.alert;
    e.fn.alert = function(t) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.alert");
            i || r.data("bs.alert", i = new n(this)), "string" == typeof t && i[t].call(r)
        })
    }, e.fn.alert.Constructor = n, e.fn.alert.noConflict = function() {
        return e.fn.alert = r, this
    }, e(document).on("click.bs.alert.data-api", t, n.prototype.close)
}(jQuery), +function(e) {
    var t = function(n, r) {
        this.$element = e(n), this.options = e.extend({}, t.DEFAULTS, r), this.isLoading = !1
    };
    t.DEFAULTS = {loadingText: "loading..."}, t.prototype.setState = function(t) {
        var n = "disabled", r = this.$element, i = r.is("input") ? "val" : "html", s = r.data();
        t += "Text", s.resetText || r.data("resetText", r[i]()), r[i](s[t] || this.options[t]), setTimeout(e.proxy(function() {
            "loadingText" == t ? (this.isLoading = !0, r.addClass(n).attr(n, n)) : this.isLoading && (this.isLoading = !1, r.removeClass(n).removeAttr(n))
        }, this), 0)
    }, t.prototype.toggle = function() {
        var e = !0, t = this.$element.closest('[data-toggle="buttons"]');
        if (t.length) {
            var n = this.$element.find("input");
            "radio" == n.prop("type") && (n.prop("checked") && this.$element.hasClass("active") ? e = !1 : t.find(".active").removeClass("active")), e && n.prop("checked", !this.$element.hasClass("active")).trigger("change")
        }
        e && this.$element.toggleClass("active")
    };
    var n = e.fn.button;
    e.fn.button = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.button"), s = "object" == typeof n && n;
            i || r.data("bs.button", i = new t(this, s)), "toggle" == n ? i.toggle() : n && i.setState(n)
        })
    }, e.fn.button.Constructor = t, e.fn.button.noConflict = function() {
        return e.fn.button = n, this
    }, e(document).on("click.bs.button.data-api", "[data-toggle^=button]", function(t) {
        var n = e(t.target);
        n.hasClass("btn") || (n = n.closest(".btn")), n.button("toggle"), t.preventDefault()
    })
}(jQuery), +function(e) {
    var t = function(t, n) {
        this.$element = e(t), this.$indicators = this.$element.find(".carousel-indicators"), this.options = n, this.paused = this.sliding = this.interval = this.$active = this.$items = null, "hover" == this.options.pause && this.$element.on("mouseenter", e.proxy(this.pause, this)).on("mouseleave", e.proxy(this.cycle, this))
    };
    t.DEFAULTS = {interval: 5e3, pause: "hover", wrap: !0}, t.prototype.cycle = function(t) {
        return t || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(e.proxy(this.next, this), this.options.interval)), this
    }, t.prototype.getActiveIndex = function() {
        return this.$active = this.$element.find(".item.active"), this.$items = this.$active.parent().children(), this.$items.index(this.$active)
    }, t.prototype.to = function(t) {
        var n = this, r = this.getActiveIndex();
        return t > this.$items.length - 1 || 0 > t ? void 0 : this.sliding ? this.$element.one("slid.bs.carousel", function() {
            n.to(t)
        }) : r == t ? this.pause().cycle() : this.slide(t > r ? "next" : "prev", e(this.$items[t]))
    }, t.prototype.pause = function(t) {
        return t || (this.paused = !0), this.$element.find(".next, .prev").length && e.support.transition && (this.$element.trigger(e.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
    }, t.prototype.next = function() {
        return this.sliding ? void 0 : this.slide("next")
    }, t.prototype.prev = function() {
        return this.sliding ? void 0 : this.slide("prev")
    }, t.prototype.slide = function(t, n) {
        var r = this.$element.find(".item.active"), i = n || r[t](), s = this.interval, o = "next" == t ? "left" : "right", u = "next" == t ? "first" : "last", f = this;
        if (!i.length) {
            if (!this.options.wrap)
                return;
            i = this.$element.find(".item")[u]()
        }
        if (i.hasClass("active"))
            return this.sliding = !1;
        var l = e.Event("slide.bs.carousel", {relatedTarget: i[0], direction: o});
        return this.$element.trigger(l), l.isDefaultPrevented() ? void 0 : (this.sliding = !0, s && this.pause(), this.$indicators.length && (this.$indicators.find(".active").removeClass("active"), this.$element.one("slid.bs.carousel", function() {
            var t = e(f.$indicators.children()[f.getActiveIndex()]);
            t && t.addClass("active")
        })), e.support.transition && this.$element.hasClass("slide") ? (i.addClass(t), i[0].offsetWidth, r.addClass(o), i.addClass(o), r.one(e.support.transition.end, function() {
            i.removeClass([t, o].join(" ")).addClass("active"), r.removeClass(["active", o].join(" ")), f.sliding = !1, setTimeout(function() {
                f.$element.trigger("slid.bs.carousel")
            }, 0)
        }).emulateTransitionEnd(1e3 * r.css("transition-duration").slice(0, -1))) : (r.removeClass("active"), i.addClass("active"), this.sliding = !1, this.$element.trigger("slid.bs.carousel")), s && this.cycle(), this)
    };
    var n = e.fn.carousel;
    e.fn.carousel = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.carousel"), s = e.extend({}, t.DEFAULTS, r.data(), "object" == typeof n && n), o = "string" == typeof n ? n : s.slide;
            i || r.data("bs.carousel", i = new t(this, s)), "number" == typeof n ? i.to(n) : o ? i[o]() : s.interval && i.pause().cycle()
        })
    }, e.fn.carousel.Constructor = t, e.fn.carousel.noConflict = function() {
        return e.fn.carousel = n, this
    }, e(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function(t) {
        var n, r = e(this), i = e(r.attr("data-target") || (n = r.attr("href")) && n.replace(/.*(?=#[^\s]+$)/, "")), s = e.extend({}, i.data(), r.data()), o = r.attr("data-slide-to");
        o && (s.interval = !1), i.carousel(s), (o = r.attr("data-slide-to")) && i.data("bs.carousel").to(o), t.preventDefault()
    }), e(window).on("load", function() {
        e('[data-ride="carousel"]').each(function() {
            var t = e(this);
            t.carousel(t.data())
        })
    })
}(jQuery), +function(e) {
    var t = function(n, r) {
        this.$element = e(n), this.options = e.extend({}, t.DEFAULTS, r), this.transitioning = null, this.options.parent && (this.$parent = e(this.options.parent)), this.options.toggle && this.toggle()
    };
    t.DEFAULTS = {toggle: !0}, t.prototype.dimension = function() {
        var e = this.$element.hasClass("width");
        return e ? "width" : "height"
    }, t.prototype.show = function() {
        if (!this.transitioning && !this.$element.hasClass("in")) {
            var t = e.Event("show.bs.collapse");
            if (this.$element.trigger(t), !t.isDefaultPrevented()) {
                var n = this.$parent && this.$parent.find("> .panel > .in");
                if (n && n.length) {
                    var r = n.data("bs.collapse");
                    if (r && r.transitioning)
                        return;
                    n.collapse("hide"), r || n.data("bs.collapse", null)
                }
                var i = this.dimension();
                this.$element.removeClass("collapse").addClass("collapsing")[i](0), this.transitioning = 1;
                var s = function() {
                    this.$element.removeClass("collapsing").addClass("collapse in")[i]("auto"), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
                };
                if (!e.support.transition)
                    return s.call(this);
                var o = e.camelCase(["scroll", i].join("-"));
                this.$element.one(e.support.transition.end, e.proxy(s, this)).emulateTransitionEnd(350)[i](this.$element[0][o])
            }
        }
    }, t.prototype.hide = function() {
        if (!this.transitioning && this.$element.hasClass("in")) {
            var t = e.Event("hide.bs.collapse");
            if (this.$element.trigger(t), !t.isDefaultPrevented()) {
                var n = this.dimension();
                this.$element[n](this.$element[n]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"), this.transitioning = 1;
                var r = function() {
                    this.transitioning = 0, this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")
                };
                return e.support.transition ? void this.$element[n](0).one(e.support.transition.end, e.proxy(r, this)).emulateTransitionEnd(350) : r.call(this)
            }
        }
    }, t.prototype.toggle = function() {
        this[this.$element.hasClass("in") ? "hide" : "show"]()
    };
    var n = e.fn.collapse;
    e.fn.collapse = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.collapse"), s = e.extend({}, t.DEFAULTS, r.data(), "object" == typeof n && n);
            !i && s.toggle && "show" == n && (n = !n), i || r.data("bs.collapse", i = new t(this, s)), "string" == typeof n && i[n]()
        })
    }, e.fn.collapse.Constructor = t, e.fn.collapse.noConflict = function() {
        return e.fn.collapse = n, this
    }, e(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function(t) {
        var n, r = e(this), i = r.attr("data-target") || t.preventDefault() || (n = r.attr("href")) && n.replace(/.*(?=#[^\s]+$)/, ""), s = e(i), o = s.data("bs.collapse"), u = o ? "toggle" : r.data(), f = r.attr("data-parent"), l = f && e(f);
        o && o.transitioning || (l && l.find('[data-toggle=collapse][data-parent="' + f + '"]').not(r).addClass("collapsed"), r[s.hasClass("in") ? "addClass" : "removeClass"]("collapsed")), s.collapse(u)
    })
}(jQuery), +function(e) {
    function t(t) {
        e(r).remove(), e(i).each(function() {
            var r = n(e(this)), i = {relatedTarget: this};
            r.hasClass("open") && (r.trigger(t = e.Event("hide.bs.dropdown", i)), t.isDefaultPrevented() || r.removeClass("open").trigger("hidden.bs.dropdown", i))
        })
    }
    function n(t) {
        var n = t.attr("data-target");
        n || (n = t.attr("href"), n = n && /#[A-Za-z]/.test(n) && n.replace(/.*(?=#[^\s]*$)/, ""));
        var r = n && e(n);
        return r && r.length ? r : t.parent()
    }
    var r = ".dropdown-backdrop", i = "[data-toggle=dropdown]", s = function(t) {
        e(t).on("click.bs.dropdown", this.toggle)
    };
    s.prototype.toggle = function(r) {
        var i = e(this);
        if (!i.is(".disabled, :disabled")) {
            var s = n(i), o = s.hasClass("open");
            if (t(), !o) {
                "ontouchstart"in document.documentElement && !s.closest(".navbar-nav").length && e('<div class="dropdown-backdrop"/>').insertAfter(e(this)).on("click", t);
                var u = {relatedTarget: this};
                if (s.trigger(r = e.Event("show.bs.dropdown", u)), r.isDefaultPrevented())
                    return;
                s.toggleClass("open").trigger("shown.bs.dropdown", u), i.focus()
            }
            return!1
        }
    }, s.prototype.keydown = function(t) {
        if (/(38|40|27)/.test(t.keyCode)) {
            var r = e(this);
            if (t.preventDefault(), t.stopPropagation(), !r.is(".disabled, :disabled")) {
                var s = n(r), o = s.hasClass("open");
                if (!o || o && 27 == t.keyCode)
                    return 27 == t.which && s.find(i).focus(), r.click();
                var u = " li:not(.divider):visible a", f = s.find("[role=menu]" + u + ", [role=listbox]" + u);
                if (f.length) {
                    var l = f.index(f.filter(":focus"));
                    38 == t.keyCode && l > 0 && l--, 40 == t.keyCode && l < f.length - 1 && l++, ~l || (l = 0), f.eq(l).focus()
                }
            }
        }
    };
    var o = e.fn.dropdown;
    e.fn.dropdown = function(t) {
        return this.each(function() {
            var n = e(this), r = n.data("bs.dropdown");
            r || n.data("bs.dropdown", r = new s(this)), "string" == typeof t && r[t].call(n)
        })
    }, e.fn.dropdown.Constructor = s, e.fn.dropdown.noConflict = function() {
        return e.fn.dropdown = o, this
    }, e(document).on("click.bs.dropdown.data-api", t).on("click.bs.dropdown.data-api", ".dropdown form", function(e) {
        e.stopPropagation()
    }).on("click.bs.dropdown.data-api", i, s.prototype.toggle).on("keydown.bs.dropdown.data-api", i + ", [role=menu], [role=listbox]", s.prototype.keydown)
}(jQuery), +function(e) {
    var t = function(t, n) {
        this.options = n, this.$element = e(t), this.$backdrop = this.isShown = null, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, e.proxy(function() {
            this.$element.trigger("loaded.bs.modal")
        }, this))
    };
    t.DEFAULTS = {backdrop: !0, keyboard: !0, show: !0}, t.prototype.toggle = function(e) {
        return this[this.isShown ? "hide" : "show"](e)
    }, t.prototype.show = function(t) {
        var n = this, r = e.Event("show.bs.modal", {relatedTarget: t});
        this.$element.trigger(r), this.isShown || r.isDefaultPrevented() || (this.isShown = !0, this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', e.proxy(this.hide, this)), this.backdrop(function() {
            var r = e.support.transition && n.$element.hasClass("fade");
            n.$element.parent().length || n.$element.appendTo(document.body), n.$element.show().scrollTop(0), r && n.$element[0].offsetWidth, n.$element.addClass("in").attr("aria-hidden", !1), n.enforceFocus();
            var i = e.Event("shown.bs.modal", {relatedTarget: t});
            r ? n.$element.find(".modal-dialog").one(e.support.transition.end, function() {
                n.$element.focus().trigger(i)
            }).emulateTransitionEnd(300) : n.$element.focus().trigger(i)
        }))
    }, t.prototype.hide = function(t) {
        t && t.preventDefault(), t = e.Event("hide.bs.modal"), this.$element.trigger(t), this.isShown && !t.isDefaultPrevented() && (this.isShown = !1, this.escape(), e(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), e.support.transition && this.$element.hasClass("fade") ? this.$element.one(e.support.transition.end, e.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal())
    }, t.prototype.enforceFocus = function() {
        e(document).off("focusin.bs.modal").on("focusin.bs.modal", e.proxy(function(e) {
            this.$element[0] === e.target || this.$element.has(e.target).length || this.$element.focus()
        }, this))
    }, t.prototype.escape = function() {
        this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", e.proxy(function(e) {
            27 == e.which && this.hide()
        }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal")
    }, t.prototype.hideModal = function() {
        var e = this;
        this.$element.hide(), this.backdrop(function() {
            e.removeBackdrop(), e.$element.trigger("hidden.bs.modal")
        })
    }, t.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
    }, t.prototype.backdrop = function(t) {
        var n = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var r = e.support.transition && n;
            if (this.$backdrop = e('<div class="modal-backdrop ' + n + '" />').appendTo(document.body), this.$element.on("click.dismiss.bs.modal", e.proxy(function(e) {
                e.target === e.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this))
            }, this)), r && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !t)
                return;
            r ? this.$backdrop.one(e.support.transition.end, t).emulateTransitionEnd(150) : t()
        } else
            !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), e.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(e.support.transition.end, t).emulateTransitionEnd(150) : t()) : t && t()
    };
    var n = e.fn.modal;
    e.fn.modal = function(n, r) {
        return this.each(function() {
            var i = e(this), s = i.data("bs.modal"), o = e.extend({}, t.DEFAULTS, i.data(), "object" == typeof n && n);
            s || i.data("bs.modal", s = new t(this, o)), "string" == typeof n ? s[n](r) : o.show && s.show(r)
        })
    }, e.fn.modal.Constructor = t, e.fn.modal.noConflict = function() {
        return e.fn.modal = n, this
    }, e(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(t) {
        var n = e(this), r = n.attr("href"), i = e(n.attr("data-target") || r && r.replace(/.*(?=#[^\s]+$)/, "")), s = i.data("bs.modal") ? "toggle" : e.extend({remote: !/#/.test(r) && r}, i.data(), n.data());
        n.is("a") && t.preventDefault(), i.modal(s, this).one("hide", function() {
            n.is(":visible") && n.focus()
        })
    }), e(document).on("show.bs.modal", ".modal", function() {
        e(document.body).addClass("modal-open")
    }).on("hidden.bs.modal", ".modal", function() {
        e(document.body).removeClass("modal-open")
    })
}(jQuery), +function(e) {
    var t = function(e, t) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, this.init("tooltip", e, t)
    };
    t.DEFAULTS = {animation: !0, placement: "top", selector: !1, template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1}, t.prototype.init = function(t, n, r) {
        this.enabled = !0, this.type = t, this.$element = e(n), this.options = this.getOptions(r);
        for (var i = this.options.trigger.split(" "), s = i.length; s--; ) {
            var o = i[s];
            if ("click" == o)
                this.$element.on("click." + this.type, this.options.selector, e.proxy(this.toggle, this));
            else if ("manual" != o) {
                var u = "hover" == o ? "mouseenter" : "focusin", f = "hover" == o ? "mouseleave" : "focusout";
                this.$element.on(u + "." + this.type, this.options.selector, e.proxy(this.enter, this)), this.$element.on(f + "." + this.type, this.options.selector, e.proxy(this.leave, this))
            }
        }
        this.options.selector ? this._options = e.extend({}, this.options, {trigger: "manual", selector: ""}) : this.fixTitle()
    }, t.prototype.getDefaults = function() {
        return t.DEFAULTS
    }, t.prototype.getOptions = function(t) {
        return t = e.extend({}, this.getDefaults(), this.$element.data(), t), t.delay && "number" == typeof t.delay && (t.delay = {show: t.delay, hide: t.delay}), t
    }, t.prototype.getDelegateOptions = function() {
        var t = {}, n = this.getDefaults();
        return this._options && e.each(this._options, function(e, r) {
            n[e] != r && (t[e] = r)
        }), t
    }, t.prototype.enter = function(t) {
        var n = t instanceof this.constructor ? t : e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(n.timeout), n.hoverState = "in", n.options.delay && n.options.delay.show ? void (n.timeout = setTimeout(function() {
            "in" == n.hoverState && n.show()
        }, n.options.delay.show)) : n.show()
    }, t.prototype.leave = function(t) {
        var n = t instanceof this.constructor ? t : e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(n.timeout), n.hoverState = "out", n.options.delay && n.options.delay.hide ? void (n.timeout = setTimeout(function() {
            "out" == n.hoverState && n.hide()
        }, n.options.delay.hide)) : n.hide()
    }, t.prototype.show = function() {
        var t = e.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            if (this.$element.trigger(t), t.isDefaultPrevented())
                return;
            var n = this, r = this.tip();
            this.setContent(), this.options.animation && r.addClass("fade");
            var i = "function" == typeof this.options.placement ? this.options.placement.call(this, r[0], this.$element[0]) : this.options.placement, s = /\s?auto?\s?/i, o = s.test(i);
            o && (i = i.replace(s, "") || "top"), r.detach().css({top: 0, left: 0, display: "block"}).addClass(i), this.options.container ? r.appendTo(this.options.container) : r.insertAfter(this.$element);
            var u = this.getPosition(), f = r[0].offsetWidth, l = r[0].offsetHeight;
            if (o) {
                var c = this.$element.parent(), h = i, p = document.documentElement.scrollTop || document.body.scrollTop, d = "body" == this.options.container ? window.innerWidth : c.outerWidth(), v = "body" == this.options.container ? window.innerHeight : c.outerHeight(), m = "body" == this.options.container ? 0 : c.offset().left;
                i = "bottom" == i && u.top + u.height + l - p > v ? "top" : "top" == i && u.top - p - l < 0 ? "bottom" : "right" == i && u.right + f > d ? "left" : "left" == i && u.left - f < m ? "right" : i, r.removeClass(h).addClass(i)
            }
            var g = this.getCalculatedOffset(i, u, f, l);
            this.applyPlacement(g, i), this.hoverState = null;
            var y = function() {
                n.$element.trigger("shown.bs." + n.type)
            };
            e.support.transition && this.$tip.hasClass("fade") ? r.one(e.support.transition.end, y).emulateTransitionEnd(150) : y()
        }
    }, t.prototype.applyPlacement = function(t, n) {
        var r, i = this.tip(), s = i[0].offsetWidth, o = i[0].offsetHeight, u = parseInt(i.css("margin-top"), 10), f = parseInt(i.css("margin-left"), 10);
        isNaN(u) && (u = 0), isNaN(f) && (f = 0), t.top = t.top + u, t.left = t.left + f, e.offset.setOffset(i[0], e.extend({using: function(e) {
                i.css({top: Math.round(e.top), left: Math.round(e.left)})
            }}, t), 0), i.addClass("in");
        var l = i[0].offsetWidth, c = i[0].offsetHeight;
        if ("top" == n && c != o && (r = !0, t.top = t.top + o - c), /bottom|top/.test(n)) {
            var h = 0;
            t.left < 0 && (h = -2 * t.left, t.left = 0, i.offset(t), l = i[0].offsetWidth, c = i[0].offsetHeight), this.replaceArrow(h - s + l, l, "left")
        } else
            this.replaceArrow(c - o, c, "top");
        r && i.offset(t)
    }, t.prototype.replaceArrow = function(e, t, n) {
        this.arrow().css(n, e ? 50 * (1 - e / t) + "%" : "")
    }, t.prototype.setContent = function() {
        var e = this.tip(), t = this.getTitle();
        e.find(".tooltip-inner")[this.options.html ? "html" : "text"](t), e.removeClass("fade in top bottom left right")
    }, t.prototype.hide = function() {
        function t() {
            "in" != n.hoverState && r.detach(), n.$element.trigger("hidden.bs." + n.type)
        }
        var n = this, r = this.tip(), i = e.Event("hide.bs." + this.type);
        return this.$element.trigger(i), i.isDefaultPrevented() ? void 0 : (r.removeClass("in"), e.support.transition && this.$tip.hasClass("fade") ? r.one(e.support.transition.end, t).emulateTransitionEnd(150) : t(), this.hoverState = null, this)
    }, t.prototype.fixTitle = function() {
        var e = this.$element;
        (e.attr("title") || "string" != typeof e.attr("data-original-title")) && e.attr("data-original-title", e.attr("title") || "").attr("title", "")
    }, t.prototype.hasContent = function() {
        return this.getTitle()
    }, t.prototype.getPosition = function() {
        var t = this.$element[0];
        return e.extend({}, "function" == typeof t.getBoundingClientRect ? t.getBoundingClientRect() : {width: t.offsetWidth, height: t.offsetHeight}, this.$element.offset())
    }, t.prototype.getCalculatedOffset = function(e, t, n, r) {
        return"bottom" == e ? {top: t.top + t.height, left: t.left + t.width / 2 - n / 2} : "top" == e ? {top: t.top - r, left: t.left + t.width / 2 - n / 2} : "left" == e ? {top: t.top + t.height / 2 - r / 2, left: t.left - n} : {top: t.top + t.height / 2 - r / 2, left: t.left + t.width}
    }, t.prototype.getTitle = function() {
        var e, t = this.$element, n = this.options;
        return e = t.attr("data-original-title") || ("function" == typeof n.title ? n.title.call(t[0]) : n.title)
    }, t.prototype.tip = function() {
        return this.$tip = this.$tip || e(this.options.template)
    }, t.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }, t.prototype.validate = function() {
        this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null)
    }, t.prototype.enable = function() {
        this.enabled = !0
    }, t.prototype.disable = function() {
        this.enabled = !1
    }, t.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled
    }, t.prototype.toggle = function(t) {
        var n = t ? e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        n.tip().hasClass("in") ? n.leave(n) : n.enter(n)
    }, t.prototype.destroy = function() {
        clearTimeout(this.timeout), this.hide().$element.off("." + this.type).removeData("bs." + this.type)
    };
    var n = e.fn.tooltip;
    e.fn.tooltip = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.tooltip"), s = "object" == typeof n && n;
            (i || "destroy" != n) && (i || r.data("bs.tooltip", i = new t(this, s)), "string" == typeof n && i[n]())
        })
    }, e.fn.tooltip.Constructor = t, e.fn.tooltip.noConflict = function() {
        return e.fn.tooltip = n, this
    }
}(jQuery), +function(e) {
    var t = function(e, t) {
        this.init("popover", e, t)
    };
    if (!e.fn.tooltip)
        throw new Error("Popover requires tooltip.js");
    t.DEFAULTS = e.extend({}, e.fn.tooltip.Constructor.DEFAULTS, {placement: "right", trigger: "click", content: "", template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}), t.prototype = e.extend({}, e.fn.tooltip.Constructor.prototype), t.prototype.constructor = t, t.prototype.getDefaults = function() {
        return t.DEFAULTS
    }, t.prototype.setContent = function() {
        var e = this.tip(), t = this.getTitle(), n = this.getContent();
        e.find(".popover-title")[this.options.html ? "html" : "text"](t), e.find(".popover-content")[this.options.html ? "string" == typeof n ? "html" : "append" : "text"](n), e.removeClass("fade top bottom left right in"), e.find(".popover-title").html() || e.find(".popover-title").hide()
    }, t.prototype.hasContent = function() {
        return this.getTitle() || this.getContent()
    }, t.prototype.getContent = function() {
        var e = this.$element, t = this.options;
        return e.attr("data-content") || ("function" == typeof t.content ? t.content.call(e[0]) : t.content)
    }, t.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".arrow")
    }, t.prototype.tip = function() {
        return this.$tip || (this.$tip = e(this.options.template)), this.$tip
    };
    var n = e.fn.popover;
    e.fn.popover = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.popover"), s = "object" == typeof n && n;
            (i || "destroy" != n) && (i || r.data("bs.popover", i = new t(this, s)), "string" == typeof n && i[n]())
        })
    }, e.fn.popover.Constructor = t, e.fn.popover.noConflict = function() {
        return e.fn.popover = n, this
    }
}(jQuery), +function(e) {
    function t(n, r) {
        var i, s = e.proxy(this.process, this);
        this.$element = e(e(n).is("body") ? window : n), this.$body = e("body"), this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", s), this.options = e.extend({}, t.DEFAULTS, r), this.selector = (this.options.target || (i = e(n).attr("href")) && i.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a", this.offsets = e([]), this.targets = e([]), this.activeTarget = null, this.refresh(), this.process()
    }
    t.DEFAULTS = {offset: 10}, t.prototype.refresh = function() {
        var t = this.$element[0] == window ? "offset" : "position";
        this.offsets = e([]), this.targets = e([]);
        var n = this;
        this.$body.find(this.selector).map(function() {
            var r = e(this), i = r.data("target") || r.attr("href"), s = /^#./.test(i) && e(i);
            return s && s.length && s.is(":visible") && [[s[t]().top + (!e.isWindow(n.$scrollElement.get(0)) && n.$scrollElement.scrollTop()), i]] || null
        }).sort(function(e, t) {
            return e[0] - t[0]
        }).each(function() {
            n.offsets.push(this[0]), n.targets.push(this[1])
        })
    }, t.prototype.process = function() {
        var e, t = this.$scrollElement.scrollTop() + this.options.offset, n = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, r = n - this.$scrollElement.height(), i = this.offsets, s = this.targets, o = this.activeTarget;
        if (t >= r)
            return o != (e = s.last()[0]) && this.activate(e);
        if (o && t <= i[0])
            return o != (e = s[0]) && this.activate(e);
        for (e = i.length; e--; )
            o != s[e] && t >= i[e] && (!i[e + 1] || t <= i[e + 1]) && this.activate(s[e])
    }, t.prototype.activate = function(t) {
        this.activeTarget = t, e(this.selector).parentsUntil(this.options.target, ".active").removeClass("active");
        var n = this.selector + '[data-target="' + t + '"],' + this.selector + '[href="' + t + '"]', r = e(n).parents("li").addClass("active");
        r.parent(".dropdown-menu").length && (r = r.closest("li.dropdown").addClass("active")), r.trigger("activate.bs.scrollspy")
    };
    var n = e.fn.scrollspy;
    e.fn.scrollspy = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.scrollspy"), s = "object" == typeof n && n;
            i || r.data("bs.scrollspy", i = new t(this, s)), "string" == typeof n && i[n]()
        })
    }, e.fn.scrollspy.Constructor = t, e.fn.scrollspy.noConflict = function() {
        return e.fn.scrollspy = n, this
    }, e(window).on("load", function() {
        e('[data-spy="scroll"]').each(function() {
            var t = e(this);
            t.scrollspy(t.data())
        })
    })
}(jQuery), +function(e) {
    var t = function(t) {
        this.element = e(t)
    };
    t.prototype.show = function() {
        var t = this.element, n = t.closest("ul:not(.dropdown-menu)"), r = t.data("target");
        if (r || (r = t.attr("href"), r = r && r.replace(/.*(?=#[^\s]*$)/, "")), !t.parent("li").hasClass("active")) {
            var i = n.find(".active:last a")[0], s = e.Event("show.bs.tab", {relatedTarget: i});
            if (t.trigger(s), !s.isDefaultPrevented()) {
                var o = e(r);
                this.activate(t.parent("li"), n), this.activate(o, o.parent(), function() {
                    t.trigger({type: "shown.bs.tab", relatedTarget: i})
                })
            }
        }
    }, t.prototype.activate = function(t, n, r) {
        function i() {
            s.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), t.addClass("active"), o ? (t[0].offsetWidth, t.addClass("in")) : t.removeClass("fade"), t.parent(".dropdown-menu") && t.closest("li.dropdown").addClass("active"), r && r()
        }
        var s = n.find("> .active"), o = r && e.support.transition && s.hasClass("fade");
        o ? s.one(e.support.transition.end, i).emulateTransitionEnd(150) : i(), s.removeClass("in")
    };
    var n = e.fn.tab;
    e.fn.tab = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.tab");
            i || r.data("bs.tab", i = new t(this)), "string" == typeof n && i[n]()
        })
    }, e.fn.tab.Constructor = t, e.fn.tab.noConflict = function() {
        return e.fn.tab = n, this
    }, e(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(t) {
        t.preventDefault(), e(this).tab("show")
    })
}(jQuery), +function(e) {
    var t = function(n, r) {
        this.options = e.extend({}, t.DEFAULTS, r), this.$window = e(window).on("scroll.bs.affix.data-api", e.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", e.proxy(this.checkPositionWithEventLoop, this)), this.$element = e(n), this.affixed = this.unpin = this.pinnedOffset = null, this.checkPosition()
    };
    t.RESET = "affix affix-top affix-bottom", t.DEFAULTS = {offset: 0}, t.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset)
            return this.pinnedOffset;
        this.$element.removeClass(t.RESET).addClass("affix");
        var e = this.$window.scrollTop(), n = this.$element.offset();
        return this.pinnedOffset = n.top - e
    }, t.prototype.checkPositionWithEventLoop = function() {
        setTimeout(e.proxy(this.checkPosition, this), 1)
    }, t.prototype.checkPosition = function() {
        if (this.$element.is(":visible")) {
            var n = e(document).height(), r = this.$window.scrollTop(), i = this.$element.offset(), s = this.options.offset, o = s.top, u = s.bottom;
            "top" == this.affixed && (i.top += r), "object" != typeof s && (u = o = s), "function" == typeof o && (o = s.top(this.$element)), "function" == typeof u && (u = s.bottom(this.$element));
            var f = null != this.unpin && r + this.unpin <= i.top ? !1 : null != u && i.top + this.$element.height() >= n - u ? "bottom" : null != o && o >= r ? "top" : !1;
            if (this.affixed !== f) {
                this.unpin && this.$element.css("top", "");
                var l = "affix" + (f ? "-" + f : ""), c = e.Event(l + ".bs.affix");
                this.$element.trigger(c), c.isDefaultPrevented() || (this.affixed = f, this.unpin = "bottom" == f ? this.getPinnedOffset() : null, this.$element.removeClass(t.RESET).addClass(l).trigger(e.Event(l.replace("affix", "affixed"))), "bottom" == f && this.$element.offset({top: n - u - this.$element.height()}))
            }
        }
    };
    var n = e.fn.affix;
    e.fn.affix = function(n) {
        return this.each(function() {
            var r = e(this), i = r.data("bs.affix"), s = "object" == typeof n && n;
            i || r.data("bs.affix", i = new t(this, s)), "string" == typeof n && i[n]()
        })
    }, e.fn.affix.Constructor = t, e.fn.affix.noConflict = function() {
        return e.fn.affix = n, this
    }, e(window).on("load", function() {
        e('[data-spy="affix"]').each(function() {
            var t = e(this), n = t.data();
            n.offset = n.offset || {}, n.offsetBottom && (n.offset.bottom = n.offsetBottom), n.offsetTop && (n.offset.top = n.offsetTop), t.affix(n)
        })
    })
}(jQuery), define("jquery.bootstrap", ["jquery"], function() {
}), !function(e) {
    function t(e, t) {
        if (o[e]) {
            var r = n(this);
            return o[e].apply(r, t)
        }
        throw new Error("method '" + e + "()' does not exist for slider.")
    }
    function n(t) {
        var n = e(t).data("slider");
        if (n && n instanceof s)
            return n;
        throw new Error(i.callingContextNotSliderInstance)
    }
    function r(t) {
        var n = e(this), r = n.data("slider"), i = "object" == typeof t && t;
        return r || n.data("slider", r = new s(this, e.extend({}, e.fn.slider.defaults, i))), n
    }
    var i = {formatInvalidInputErrorMsg: function(e) {
            return"Invalid input value '" + e + "' passed in"
        }, callingContextNotSliderInstance: "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"}, s = function(t, n) {
        var r = this.element = e(t).hide(), i = e(t)[0].style.width, s = !1, o = this.element.parent();
        o.hasClass("slider") === !0 ? (s = !0, this.picker = o) : this.picker = e('<div class="slider"><div class="slider-track"><div class="slider-selection"></div><div class="slider-handle"></div><div class="slider-handle"></div></div><div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div></div>').insertBefore(this.element).append(this.element), this.id = this.element.data("slider-id") || n.id, this.id && (this.picker[0].id = this.id), "undefined" != typeof Modernizr && Modernizr.touch && (this.touchCapable = !0);
        var u = this.element.data("slider-tooltip") || n.tooltip;
        switch (this.tooltip = this.picker.find(".tooltip"), this.tooltipInner = this.tooltip.find("div.tooltip-inner"), this.orientation = this.element.data("slider-orientation") || n.orientation, this.orientation) {
            case"vertical":
                this.picker.addClass("slider-vertical"), this.stylePos = "top", this.mousePos = "pageY", this.sizePos = "offsetHeight", this.tooltip.addClass("right")[0].style.left = "100%";
                break;
            default:
                this.picker.addClass("slider-horizontal").css("width", i), this.orientation = "horizontal", this.stylePos = "left", this.mousePos = "pageX", this.sizePos = "offsetWidth", this.tooltip.addClass("top")[0].style.top = -this.tooltip.outerHeight() - 14 + "px"
        }
        ["min", "max", "step", "value"].forEach(function(e) {
            this[e] = "undefined" != typeof r.data("slider-" + e) ? r.data("slider-" + e) : "undefined" != typeof n[e] ? n[e] : "undefined" != typeof r.prop(e) ? r.prop(e) : 0
        }, this), this.value instanceof Array && (this.range = !0), this.selection = this.element.data("slider-selection") || n.selection, this.selectionEl = this.picker.find(".slider-selection"), "none" === this.selection && this.selectionEl.addClass("hide"), this.selectionElStyle = this.selectionEl[0].style, this.handle1 = this.picker.find(".slider-handle:first"), this.handle1Stype = this.handle1[0].style, this.handle2 = this.picker.find(".slider-handle:last"), this.handle2Stype = this.handle2[0].style;
        var f = this.element.data("slider-handle") || n.handle;
        switch (f) {
            case"round":
                this.handle1.addClass("round"), this.handle2.addClass("round");
                break;
            case"triangle":
                this.handle1.addClass("triangle"), this.handle2.addClass("triangle")
        }
        if (this.range ? (this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0])), this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]))) : (this.value = [Math.max(this.min, Math.min(this.max, this.value))], this.handle2.addClass("hide"), this.value[1] = "after" === this.selection ? this.max : this.min), this.diff = this.max - this.min, this.percentage = [100 * (this.value[0] - this.min) / this.diff, 100 * (this.value[1] - this.min) / this.diff, 100 * this.step / this.diff], this.offset = this.picker.offset(), this.size = this.picker[0][this.sizePos], this.formater = n.formater, this.reversed = this.element.data("slider-reversed") || n.reversed, this.layout(), this.touchCapable ? this.picker.on({touchstart: e.proxy(this.mousedown, this)}) : this.picker.on({mousedown: e.proxy(this.mousedown, this)}), this.handle1.on({keydown: e.proxy(this.keydown, this, 0)}), this.handle2.on({keydown: e.proxy(this.keydown, this, 1)}), "hide" === u ? this.tooltip.addClass("hide") : "always" === u ? (this.showTooltip(), this.alwaysShowTooltip = !0) : (this.picker.on({mouseenter: e.proxy(this.showTooltip, this), mouseleave: e.proxy(this.hideTooltip, this)}), this.handle1.on({focus: e.proxy(this.showTooltip, this), blur: e.proxy(this.hideTooltip, this)}), this.handle2.on({focus: e.proxy(this.showTooltip, this), blur: e.proxy(this.hideTooltip, this)})), s === !0) {
            var l = this.getValue(), c = this.calculateValue();
            this.element.trigger({type: "slide", value: c}).data("value", c).prop("value", c), l !== c && this.element.trigger({type: "slideChange", "new": c, old: l}).data("value", c).prop("value", c)
        }
        this.enabled = n.enabled && (void 0 === this.element.data("slider-enabled") || this.element.data("slider-enabled") === !0), this.enabled ? this.enable() : this.disable()
    };
    s.prototype = {constructor: s, over: !1, inDrag: !1, showTooltip: function() {
            this.tooltip.addClass("in"), this.over = !0
        }, hideTooltip: function() {
            this.inDrag === !1 && this.alwaysShowTooltip !== !0 && this.tooltip.removeClass("in"), this.over = !1
        }, layout: function() {
            var e;
            e = this.reversed ? [100 - this.percentage[0], this.percentage[1]] : [this.percentage[0], this.percentage[1]], this.handle1Stype[this.stylePos] = e[0] + "%", this.handle2Stype[this.stylePos] = e[1] + "%", "vertical" === this.orientation ? (this.selectionElStyle.top = Math.min(e[0], e[1]) + "%", this.selectionElStyle.height = Math.abs(e[0] - e[1]) + "%") : (this.selectionElStyle.left = Math.min(e[0], e[1]) + "%", this.selectionElStyle.width = Math.abs(e[0] - e[1]) + "%"), this.range ? (this.tooltipInner.text(this.formater(this.value[0]) + " : " + this.formater(this.value[1])), this.tooltip[0].style[this.stylePos] = this.size * (e[0] + (e[1] - e[0]) / 2) / 100 - ("vertical" === this.orientation ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + "px") : (this.tooltipInner.text(this.formater(this.value[0])), this.tooltip[0].style[this.stylePos] = this.size * e[0] / 100 - ("vertical" === this.orientation ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + "px")
        }, mousedown: function(t) {
            if (!this.isEnabled())
                return!1;
            this.touchCapable && "touchstart" === t.type && (t = t.originalEvent), this.offset = this.picker.offset(), this.size = this.picker[0][this.sizePos];
            var n = this.getPercentage(t);
            if (this.range) {
                var r = Math.abs(this.percentage[0] - n), i = Math.abs(this.percentage[1] - n);
                this.dragged = i > r ? 0 : 1
            } else
                this.dragged = 0;
            this.percentage[this.dragged] = this.reversed ? 100 - n : n, this.layout(), this.touchCapable ? e(document).on({touchmove: e.proxy(this.mousemove, this), touchend: e.proxy(this.mouseup, this)}) : e(document).on({mousemove: e.proxy(this.mousemove, this), mouseup: e.proxy(this.mouseup, this)}), this.inDrag = !0;
            var s = this.calculateValue();
            return this.setValue(s), this.element.trigger({type: "slideStart", value: s}).trigger({type: "slide", value: s}), !1
        }, keydown: function(e, t) {
            if (!this.isEnabled())
                return!1;
            var n;
            switch (t.which) {
                case 37:
                case 40:
                    n = -1;
                    break;
                case 39:
                case 38:
                    n = 1
            }
            if (n) {
                var r = n * this.percentage[2], i = this.percentage[e] + r;
                i > 100 ? i = 100 : 0 > i && (i = 0), this.dragged = e, this.adjustPercentageForRangeSliders(i), this.percentage[this.dragged] = i, this.layout();
                var s = this.calculateValue();
                return this.setValue(s), this.element.trigger({type: "slide", value: s}).trigger({type: "slideStop", value: s}).data("value", s).prop("value", s), !1
            }
        }, mousemove: function(e) {
            if (!this.isEnabled())
                return!1;
            this.touchCapable && "touchmove" === e.type && (e = e.originalEvent);
            var t = this.getPercentage(e);
            this.adjustPercentageForRangeSliders(t), this.percentage[this.dragged] = this.reversed ? 100 - t : t, this.layout();
            var n = this.calculateValue();
            return this.setValue(n), this.element.trigger({type: "slide", value: n}).data("value", n).prop("value", n), !1
        }, adjustPercentageForRangeSliders: function(e) {
            this.range && (0 === this.dragged && this.percentage[1] < e ? (this.percentage[0] = this.percentage[1], this.dragged = 1) : 1 === this.dragged && this.percentage[0] > e && (this.percentage[1] = this.percentage[0], this.dragged = 0))
        }, mouseup: function() {
            if (!this.isEnabled())
                return!1;
            this.touchCapable ? e(document).off({touchmove: this.mousemove, touchend: this.mouseup}) : e(document).off({mousemove: this.mousemove, mouseup: this.mouseup}), this.inDrag = !1, this.over === !1 && this.hideTooltip();
            var t = this.calculateValue();
            return this.layout(), this.element.data("value", t).prop("value", t).trigger({type: "slideStop", value: t}), !1
        }, calculateValue: function() {
            var e;
            return this.range ? (e = [this.min, this.max], 0 !== this.percentage[0] && (e[0] = Math.max(this.min, this.min + Math.round(this.diff * this.percentage[0] / 100 / this.step) * this.step)), 100 !== this.percentage[1] && (e[1] = Math.min(this.max, this.min + Math.round(this.diff * this.percentage[1] / 100 / this.step) * this.step)), this.value = e) : (e = this.min + Math.round(this.diff * this.percentage[0] / 100 / this.step) * this.step, e < this.min ? e = this.min : e > this.max && (e = this.max), e = parseFloat(e), this.value = [e, this.value[1]]), e
        }, getPercentage: function(e) {
            this.touchCapable && (e = e.touches[0]);
            var t = 100 * (e[this.mousePos] - this.offset[this.stylePos]) / this.size;
            return t = Math.round(t / this.percentage[2]) * this.percentage[2], Math.max(0, Math.min(100, t))
        }, getValue: function() {
            return this.range ? this.value : this.value[0]
        }, setValue: function(e) {
            this.value = this.validateInputValue(e), this.range ? (this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0])), this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]))) : (this.value = [Math.max(this.min, Math.min(this.max, this.value))], this.handle2.addClass("hide"), this.value[1] = "after" === this.selection ? this.max : this.min), this.diff = this.max - this.min, this.percentage = [100 * (this.value[0] - this.min) / this.diff, 100 * (this.value[1] - this.min) / this.diff, 100 * this.step / this.diff], this.layout()
        }, validateInputValue: function(e) {
            if ("number" == typeof e)
                return e;
            if (e instanceof Array)
                return e.forEach(function(e) {
                    if ("number" != typeof e)
                        throw new Error(i.formatInvalidInputErrorMsg(e))
                }), e;
            throw new Error(i.formatInvalidInputErrorMsg(e))
        }, destroy: function() {
            this.handle1.off(), this.handle2.off(), this.element.off().show().insertBefore(this.picker), this.picker.off().remove(), e(this.element).removeData("slider")
        }, disable: function() {
            this.enabled = !1, this.handle1.removeAttr("tabindex"), this.handle2.removeAttr("tabindex"), this.picker.addClass("slider-disabled"), this.element.trigger("slideDisabled")
        }, enable: function() {
            this.enabled = !0, this.handle1.attr("tabindex", 0), this.handle2.attr("tabindex", 0), this.picker.removeClass("slider-disabled"), this.element.trigger("slideEnabled")
        }, toggle: function() {
            this.enabled ? this.disable() : this.enable()
        }, isEnabled: function() {
            return this.enabled
        }};
    var o = {getValue: s.prototype.getValue, setValue: s.prototype.setValue, destroy: s.prototype.destroy, disable: s.prototype.disable, enable: s.prototype.enable, toggle: s.prototype.toggle, isEnabled: s.prototype.isEnabled};
    e.fn.slider = function(e) {
        if ("string" == typeof e) {
            var n = Array.prototype.slice.call(arguments, 1);
            return t.call(this, e, n)
        }
        return r.call(this, e)
    }, e.fn.slider.defaults = {min: 0, max: 10, step: 1, orientation: "horizontal", value: 5, selection: "before", tooltip: "show", handle: "round", reversed: !1, enabled: !0, formater: function(e) {
            return e
        }}, e.fn.slider.Constructor = s
}(window.jQuery), define("bootstrap.slider", ["jquery.bootstrap"], function() {
}), define("warp", ["jquery", "dsp", "stretch", "graph", "tools", "alertify", "bootstrap.slider", "jquery.bootstrap"], function(e, t, n, r, i, s) {
    return WarpApp = function() {
        function o() {
            t && console.log(Array.prototype.slice.call(arguments).join(" "))
        }
        function u(e, t, n, r) {
            var i = t.sampleRate, s = t.length, o = t.numberOfChannels, u = parseInt(n * i), a = parseInt(r * i), f = a - u, l = e.createBuffer(o, f, i);
            for (var c = 0; c < o; ++c)
                l.getChannelData(c).set(t.getChannelData(c).subarray(u, a));
            return l
        }
        function a(t) {
            e(t).fadeIn(1e3), window.setTimeout(function() {
                e(t).fadeOut(1e3), window.setTimeout(function() {
                    a(t)
                }, 12e4)
            }, 25e3)
        }
        function f(e) {
            this.init(e)
        }
        var t = !0;
        return f.prototype = {init: function(t) {
                this.options = i.merge({}, t), this.$files = e("#files"), this.$open = e("#open");
                if (!window.AudioContext && !window.webkitAudioContext)
                    throw"No Web Audio Support";
                if (!(window.File && window.FileReader && window.FileList && window.Blob))
                    throw"No File API Support";
                var n = window.AudioContext || window.webkitAudioContext;
                this.actx = new n;
                var u = this;
                document.getElementById("files").addEventListener("change", function(e) {
                    u.loadFile(e)
                }, !1), this.$open.click(function() {
                    u.$files.click()
                }), e("#play").prop("disabled", !0), e("#play").click(function() {
                    if (!u.loaded)
                        return;
                    u.widget.getSelection()[1] == 0 ? s.error("Please select a section to stretch.") : (u.playing = !0, e("#play").hide(), e("#pause").show(), (u.stretchFactor != 0 || u.pitchShift != 0) && s.log("Warping..."), window.setTimeout(function() {
                        if (!u.playing)
                            return;
                        u.stretch(), u.play()
                    }, 1e3))
                }), e("#pause").click(function() {
                    u.stop()
                }), e("#loop").click(function() {
                    u.loop = !u.loop, u.loop ? (e(this).addClass("btn-success"), e(this).removeClass("btn-danger"), e(this).attr("title", "Loop enabled").tooltip("fixTitle").tooltip("show")) : (e(this).addClass("btn-danger"), e(this).removeClass("btn-success"), e(this).attr("title", "Loop disabled").tooltip("fixTitle").tooltip("show"))
                }), e("#widget").tooltip(), e("#play").tooltip(), e(".factor").tooltip(), e("#open").tooltip(), e("#loop").tooltip(), e("#speed-slider").slider({formater: function(e) {
                        if (e == 100)
                            return"Original speed";
                        if (e > 100)
                            return"Faster (" + e + "%)";
                        if (e < 100)
                            return"Slower (" + e + "%)"
                    }}).on("slide", function() {
                    e(this).slider("getValue") == 100 ? u.stretchFactor = 1 : u.stretchFactor = 1 / (e(this).slider("getValue") / 100)
                }), e("#pitch-slider").slider({formater: function(e) {
                        if (e == 0)
                            return"Original pitch";
                        if (e > 0)
                            return e + " semitones up";
                        if (e < 0)
                            return Math.abs(e) + " semitones down"
                    }}).on("slide", function() {
                    u.pitchShift = e(this).slider("getValue")
                }), this.widget = new r.GraphWidget("#widget"), this.widget.create(), this.buffer = null, this.playBuffer = null, this.fileName = "", this.loaded = !1, this.stretchFactor = 1, this.pitchShift = 0, this.loop = !0, this.playing = !1, typeof chrome == "object" && (typeof chrome.app.runtime == "undefined" ? (o("VexWarp running in browser. Hello world!"), window.setTimeout(function() {
                    a("#surprise")
                }, 3e3)) : o("VexWarp running in app. Hello world!"))
            }, stretch: function() {
                var e = this.buffer;
                if (!e)
                    return;
                var t = this.widget.getSelection(), r = t[0], i = t[1], s = i - r;
                if (s == 0) {
                    this.playBuffer = null;
                    return
                }
                var a = u(this.actx, e, r, i);
                if (this.stretchFactor == 1 && this.pitchShift == 0) {
                    this.playBuffer = a;
                    return
                }
                var f = Math.pow(2, this.pitchShift / 12), l = this.stretchFactor * f, c = a.length * this.stretchFactor;
                o("Stretching: ", this.stretchFactor, "Shifting: ", f);
                var h = new n.TimeStretcher({sampleRate: e.sampleRate, stretchFactor: l}), p = [], d = this.actx.createBuffer(a.numberOfChannels, c, a.sampleRate);
                for (var v = 0; v < a.numberOfChannels; ++v)
                    o("Stretching channel: ", v), h.setBuffer(a.getChannelData(v)).stretch(), p[v] = f ? h.resize(c).getPitchShiftedBuffer() : h.getStretchedBuffer(), d.getChannelData(v).set(p[v]);
                this.playBuffer = d
            }, play: function() {
                var e = this.playBuffer;
                if (!e)
                    return;
                if (!this.playing)
                    return;
                s.success("Playing...");
                var t = 0, n = e.length;
                this.node = this.actx.createScriptProcessor(8192, 0, e.numberOfChannels);
                var r = this, i = this.widget.getSelection()[0];
                this.node.onaudioprocess = function(s) {
                    var o = s.outputBuffer, u = o.length;
                    r.playing || r.stop();
                    for (var a = 0; a < e.numberOfChannels; ++a)
                        o.getChannelData(a).set(e.getChannelData(a).subarray(t, t + u - 1));
                    r.widget.setCursor(i + t / n * (n / e.sampleRate) / r.stretchFactor), t += u, t >= n && (r.loop ? t = 0 : r.stop())
                }, this.node.connect(this.actx.destination)
            }, stop: function() {
                this.node && this.node.disconnect(), e("#pause").hide(), e("#play").show(), this.playing = !1, this.widget.setCursor(0)
            }, loadFile: function(t) {
                var n = t.target.files, i = new FileReader, o = this;
                i.onerror = function(e) {
                    s.error("Couldn't decode audio format.")
                }, i.onabort = function(e) {
                    s.error("Load cancelled.")
                }, i.onloadstart = function(e) {
                    s.log("Loading...")
                }, i.onloadend = function(t) {
                    s.log("Decoding..."), o.actx.decodeAudioData(t.target.result, function(t) {
                        o.buffer = t;
                        var n = new r.Spectrum([t.getChannelData(0)]);
                        this.spectrum = n, o.widget.setSpectrum(n), o.widget.draw(), o.loaded = !0, s.success("All ready!"), e("#play").prop("disabled", !1), e("#filename").text(o.fileName)
                    }, i.onerror)
                };
                for (var u = 0, a; a = n[u]; u++)
                    o.fileName = a.name, i.readAsArrayBuffer(a)
            }}, f
    }(), WarpApp
}), define("app", ["jquery", "warp", "jquery.bootstrap"], function(e, t) {
    function n() {
        e(function() {
            var e = new t
        })
    }
    return n
}), requirejs.config({baseUrl: "js", paths: {jquery: "support/jquery-2.0.3", "jquery.bootstrap": "support/bootstrap.min", alertify: "support/alertify.min", lodash: "support/lodash.min", dsp: "support/dsp", "bootstrap.slider": "support/bootstrap-slider.min", graph: "graph", stretch: "stretch", tools: "tools", warp: "warp"}, shim: {backbone: {deps: ["lodash", "jquery"], exports: "Backbone"}, dsp: {exports: "dsp", init: function() {
                return{DSP: DSP, FFT: FFT, WindowFunction: WindowFunction}
            }}, "jquery.bootstrap": {deps: ["jquery"]}, "bootstrap.slider": {deps: ["jquery.bootstrap"]}, alertify: {exports: "alertify"}}}), require(["app"], function(e) {
    e()
}), define("main", function() {
});