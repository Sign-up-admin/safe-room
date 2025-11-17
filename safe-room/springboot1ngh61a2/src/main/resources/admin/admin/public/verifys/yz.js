;(function(undefined) {
    "use strict"
    let _global;

    //判断是否为 数组
    function isArray(o){
        return Object.prototype.toString.call(o)=='[object Array]';
    }
    //随机数
    function getRandomNumber(a,b) {
        return Math.round(Math.random()*(b- a) + a)
    }
    //获取随机图片
    function getRandomImg(imgArr) {
        return imgArr[getRandomNumber(0,imgArr.length-1)]
    }
    //判断 是否处于动画状态
    function ifAnimate(ele) {
        // 检查元素是否有动画状态
        return ele._isAnimating === true;
    }
    //获取元素的left值
    function getEleCssLeft(ele) {
        return parseInt(getComputedStyle(ele).left);
    }
    
    const RotateVerify = function (ele,opt) {
        this.$ele = typeof ele === 'string' ? document.querySelector(ele) : ele;
        //默认参数
        this.defaults = {
            initText:'滑动将图片转正',
            slideImage:'',
            slideAreaNum:10,
            getSucessState:function(){

            }
        }
        this.settings = Object.assign({}, this.defaults, opt);
        // 初始化动画状态
        this._animatingElements = new Set();
        this.init();
    }
    RotateVerify.prototype = {
        constructor: this,
        init:function () {
			this.verifyState = false;
			this.disLf = 0;
            this.initDom();
            this.initCanvasImg();
            this.initMouse();
            this._touchstart();
            this._touchend();
        },
        initDom:function () {

			this.statusBg = this.$ele.querySelector('.statusBg');
            this.$slideDragWrap = this.$ele.querySelector('.slideDragWrap');
            this.$slideDragBtn = this.$ele.querySelector('.slideDragBtn');
			this.rotateCan = this.$ele.querySelector('.rotateCan');
			this.cTipsTxt = this.$ele.querySelector('.cTipsTxt');
			this.controlBorWrap = this.$ele.querySelector('.controlBorWrap');
			this.xPos = this.rotateCan.width/2;
			this.yPos = this.rotateCan.height/2;
			this.aveRot = Math.round((360/(this.$slideDragWrap.offsetWidth - this.$slideDragBtn.offsetWidth)) * 100 )/100;
			// window.$slideDragWrap = this.$slideDragWrap
			// console.log(this.$slideDragWrap)
			// console.log(this.$slideDragWrap.offsetWidth,this.$slideDragBtn.offsetWidth,this.aveRot)
			this.rotateImgCan = this.rotateCan.getContext('2d');
            this.slideImage = document.createElement('img');
			this.setAttrSrc();
        },
        initCanvasImg:function () {
			 this.randRot = getRandomNumber(30,270);
			 this.sucLenMin = (360 - this.settings.slideAreaNum - this.randRot) * (this.$slideDragWrap.offsetWidth - this.$slideDragBtn.offsetWidth)/360;
			 this.sucLenMax = (360 + this.settings.slideAreaNum - this.randRot) * (this.$slideDragWrap.offsetWidth - this.$slideDragBtn.offsetWidth)/360;
			 this.disLf = 0;
			 this.initImgSrc();
        },
		initImgSrc:function(){
			const _this = this;
			_this.slideImage.src = _this.slideImage.getAttribute('data-src');
			_this.setAttrSrc();
			_this.slideImage.onload = function(){
				_this.slideImage.style.width = _this.xPos * 2 + 'px';
				_this.slideImage.style.height = _this.yPos * 2 + 'px';
				_this.drawImgCan();
			}
		},
		drawImgCan:function(val){
			const _this = this;
			_this.rotateImgCan.beginPath();
			_this.rotateImgCan.arc( _this.xPos, _this.yPos, _this.xPos, 0, 360 * Math.PI / 180, false );
			_this.rotateImgCan.closePath();
			_this.rotateImgCan.clip();
			_this.rotateImgCan.save();
			_this.rotateImgCan.clearRect(0,0,_this.xPos * 2,_this.yPos * 2);
			_this.rotateImgCan.translate(_this.xPos, _this.yPos);
			_this.rotateImgCan.rotate(this.randRot * Math.PI / 180 + _this.disLf * _this.aveRot * Math.PI / 180);
			_this.rotateImgCan.translate(-_this.xPos, -_this.yPos);
			_this.rotateImgCan.drawImage( _this.slideImage, 0, 0, _this.xPos*2, _this.yPos*2);
			_this.rotateImgCan.restore();
		},
        initMouse:function () {
            const _this = this ;
            let ifThisMousedown = false;
            _this.$slideDragBtn.on('mousedown',function (e) {
                if(_this.verifyState){
                    return false;
                }
                if(_this.dragTimerState){
                    return false;
                }
                if(_this.isAnimating(_this.$slideDragBtn)){
                    return false;
                }
                ifThisMousedown = true;
                const rect = this.getBoundingClientRect();
                const distenceX = e.pageX - rect.left;
                const disPageX = e.pageX;
                _this.$slideDragBtn.classList.add('control-btn-active');
				_this.controlBorWrap.classList.add('control-bor-active');
                const handleMouseMove = (e) => {
                    if(!ifThisMousedown){
                        return false;
                    }
                    let x = e.pageX - disPageX;
                    if(x<0){
                        x=0;
                    }else if(x >=(_this.$slideDragWrap.offsetWidth-_this.$slideDragBtn.offsetWidth)){
						x = _this.$slideDragWrap.offsetWidth-_this.$slideDragBtn.offsetWidth;
                    }
					_this.$slideDragBtn.style.left = x + 'px';
					_this.controlBorWrap.style.width = x + _this.$slideDragBtn.offsetWidth + 'px';
					_this.disLf = x;
					_this.drawImgCan();
                    e.preventDefault();
                };
                document.addEventListener('mousemove', handleMouseMove);
            });
            const handleMouseUp = () => {
                if(!ifThisMousedown){
                    return false;
                }
                ifThisMousedown = false;
                if(_this.verifyState){
                    return false;
                }
                document.removeEventListener('mousemove', handleMouseMove);
                _this.$slideDragBtn.classList.remove('control-btn-active');
				_this.controlBorWrap.classList.remove('control-bor-active');
                if(_this.sucLenMin <= _this.disLf && _this.disLf <= _this.sucLenMax){
                	_this.$slideDragBtn.classList.add('control-btn-suc');
					_this.controlBorWrap.classList.add('control-bor-suc');
					_this.fadeIn(_this.statusBg);
					_this.statusBg.classList.add('icon-dagou');
					_this.verifyState = true;
					_this.cTipsTxt.textContent = "";
					if(_this.settings.getSuccessState){
					    _this.settings.getSuccessState(_this.verifyState);
					}
                }else{
                	_this.$slideDragBtn.classList.add('control-btn-err');
					_this.controlBorWrap.classList.add('control-bor-err');
                	_this.$slideDragWrap.classList.add('control-horizontal');
					_this.dragTimerState = true;
					_this.verifyState = false;;
					_this.fadeIn(_this.statusBg);
					_this.statusBg.classList.add('icon-guanbi1');
                	setTimeout(() => {
						_this.animateTo(_this.$slideDragBtn, {left: '0px'}, () => {
							_this.dragTimerState = false;
							_this.$slideDragWrap.classList.remove('control-horizontal');
							_this.$slideDragBtn.classList.remove('control-btn-err');
							_this.statusBg.classList.remove('icon-guanbi1');
							_this.fadeOut(_this.statusBg);
							_this.refreshSlide();
						});
						_this.animateTo(_this.controlBorWrap, {width: _this.$slideDragBtn.offsetWidth + 'px'}, () => {
							_this.controlBorWrap.classList.remove('control-bor-err');
						});
					}, 700);
                }
            };
            document.addEventListener('mouseup', handleMouseUp);
        },
        _touchstart:function(){
            const _this = this;
			_this.$slideDragBtn.addEventListener('touchstart',(e) =>{
                _this.$slideDragBtn.style.pointerEvents = 'none';
                setTimeout(() =>{_this.$slideDragBtn.style.pointerEvents = 'all'},400)
                if(_this.dragTimerState || _this.isAnimating(_this.$slideDragBtn) || _this.verifyState){
                    return false;
                }
                if(getEleCssLeft(_this.$slideDragBtn) == 0){
                    _this.touchX = e.targetTouches[0].pageX;
					_this.$slideDragBtn.classList.add('control-btn-active');
					_this.controlBorWrap.classList.add('control-bor-active');
                    _this._touchmove();
                }
            })
        },
        _touchmove:function(){
            const _this = this;
            _this.$slideDragBtn.addEventListener('touchmove',(e) =>{
                e.preventDefault();
                if(_this.dragTimerState || _this.isAnimating(_this.$slideDragBtn)){
                    return false;
                }else{
                    let x = e.targetTouches[0].pageX - _this.touchX;
					if(x<0){
					    x=0;
					}else if(x >=(_this.$slideDragWrap.offsetWidth-_this.$slideDragBtn.offsetWidth)){
						x = _this.$slideDragWrap.offsetWidth-_this.$slideDragBtn.offsetWidth;
					}
					_this.$slideDragBtn.style.left = x + 'px';
					_this.controlBorWrap.style.width = x + _this.$slideDragBtn.offsetWidth + 'px';
					_this.disLf = x;
					_this.drawImgCan();
                }
            })
        },
        _touchend:function(){
            const _this = this;
            _this.$slideDragBtn.addEventListener('touchend',() =>{
                _this.$slideDragBtn.removeEventListener('touchmove', _this._touchmove);
				_this.$slideDragBtn.classList.remove('control-btn-active');
				_this.controlBorWrap.classList.remove('control-bor-active');
				if((_this.sucLenMin) <= _this.disLf && _this.disLf <= (_this.sucLenMax)){
					_this.verifyState = true;
					_this.$slideDragBtn.classList.add('control-btn-suc');
					_this.controlBorWrap.classList.add('control-bor-suc');
					_this.fadeIn(_this.statusBg);
					_this.statusBg.classList.add('icon-dagou');
					_this.cTipsTxt.textContent = "";
					if(_this.settings.getSuccessState){
					    _this.settings.getSuccessState(_this.verifyState);
					}
				}else{
					if(!_this.isAnimating(_this.$slideDragBtn)){
					    _this.dragTimerState = true;
						_this.verifyState = false;
						_this.fadeIn(_this.statusBg);
						_this.statusBg.classList.add('icon-guanbi1');
					    _this.$slideDragBtn.classList.add('control-btn-err');
						_this.controlBorWrap.classList.add('control-bor-err');
					    _this.$slideDragWrap.classList.add('control-horizontal');
					    setTimeout(() => {
							_this.animateTo(_this.$slideDragBtn, {left: '0px'}, () => {
								_this.$slideDragWrap.classList.remove('control-horizontal');
								_this.$slideDragBtn.classList.remove('control-btn-err');
								_this.statusBg.classList.remove('icon-guanbi1');
								_this.fadeOut(_this.statusBg);
								_this.dragTimerState = false;
								_this.refreshSlide();
							});
							_this.animateTo(_this.controlBorWrap, {width: _this.$slideDragBtn.offsetWidth + 'px'}, () => {
								_this.controlBorWrap.classList.remove('control-bor-err');
							});
						}, 700);
					}else{
					    return false;
					}
				}
            })
        },
		setAttrSrc:function(){
			if(isArray(this.settings.slideImage)){
			    this.slideImageSrc = getRandomImg(this.settings.slideImage);
			}else{
			    this.slideImageSrc = this.settings.slideImage;
			}
			this.slideImage.setAttribute("data-src",this.slideImageSrc);
		},
        refreshSlide:function(){
            const _this = this;
			_this.initCanvasImg();
        },
		resetSlide:function(){
			const _this = this;
			_this.$slideDragBtn.style.left = '0px';
			_this.controlBorWrap.style.width = _this.$slideDragBtn.offsetWidth + 'px';
			_this.controlBorWrap.classList.remove('control-bor-suc');
			_this.dragTimerState = false;
			_this.verifyState = false;;
			_this.$slideDragBtn.classList.remove('control-btn-suc');
			_this.$slideDragWrap.classList.remove('control-horizontal');
			_this.fadeOut(_this.statusBg);
			_this.statusBg.classList.remove('icon-dagou');
			_this.cTipsTxt.textContent = _this.settings.initText;
			_this.refreshSlide();
		},
		// 动画方法
		fadeIn:function(element, duration = 300, callback) {
			element._isAnimating = true;
			element.style.display = '';
			element.style.opacity = '0';
			element.style.transition = `opacity ${duration}ms ease`;

			requestAnimationFrame(() => {
				element.style.opacity = '1';
			});

			setTimeout(() => {
				element._isAnimating = false;
				element.style.transition = '';
				if (callback) callback();
			}, duration);
		},
		fadeOut:function(element, duration = 300, callback) {
			element._isAnimating = true;
			element.style.transition = `opacity ${duration}ms ease`;
			element.style.opacity = '0';

			setTimeout(() => {
				element.style.display = 'none';
				element._isAnimating = false;
				element.style.transition = '';
				if (callback) callback();
			}, duration);
		},
		animateTo:function(element, properties, callback) {
			element._isAnimating = true;
			const transitions = [];
			const startValues = {};

			// 获取起始值
			for (const prop in properties) {
				if (properties.hasOwnProperty(prop)) {
					if (prop === 'left') {
						startValues[prop] = parseInt(getComputedStyle(element).left) || 0;
					} else if (prop === 'width') {
						startValues[prop] = parseInt(getComputedStyle(element).width) || 0;
					}
					transitions.push(`${prop} 700ms ease`);
				}
			}

			element.style.transition = transitions.join(', ');

			// 应用新值
			requestAnimationFrame(() => {
				for (const prop in properties) {
					if (properties.hasOwnProperty(prop)) {
						element.style[prop] = properties[prop];
					}
				}
			});

			setTimeout(() => {
				element._isAnimating = false;
				element.style.transition = '';
				if (callback) callback();
			}, 700);
		},
		isAnimating:function(element) {
			return element._isAnimating === true;
		}
    }
	const inlineCss = '*{margin:0;padding:0;box-sizing:border-box;}.rotateverify-contaniner{margin:0 auto;}@-webkit-keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-ms-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);transform:translate(0px,0)}}@-moz-keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);-moz-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);-moz-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}}@keyframes rotateverifyHorizontal{0%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}10%,30%,50%,70%,90%{-webkit-transform:translate(-1px,0);-moz-transform:translate(-1px,0);transform:translate(-1px,0)}20%,40%,60%,80%{-webkit-transform:translate(1px,0);-moz-transform:translate(1px,0);transform:translate(1px,0)}100%{-webkit-transform:translate(0px,0);-moz-transform:translate(0px,0);transform:translate(0px,0)}}.rotateverify-contaniner .control-horizontal{-webkit-animation:rotateverifyHorizontal .6s .2s ease both;-moz-animation:rotateverifyHorizontal .6s .2s ease both;animation:rotateverifyHorizontal .6s .2s ease both}.rotateverify-contaniner .rotate-can-wrap{position:relative;}.rotateverify-contaniner .status-bg{width:100%;height:100%;position:absolute;top:0;left:0;background-color:rgba(0,0,0,.3);background-repeat:no-repeat;background-position:center center;border-radius:100%;display:none;}.rotateverify-contaniner .status-bg.icon-dagou{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAABWCAYAAAAJ3CLTAAAAAXNSR0IArs4c6QAABFZJREFUeAHtncuO00AQRWdALFkiXsM0Az/FArGIhPg3EAvEazEL4AdY824eQsBXhNsTW1gmiduu6vct6cp20qmuuiftOMkoc3DAqM6B9Xq9gp5Dvzq5/VV1jbKhjQOAewSdQrvC3XeVflXkAIAeQ593ER/cflpR22230kH/MoA7tbs637Zl5XfvoKOL19DJjG4uEPwMt3IbuhC6a+PiudyaYT1+Dgign01A8H4+ZzVKCh3NvCX4rJBOF6MA3U3yeHomjsjGAQcdmnP1juH/Bd/OZUPUoxDg04DunjTXPabjkBwcUITu3voxSnCA0EugpFwjoSsbWkI6Qi+BknKNStDdFzZ8TVdmEyydIvQbwYpkYl0HCF3XzyKyEXoRmHSLJHRdP4vIRuhFYNItktB1/SwiG6EXgUm3SEA3kPRbNvc+nW/ZdNGEy9ZBt9hKgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCQIXR9NuIwgbSALSYLQwyHSzwzSBrKQJAhdH024jCBtIAtJgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCTiQ0e1d6CH0KdOj9xt+hbVlxE+GegrJAnne7yPYTHZJejJnordfZfrw6XTEbwxkIUkERe6ax3Vut9ImYp3GMCf0Rg9V+CJgSwkiSTQ786omPAH4OGbgSwkifjQu9X+dGbVhL85Sxr4Zmd6Nx6eBnoH/ue4Go/jpuHDHwNZSBIO+tHgBBJ3F5P/WVh9k/DhlYEsJIm00LsV/1LQQVPw4ZOBLCSJ9NA78A8kXeCx76Hqr/bRo4E03qenO70PX0zQzCH0BpJE1SsfxhjIQpLIY6WP4Bt09EPSFR5b5cpHXwaqZ6UPwXen/NtoUAq/qpUPP25WDb1/EqBJDfhVrPxmoBN+78DZR9htrPR/LW/2Wl75za10wm94pe+A/x2rQBJFvOajwTZP72Po/TEMcRd8VcMn9J72aFszfEIfwR4fwqBbkMbKvzbOneqY0D2drwk+oXtC74fVAJ/Qe5oztyXDV4L+EXny+JZtJjvx8BLhE7oY+yZBSfAJXQl6n6YE+ITe01Le5gyf0JVhj9PlCF8ROv+dxxj48Dgn+IQ+JBNhPwf4hB4B9LYpUsIn9G1EIt6mBP8D8nh/tk/oEQHvmyomfMx1Akn/GtZ9IscLuX1Qfe+LAb+D/g1bSRC6L1TfcaCh8ZXu1tM+cruVTui+MGKPCwGf0GNTXDifJnxCXwgh1cM6+NJTszvta+TghVzMJ4ISfKRZHLyQiwl8OBeQaVyULSFP6EMQKfYTwCf0FKC3zRkRvrsu4Gv6NgipbosAn9BTwZ2aNyB8Qp8yP/X9AeATemqovvMrwid0X9NzGacAn9BzgTm3DgF8Qp9rdm7jF8An9NwgLq1nBnxCX2pyro8D/GPoFbQr3M+yXsm1ftYlcABgD6H70AvoN+R+dfsZdE+QttmH/gVo1WKZD73PfwAAAABJRU5ErkJggg==);}.rotateverify-contaniner .status-bg.icon-guanbi1{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABqCAYAAABUIcSXAAAAAXNSR0IArs4c6QAABOhJREFUeAHt3F1O3DAUBeCZ7qJQUVXdQ6U+tUtBILq79okKUEGwAlaACO0DFV1C+0DPzXBnMpnYiR0nsZ1jyXUm/ok5H8wwBbJYVMrz8/MR6nfU3y9Vjo8qQ3gYOAHke4h6ivqIKrlL5seoy51L4eRr1B+opiJ9+zsTecI7AeS5h3phChznr2TM1gVwwoaka93j4GBrIh94JYAc36DeabCWVrBWX1k4kKe7roVYXjSbSQi6K5KanJSz8UieE10KsTa5Ox0hZFckcTlXKHkBcy3EciJaLBCwD5K4PMmlXjleT4e/w8ENFuFrliZiaQVJ8kJ9bxlm7RKoW+sIcyexzNmsewIglT4C9XW9qvsBsSyZBUCS1Tc+WLDLt+cYZix8zaqBISnf16RqyJtvz2V99OyjSth9CrFesBBiCKRC1qn5l1gH6CDWTjJuJwIivTVeGRchljGd9o5RkHQbxNIk3NpRkXRrxNIkurWTIOnWiKVJ2NtJkXRrxNIkmtsokHRrxNIkttuokHRrxNIkVm2USLpFYiWARKyEkOaOFfXTneLU27k9DSaJpGhzwUoaaS5YWSDljpUVUq5YWSLlhpU1Ui5Ys0BKHWtWSKlizRIpNaxZI6WCRSSVQoswovyFGSJVkPQwNiwiqUxDGwsWkRpw6qemxiJSXcTyeCosIllQTF1jYxHJJNHh/FhYROqA0TZkaCwitQk49A+FRSQHhK5DQ2MRqWvyHuMCYn3AWneofUqByea/T/L4+LKagnBC/HfT3z5CmFugEqntMwshhcDCMl6lwCwitSFpP8KaAotICuDSjoxFJBec+tiRsIhUD97n8cBYRPJBMc0ZCItIpsD7nA+MRaQ+GG1zgSVvZvu+T5L5H9uuxX7PBBBuiNvWYJmy3ONf3sLO08I4DaGGRFpRrW4nRCxj6o4dAyERy9HBOnxgJGJZ0+/YORISsTp6NA4bGYlYjQotJydCih7L9y7NLXH7dQsSZt6get/NGHP/ofqWaO+RGw1UIKQHCH1CLXylMC9arB4fU5ipgZ7uCqxT/tAPbYifZ/FNcZU3NJKuTSxNIkA7FJJujViaRI92aCTdGrE0CY92LCTdGrE0CYd2bCTdGrE0iQ7tVEi6NWJpEpZ2aiTdGrE0iYY2FiTdGrE0iUobG5JujViaBNpYkXSLxEoAiVgJIc0aK/anO8Wpt7N6GkwVSdFmgZU60iywckHKGis3pCyxckXKCit3pCyw5oKUNNbckJLEmitSUlhzR0oCi0jKtGqRR3y/N0ikbSR9FBUWkZSluY0Ci0jNOPWzk2IRqc5hfzwJFpHsKKbeUbGIZGLodn4ULCJ1w2gbNSgWFt9D5e092xQ69gfE2t+6JBa+QO1TCkzmnSMrqSKPEG+KL9dLYsFD1D6lwGQirRPdHCCXEFjH5YpY7BTVtxSYSKSNzc4R8umLdaZQj55KRNphaT7RE+tJVpW/il82L289+4Dez8vl8qd1FDvLBJDTL8kLtShPuP1T+gjUrdu8xQPGE8kxtB5YpY9AfXO45gPGEskhsOpQT6yVD54/l6hXqG2lwAB+41BN3vMYOXb9BuMaYzcvTXggb3htWNInt79hCZQA8txHvUQ1lWt0bL/hlWvjpHxlnaCeoz69VDmWcxvVQBvlMuvMj5Hv2Uvef9BK5l9QmXmKnyT/AS/pCbJI4duRAAAAAElFTkSuQmCC);}.rotateverify-contaniner .control-wrap{position:relative;height:40px;clear:both;border-radius:42px;margin-top:45px;background-color:#f7f7f7;}.rotateverify-contaniner .control-wrap .control-tips{position:relative;width:100%;height:100%;}.rotateverify-contaniner .c-tips-txt{height:40px;line-height:40px;position:absolute;width:100%;text-align:center;top:0;left:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.rotateverify-contaniner .control-btn{position:absolute;left:0;top:0;width:40px;height:40px;border-radius:40px;border:1px solid #e0e0e0;background-color:#fff;}.rotateverify-contaniner .control-bor-wrap{position:absolute;left:0;top:0;width:40;height:40px;border-radius:40px;border:1px solid transparent;}.rotateverify-contaniner .control-bor-active{border:1px solid #1a91ed;}.rotateverify-contaniner .control-bor-err{border:1px solid #e01116;}.rotateverify-contaniner .control-bor-suc{border:1px solid limegreen;}.rotateverify-contaniner .control-btn-active{background:#1a91ed;}.rotateverify-contaniner .control-btn-err{background:#e01116;}.rotateverify-contaniner .control-btn-suc{background-color:limegreen;}.rotateverify-contaniner .control-btn-ico{display:block;width:20px;height:20px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAyCAYAAAATIfj2AAAAAXNSR0IArs4c6QAABAdJREFUaAXtWUloU0EYbhaNTQWhItiIBz2kaYkHodWDBxEUa9OFIBHxoOnB3oSCgoqCKdijC3rpQTBCcYsQaUsE0eJBRIXiQZEuehJzUxCa1mIWvxFHpsPMvCUzh8oLlDfzzbxvvn+Zmb9JQ4P38TzgecDzgOeBVeQBn0prKpUKLC0tXa7VagNkns/nu93Y2Hgxl8tVVO9ZjZniJesGVYsvLi6OwJizdA7a54BtRv+PgRR3+jTFS3T4LcSk+XEYle7p6TnJ4w77pngtDRLqrFarN/r6+nYKB+sAdfAqI4Ro3JHoW1epVB5hL2yQjCthU7xkUaVBgUBgGAfBB5E6iNpeKpWyojErzBQvWTegWnxubu5XPB5/jlRIY15IMDcWjUZL8/PzrwRjUsgUL1lQeWxTRYlEIoWIPKR97lmGx/dNTEy85HDLrgleZYSoIkTgY2trazOM2k0x5knStguRHJuZmSkxuGXTBK9yD7GKIpHIGfRfsxhtw9DI8vLyvUwmY5uPvqub11aEyOLT09PV9vb2pxB/HN0wFcQ8txWLxSC8PsVglk3dvLb2EKuqu7u7C/0C/kTv1rCfEthPT9h37LR18dqOEBWFCHzCyUZSay/FmKcPETwUi8Xu4yT7weCWTV28jnOeKOvs7CT30zOJymYc8zlcumsl41JYB68rg7D5q+Fw+BiM+ipShyjtQgF6RTSmwnTwivaBas0VY6jn9pTL5RcAhVW73+8/Ojk5+WDFSzY69fA63kOsntnZ2S+4n0qIyEEWZ9pdbW1tOcz7zmCWzXp4XaUcqwgRuIrUy7MYbcPQ9ShiM7Tv5OmWt26DiEik1hCMqooEw6gdItwO5oZXi0E41a5DuJALhr63I140xw2vUISIXIahwDwNY5KicRizgIs2Ixqzwtzy/nennOsI4eLchA1PjmThkY3o3HRzZNfL68ogUlXj4ryLVNsiSh0Y8xYXL6nOHX108Lq6h5qamoZhzIBILYz5htNpfz6fd3T3EC4dvI73kK6qmHeGLl5HKdff378VERiDGKEjEJkRN/866OS1bdDg4OAa1G05pNpG3rt/+1MdHR2XJGNSWDev7T3U0tJyDcYcFilD1IqhUOjA6OjogmhchenmFaYOLwD5fQSYrGp2/a2PCV7LlEsmk1FE4BZvJO1j7Lybr7BM8Soj1NvbG0Y99QapFqcGcM/HhUJBWPZw81Z0TfGSRYS3PF0dlQDZ5DJjPuPeSNO5Tp6meIkGZcohnU5IhP4MBoMp/PDl6IsQymWK19IgKoB/ooI+NT4+/o7H6+3r4FVGCAKzvEh4N4tDQHpI8PMlfVO86j2EAvMCfmPFmfCvbssSTCLSNmyK17YAb6LnAc8DngdWrQd+A6CJYdIFu4L0AAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;margin:10px;}.rotateverify-contaniner .control-btn-active .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAyCAYAAAATIfj2AAAAAXNSR0IArs4c6QAAAoRJREFUaAXtmb9OVFEQxjcQKGyspIPK2FvrA+gDAC8AL6C+gGIidvx5ABtqeABCDZSEFjtNLLTRwoLo+jvZJcBhvpnrLlPs5kzyhT3z5/vOzM1y757b6zVrE2gTaBNoE5iWCfT7/VnwAXwbonyeHbe/wgHunTfcF6KboLZPYWGQAGEKbyDb6yFcroxl62GxkwBhCq8jOQg5wr+JPQ0JREIWr5C7diP8ESj7TODhdXb3T9Sl8IY7QPgBOAfKDkISIwGyFF5D6q4L8Sfgp+oI/5u7VbEnizdWJgPxZaehS2LPOxFVSVm8lYy9RHzbaeorsQW70vdm8fqqRBGeA8dA2RGBmZCoSqAmhbeSsZeIL4LvQNl7u9L3QpbC66sOo4i/AH9FR8X/shNRlZTFW8nYS8TfioaK+wdYsit9L3UpvL4qUYRnwCFQdkpgPiSqEqhJ4a1k7CXij8AXoGzXrvS9kKXw+qrDKOLPQLkPKVvtRFQlQZbCW8nYS8RfqW7w/wKP7Urfm8Xrqw6jiO8DZXudSIwkCFN4DanbLoSXwB/R0dnt7O6rUXj/+84utrOFX3Gdi5ou7ixerc0UX4srU9zjfIdSeHUnRNhwyn+jLN6omeh+seMSiCDNpPAKuYEb0ZQ7ehav20wJIvwOKCtP46M+y6Xwug2x2el52qaZ6HfLhjsNEcziFXIDN6Lll+UJUHZEQN2LJDc1KbxS8CqA8PScKdDMClBWnrZHPfVJ4b26COZfNjs953I0k3LCmcVrXpGbToS9M+gL4hln2yPz3ty7+ZkNq9ceE/v2QTW0Zk6go9MZ1Fi8oTzCm6C2iX6DV78LLQ1mvGO9F97wCrWENoE2gTaBiZ/AP+8/LMb6T9MeAAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;}.rotateverify-contaniner .control-btn-err .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAABqCAYAAABUIcSXAAAAAXNSR0IArs4c6QAABOhJREFUeAHt3F1O3DAUBeCZ7qJQUVXdQ6U+tUtBILq79okKUEGwAlaACO0DFV1C+0DPzXBnMpnYiR0nsZ1jyXUm/ok5H8wwBbJYVMrz8/MR6nfU3y9Vjo8qQ3gYOAHke4h6ivqIKrlL5seoy51L4eRr1B+opiJ9+zsTecI7AeS5h3phChznr2TM1gVwwoaka93j4GBrIh94JYAc36DeabCWVrBWX1k4kKe7roVYXjSbSQi6K5KanJSz8UieE10KsTa5Ox0hZFckcTlXKHkBcy3EciJaLBCwD5K4PMmlXjleT4e/w8ENFuFrliZiaQVJ8kJ9bxlm7RKoW+sIcyexzNmsewIglT4C9XW9qvsBsSyZBUCS1Tc+WLDLt+cYZix8zaqBISnf16RqyJtvz2V99OyjSth9CrFesBBiCKRC1qn5l1gH6CDWTjJuJwIivTVeGRchljGd9o5RkHQbxNIk3NpRkXRrxNIkurWTIOnWiKVJ2NtJkXRrxNIkmtsokHRrxNIkttuokHRrxNIkVm2USLpFYiWARKyEkOaOFfXTneLU27k9DSaJpGhzwUoaaS5YWSDljpUVUq5YWSLlhpU1Ui5Ys0BKHWtWSKlizRIpNaxZI6WCRSSVQoswovyFGSJVkPQwNiwiqUxDGwsWkRpw6qemxiJSXcTyeCosIllQTF1jYxHJJNHh/FhYROqA0TZkaCwitQk49A+FRSQHhK5DQ2MRqWvyHuMCYn3AWneofUqByea/T/L4+LKagnBC/HfT3z5CmFugEqntMwshhcDCMl6lwCwitSFpP8KaAotICuDSjoxFJBec+tiRsIhUD97n8cBYRPJBMc0ZCItIpsD7nA+MRaQ+GG1zgSVvZvu+T5L5H9uuxX7PBBBuiNvWYJmy3ONf3sLO08I4DaGGRFpRrW4nRCxj6o4dAyERy9HBOnxgJGJZ0+/YORISsTp6NA4bGYlYjQotJydCih7L9y7NLXH7dQsSZt6get/NGHP/ofqWaO+RGw1UIKQHCH1CLXylMC9arB4fU5ipgZ7uCqxT/tAPbYifZ/FNcZU3NJKuTSxNIkA7FJJujViaRI92aCTdGrE0CY92LCTdGrE0CYd2bCTdGrE0iQ7tVEi6NWJpEpZ2aiTdGrE0iYY2FiTdGrE0iUobG5JujViaBNpYkXSLxEoAiVgJIc0aK/anO8Wpt7N6GkwVSdFmgZU60iywckHKGis3pCyxckXKCit3pCyw5oKUNNbckJLEmitSUlhzR0oCi0jKtGqRR3y/N0ikbSR9FBUWkZSluY0Ci0jNOPWzk2IRqc5hfzwJFpHsKKbeUbGIZGLodn4ULCJ1w2gbNSgWFt9D5e092xQ69gfE2t+6JBa+QO1TCkzmnSMrqSKPEG+KL9dLYsFD1D6lwGQirRPdHCCXEFjH5YpY7BTVtxSYSKSNzc4R8umLdaZQj55KRNphaT7RE+tJVpW/il82L289+4Dez8vl8qd1FDvLBJDTL8kLtShPuP1T+gjUrdu8xQPGE8kxtB5YpY9AfXO45gPGEskhsOpQT6yVD54/l6hXqG2lwAB+41BN3vMYOXb9BuMaYzcvTXggb3htWNInt79hCZQA8txHvUQ1lWt0bL/hlWvjpHxlnaCeoz69VDmWcxvVQBvlMuvMj5Hv2Uvef9BK5l9QmXmKnyT/AS/pCbJI4duRAAAAAElFTkSuQmCC) no-repeat center center;background-size:100% 100%;}.rotateverify-contaniner .control-btn-suc .control-btn-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAABWCAYAAAAJ3CLTAAAAAXNSR0IArs4c6QAABFZJREFUeAHtncuO00AQRWdALFkiXsM0Az/FArGIhPg3EAvEazEL4AdY824eQsBXhNsTW1gmiduu6vct6cp20qmuuiftOMkoc3DAqM6B9Xq9gp5Dvzq5/VV1jbKhjQOAewSdQrvC3XeVflXkAIAeQ593ER/cflpR22230kH/MoA7tbs637Zl5XfvoKOL19DJjG4uEPwMt3IbuhC6a+PiudyaYT1+Dgign01A8H4+ZzVKCh3NvCX4rJBOF6MA3U3yeHomjsjGAQcdmnP1juH/Bd/OZUPUoxDg04DunjTXPabjkBwcUITu3voxSnCA0EugpFwjoSsbWkI6Qi+BknKNStDdFzZ8TVdmEyydIvQbwYpkYl0HCF3XzyKyEXoRmHSLJHRdP4vIRuhFYNItktB1/SwiG6EXgUm3SEA3kPRbNvc+nW/ZdNGEy9ZBt9hKgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCQIXR9NuIwgbSALSYLQwyHSzwzSBrKQJAhdH024jCBtIAtJgtDDIdLPDNIGspAkCF0fTbiMIG0gC0mC0MMh0s8M0gaykCTiQ0e1d6CH0KdOj9xt+hbVlxE+GegrJAnne7yPYTHZJejJnordfZfrw6XTEbwxkIUkERe6ax3Vut9ImYp3GMCf0Rg9V+CJgSwkiSTQ786omPAH4OGbgSwkifjQu9X+dGbVhL85Sxr4Zmd6Nx6eBnoH/ue4Go/jpuHDHwNZSBIO+tHgBBJ3F5P/WVh9k/DhlYEsJIm00LsV/1LQQVPw4ZOBLCSJ9NA78A8kXeCx76Hqr/bRo4E03qenO70PX0zQzCH0BpJE1SsfxhjIQpLIY6WP4Bt09EPSFR5b5cpHXwaqZ6UPwXen/NtoUAq/qpUPP25WDb1/EqBJDfhVrPxmoBN+78DZR9htrPR/LW/2Wl75za10wm94pe+A/x2rQBJFvOajwTZP72Po/TEMcRd8VcMn9J72aFszfEIfwR4fwqBbkMbKvzbOneqY0D2drwk+oXtC74fVAJ/Qe5oztyXDV4L+EXny+JZtJjvx8BLhE7oY+yZBSfAJXQl6n6YE+ITe01Le5gyf0JVhj9PlCF8ROv+dxxj48Dgn+IQ+JBNhPwf4hB4B9LYpUsIn9G1EIt6mBP8D8nh/tk/oEQHvmyomfMx1Akn/GtZ9IscLuX1Qfe+LAb+D/g1bSRC6L1TfcaCh8ZXu1tM+cruVTui+MGKPCwGf0GNTXDifJnxCXwgh1cM6+NJTszvta+TghVzMJ4ISfKRZHLyQiwl8OBeQaVyULSFP6EMQKfYTwCf0FKC3zRkRvrsu4Gv6NgipbosAn9BTwZ2aNyB8Qp8yP/X9AeATemqovvMrwid0X9NzGacAn9BzgTm3DgF8Qp9rdm7jF8An9NwgLq1nBnxCX2pyro8D/GPoFbQr3M+yXsm1ftYlcABgD6H70AvoN+R+dfsZdE+QttmH/gVo1WKZD73PfwAAAABJRU5ErkJggg==) no-repeat center center;background-size:100% 100%;}'
	// 使用原生 DOM API 创建和注入样式，不依赖 jQuery
	try {
		// 检查样式是否已存在，避免重复注入
		if (!document.getElementById('rotateverify-styles')) {
			const styleElement = document.createElement('style');
			styleElement.id = 'rotateverify-styles';
			styleElement.type = 'text/css';
			styleElement.textContent = inlineCss;

			// 注入到 head
			const head = document.head || document.getElementsByTagName('head')[0];
			if (head) {
				head.appendChild(styleElement);
			}
		}
	} catch (error) {
		console.warn('Failed to inject RotateVerify styles:', error);
	}
    _global = (function(){ return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = RotateVerify;
    } else if (typeof define === "function" && define.amd) {
        define(() =>RotateVerify);
    } else {
        !('RotateVerify' in _global) && (_global.RotateVerify = RotateVerify);
    }
}());