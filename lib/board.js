/*
 *  Majiang.UI.Board
 */
"use strict";

const $ = require('jquery');

const Shoupai = require('./shoupai');
const Shan    = require('./shan');
const He      = require('./he');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

const class_name = ['main','xiajia','duimian','shangjia'];
const feng_hanzi = ['東','南','西','北'];
const shu_hanzi  = ['一','二','三','四'];

const say_text   = { chi:   'チー',
                     peng:  'ポン',
                     gang:  'カン',
                     lizhi: 'リーチ',
                     rong:  'ロン',
                     zimo:  'ツモ'    };

class Score {

    constructor(root, pai, model) {
        this._model = model;
        this._view = {
            root:      root,
            jushu:     $('.jushu', root),
            changbang: $('.changbang', root),
            lizhibang: $('.lizhibang', root),
            defen:     [],
        };
        this._pai = pai;
        this._viewpoint = 0;
    }

    redraw(viewpoint) {

        if (viewpoint != null) this._viewpoint = viewpoint;

        let jushu = feng_hanzi[this._model.zhuangfeng]
                  + shu_hanzi[this._model.jushu] + '局';
        this._view.jushu.text(jushu);
        this._view.changbang.text(this._model.changbang);
        this._view.lizhibang.text(this._model.lizhibang);

        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            let defen = '' + this._model.defen[id];
            defen = defen.replace(/(\d)(\d{3})$/,'$1,$2');
            defen = `${feng_hanzi[l]}: ${defen}`;
            let c = class_name[(id + 4 - this._viewpoint) % 4];
            this._view.defen[l] = $(`.defen .${c}`, this._root);
            this._view.defen[l].removeClass('lunban').text(defen);
            if (l == this._model.lunban) this._view.defen[l].addClass('lunban');
        }
        return this;
    }

    update() {
        let lunban = this._model.lunban < 0 ? 0 : this._model.lunban;
        for (let l = 0; l < 4; l++) {
            if (l == lunban) this._view.defen[l].addClass('lunban');
            else             this._view.defen[l].removeClass('lunban');
        }
        return this;
    }
}

module.exports = class Board {

    constructor(root, pai, audio, model) {
        this._root  = root;
        this._model = model;
        this._pai   = pai;
        this._view  = {
            score:   new Score($('.score', root), pai, model),
            shan:    null,
            shoupai: [],
            he:      [],
            say:     [],
        };
        this._say = [];

        this.viewpoint = 0;
        this.sound_on  = true;

        this.set_audio(audio);
    }

    set_audio(audio) {
        this._audio = {};
        for (let name of ['dapai','chi','peng','gang','rong','zimo','lizhi']) {
            this._audio[name] = [];
            for (let l = 0; l < 4; l++) {
                this._audio[name][l] = audio(name);
            }
        }
        this._audio.gong = audio('gong');
        return this;
    }

    redraw() {

        this._view.score.redraw(this.viewpoint);

        this._view.shan = new Shan($('.shan', this._root), this._pai,
                                    this._model.shan).redraw();

        for (let l = 0; l < 4; l++) {
            let id   = this._model.player_id[l];
            let c    = class_name[(id + 4 - this.viewpoint) % 4];

            let open = this._model.player_id[l] == this.viewpoint;
            this._view.shoupai[l]
                    = new Shoupai($(`.shoupai.${c}`, this._root),
                                this._pai, this._model.shoupai[l]).redraw(open);

            this._view.he[l]
                    = new He($(`.he.${c}`, this._root),
                            this._pai, this._model.he[l]).redraw();

            this._view.say[l] = hide($(`.say.${c}`, this._root).text(''));
            this._say[l] = null;
        }

        this._lunban = this._model.lunban;
        this._view.score.update();

        return this;
    }

    update(data = {}) {

        if (this._lunban >= 0 && this._lunban != this._model.lunban) {
            if (this._say[this._lunban]) {
                fadeOut(this._view.say[this._lunban]);
                this._say[this._lunban] = null;
            }
            else {
                hide(this._view.say[this._lunban].text(''));
            }
            this._view.he[this._lunban].redraw();
            this._view.shoupai[this._lunban].redraw();
        }

        if (   (this._say[this._lunban] == 'lizhi')
            || (this._say[this._lunban] == 'chi'   && ! data.fulou)
            || (this._say[this._lunban] == 'peng'  && ! data.fulou)
            || (this._say[this._lunban] == 'gang'
                            && !(data.fulou || data.gang || data.kaigang)))
        {
            fadeOut(this._view.say[this._lunban]);
            this._say[this._lunban] = null;
        }

        if (data.zimo) {
            this._view.shan.update();
            this._view.shoupai[data.zimo.l].redraw();
        }
        else if (data.dapai) {
            this._view.shoupai[data.dapai.l].dapai(data.dapai.p);
            if (this.sound_on) {
                this._audio.dapai[data.dapai.l].currentTime = 0;
                this._audio.dapai[data.dapai.l].play();
            }
            this._view.he[data.dapai.l].dapai(data.dapai.p);
        }
        else if (data.fulou) {
            this._view.shoupai[data.fulou.l].redraw();
        }
        else if (data.gang) {
            this._view.shoupai[data.gang.l].redraw();
        }
        else if (data.gangzimo) {
            this._view.shan.update();
            this._view.shoupai[data.gangzimo.l].redraw();
        }
        else if (data.kaigang) {
            this._view.shan.redraw();
        }
        else {
            this._view.score.redraw();
        }

        this._lunban = this._model.lunban;
        if (this._lunban >= 0) this._view.score.update();

        return this;
    }

    say(name, l) {
        if (this.sound_on) {
            this._audio[name][l].currentTime = 0;
            this._audio[name][l].play();
        }
        show(this._view.say[l].text(say_text[name]));
        this._say[l] = name;
    }

    kaiju() {}
}