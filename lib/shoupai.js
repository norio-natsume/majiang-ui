/*
 *  Majiang.UI.Shoupai
 */
"use strict";

const $ = require('jquery');

const mianzi = require('./mianzi');

module.exports = class Shoupai {

    constructor(root, pai, shoupai, open) {

        this._node = {
            root:    root,
            bingpai: $('.bingpai', root),
            fulou:   $('.fulou',   root)
        };
        this._pai     = pai;
        this._mianzi  = mianzi(pai);
        this._shoupai = shoupai;
        this._open    = open;
    }

    redraw(open) {

        if (open != null) this._open = open;

        this._node.bingpai.attr('aria-label', '手牌');
        this._node.bingpai.empty();
        let zimo = this._shoupai._zimo
        for (let s of ['m','p','s','z']) {
            let bingpai = this._shoupai._bingpai[s];
            let n_hongpai = bingpai[0];
            for (let n = 1; n < bingpai.length; n++) {
                let n_pai = bingpai[n];
                if      (s+n == zimo)           { n_pai--              }
                else if (n == 5 && s+0 == zimo) { n_pai--; n_hongpai-- }
                for (let i = 0; i < n_pai; i++) {
                    let p = (n == 5 && n_hongpai > i) ? s+0 : s+n;
                    this._node.bingpai.append(this._open ? this._pai(p)
                                                         : this._pai('_'));
                }
            }
        }
        let n_pai = this._shoupai._bingpai._ + (zimo == '_' ?  - 1 : 0);
        for (let i = 0; i < n_pai; i++) {
            this._node.bingpai.append(this._pai('_'));
        }
        if (zimo && zimo.length <= 2) {
            this._node.bingpai.append(
                    $('<span class="zimo">')
                            .append(this._open ? this._pai(zimo)
                                               : this._pai('_')));
        }

        this._node.fulou.empty();
        for (let m of this._shoupai._fulou) {
            this._node.fulou.append(this._mianzi(m));
        }

        return this;
    }

    adjust() {
        let shoupai = this._node.root.width();
        let bingpai = this._node.bingpai.width();
        let fulou   = this._node.fulou.width();
        if (fulou < shoupai) {
            let overflow = bingpai + fulou - shoupai;
            if (overflow > 0)
                    this._node.bingpai.css('margin-left', `${- overflow}px`);
            else    this._node.bingpai.css('margin-left', '');
        }
        else {
            this._node.bingpai.css('margin-left', '');
        }
        return this;
    }

    dapai(p) {

        let dapai = $('.pai.dapai', this._node.bingpai);
        if (! dapai.length) {
            if (p[2] == '_') dapai = $('.zimo .pai', this._node.bingpai);
        }
        if (! dapai.length) {
            if (this._open) {
                dapai = $(`.pai[data-pai="${p.slice(0,2)}"]`,
                          this._node.bingpai).eq(0);
            }
            else {
                dapai = $('.pai', this._node.bingpai);
                dapai = dapai.eq(Math.random()*(dapai.length-1)|0);
            }
        }
        dapai.addClass('deleted');

        return this;
    }
}
