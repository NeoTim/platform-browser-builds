/**
 * @license Angular v7.0.0-beta.0+32.sha-7d006c5
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */

import { __decorate, __param, __metadata } from 'tslib';
import { AnimationBuilder, AnimationFactory, sequence } from '@angular/animations';
import { Inject, Injectable, RendererFactory2, ViewEncapsulation, NgZone, InjectionToken, NgModule } from '@angular/core';
import { DOCUMENT, ɵDomRendererFactory2, BrowserModule } from '@angular/platform-browser';
import { ɵAnimationEngine, AnimationDriver, ɵAnimationStyleNormalizer, ɵCssKeyframesDriver, ɵNoopAnimationDriver, ɵWebAnimationsDriver, ɵWebAnimationsStyleNormalizer, ɵsupportsWebAnimations } from '@angular/animations/browser';
import { DOCUMENT as DOCUMENT$1 } from '@angular/common';

let BrowserAnimationBuilder = class BrowserAnimationBuilder extends AnimationBuilder {
    constructor(rootRenderer, doc) {
        super();
        this._nextAnimationId = 0;
        const typeData = {
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] }
        };
        this._renderer = rootRenderer.createRenderer(doc.body, typeData);
    }
    build(animation) {
        const id = this._nextAnimationId.toString();
        this._nextAnimationId++;
        const entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
};
BrowserAnimationBuilder = __decorate([
    Injectable(),
    __param(1, Inject(DOCUMENT)),
    __metadata("design:paramtypes", [RendererFactory2, Object])
], BrowserAnimationBuilder);
class BrowserAnimationFactory extends AnimationFactory {
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
class RendererAnimationPlayer {
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    _command(command, ...args) {
        return issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    onDone(fn) { this._listen('done', fn); }
    onStart(fn) { this._listen('start', fn); }
    onDestroy(fn) { this._listen('destroy', fn); }
    init() { this._command('init'); }
    hasStarted() { return this._started; }
    play() {
        this._command('play');
        this._started = true;
    }
    pause() { this._command('pause'); }
    restart() { this._command('restart'); }
    finish() { this._command('finish'); }
    destroy() { this._command('destroy'); }
    reset() { this._command('reset'); }
    setPosition(p) { this._command('setPosition', p); }
    getPosition() { return 0; }
}
function issueAnimationCommand(renderer, element, id, command, args) {
    return renderer.setProperty(element, `@@${id}:${command}`, args);
}

const ANIMATION_PREFIX = '@';
const DISABLE_ANIMATIONS_FLAG = '@.disabled';
let AnimationRendererFactory = class AnimationRendererFactory {
    constructor(delegate, engine, _zone) {
        this.delegate = delegate;
        this.engine = engine;
        this._zone = _zone;
        this._currentId = 0;
        this._microtaskId = 1;
        this._animationCallbacksBuffer = [];
        this._rendererCache = new Map();
        this._cdRecurDepth = 0;
        this.promise = Promise.resolve(0);
        engine.onRemovalComplete = (element, delegate) => {
            // Note: if an component element has a leave animation, and the component
            // a host leave animation, the view engine will call `removeChild` for the parent
            // component renderer as well as for the child component renderer.
            // Therefore, we need to check if we already removed the element.
            if (delegate && delegate.parentNode(element)) {
                delegate.removeChild(element.parentNode, element);
            }
        };
    }
    createRenderer(hostElement, type) {
        const EMPTY_NAMESPACE_ID = '';
        // cache the delegates to find out which cached delegate can
        // be used by which cached renderer
        const delegate = this.delegate.createRenderer(hostElement, type);
        if (!hostElement || !type || !type.data || !type.data['animation']) {
            let renderer = this._rendererCache.get(delegate);
            if (!renderer) {
                renderer = new BaseAnimationRenderer(EMPTY_NAMESPACE_ID, delegate, this.engine);
                // only cache this result when the base renderer is used
                this._rendererCache.set(delegate, renderer);
            }
            return renderer;
        }
        const componentId = type.id;
        const namespaceId = type.id + '-' + this._currentId;
        this._currentId++;
        this.engine.register(namespaceId, hostElement);
        const animationTriggers = type.data['animation'];
        animationTriggers.forEach(trigger => this.engine.registerTrigger(componentId, namespaceId, hostElement, trigger.name, trigger));
        return new AnimationRenderer(this, namespaceId, delegate, this.engine);
    }
    begin() {
        this._cdRecurDepth++;
        if (this.delegate.begin) {
            this.delegate.begin();
        }
    }
    _scheduleCountTask() {
        // always use promise to schedule microtask instead of use Zone
        this.promise.then(() => { this._microtaskId++; });
    }
    /** @internal */
    scheduleListenerCallback(count, fn, data) {
        if (count >= 0 && count < this._microtaskId) {
            this._zone.run(() => fn(data));
            return;
        }
        if (this._animationCallbacksBuffer.length == 0) {
            Promise.resolve(null).then(() => {
                this._zone.run(() => {
                    this._animationCallbacksBuffer.forEach(tuple => {
                        const [fn, data] = tuple;
                        fn(data);
                    });
                    this._animationCallbacksBuffer = [];
                });
            });
        }
        this._animationCallbacksBuffer.push([fn, data]);
    }
    end() {
        this._cdRecurDepth--;
        // this is to prevent animations from running twice when an inner
        // component does CD when a parent component insted has inserted it
        if (this._cdRecurDepth == 0) {
            this._zone.runOutsideAngular(() => {
                this._scheduleCountTask();
                this.engine.flush(this._microtaskId);
            });
        }
        if (this.delegate.end) {
            this.delegate.end();
        }
    }
    whenRenderingDone() { return this.engine.whenRenderingDone(); }
};
AnimationRendererFactory = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [RendererFactory2, ɵAnimationEngine, NgZone])
], AnimationRendererFactory);
class BaseAnimationRenderer {
    constructor(namespaceId, delegate, engine) {
        this.namespaceId = namespaceId;
        this.delegate = delegate;
        this.engine = engine;
        this.destroyNode = this.delegate.destroyNode ? (n) => delegate.destroyNode(n) : null;
    }
    get data() { return this.delegate.data; }
    destroy() {
        this.engine.destroy(this.namespaceId, this.delegate);
        this.delegate.destroy();
    }
    createElement(name, namespace) {
        return this.delegate.createElement(name, namespace);
    }
    createComment(value) { return this.delegate.createComment(value); }
    createText(value) { return this.delegate.createText(value); }
    appendChild(parent, newChild) {
        this.delegate.appendChild(parent, newChild);
        this.engine.onInsert(this.namespaceId, newChild, parent, false);
    }
    insertBefore(parent, newChild, refChild) {
        this.delegate.insertBefore(parent, newChild, refChild);
        this.engine.onInsert(this.namespaceId, newChild, parent, true);
    }
    removeChild(parent, oldChild) {
        this.engine.onRemove(this.namespaceId, oldChild, this.delegate);
    }
    selectRootElement(selectorOrNode) { return this.delegate.selectRootElement(selectorOrNode); }
    parentNode(node) { return this.delegate.parentNode(node); }
    nextSibling(node) { return this.delegate.nextSibling(node); }
    setAttribute(el, name, value, namespace) {
        this.delegate.setAttribute(el, name, value, namespace);
    }
    removeAttribute(el, name, namespace) {
        this.delegate.removeAttribute(el, name, namespace);
    }
    addClass(el, name) { this.delegate.addClass(el, name); }
    removeClass(el, name) { this.delegate.removeClass(el, name); }
    setStyle(el, style, value, flags) {
        this.delegate.setStyle(el, style, value, flags);
    }
    removeStyle(el, style, flags) {
        this.delegate.removeStyle(el, style, flags);
    }
    setProperty(el, name, value) {
        if (name.charAt(0) == ANIMATION_PREFIX && name == DISABLE_ANIMATIONS_FLAG) {
            this.disableAnimations(el, !!value);
        }
        else {
            this.delegate.setProperty(el, name, value);
        }
    }
    setValue(node, value) { this.delegate.setValue(node, value); }
    listen(target, eventName, callback) {
        return this.delegate.listen(target, eventName, callback);
    }
    disableAnimations(element, value) {
        this.engine.disableAnimations(element, value);
    }
}
class AnimationRenderer extends BaseAnimationRenderer {
    constructor(factory, namespaceId, delegate, engine) {
        super(namespaceId, delegate, engine);
        this.factory = factory;
        this.namespaceId = namespaceId;
    }
    setProperty(el, name, value) {
        if (name.charAt(0) == ANIMATION_PREFIX) {
            if (name.charAt(1) == '.' && name == DISABLE_ANIMATIONS_FLAG) {
                value = value === undefined ? true : !!value;
                this.disableAnimations(el, value);
            }
            else {
                this.engine.process(this.namespaceId, el, name.substr(1), value);
            }
        }
        else {
            this.delegate.setProperty(el, name, value);
        }
    }
    listen(target, eventName, callback) {
        if (eventName.charAt(0) == ANIMATION_PREFIX) {
            const element = resolveElementFromTarget(target);
            let name = eventName.substr(1);
            let phase = '';
            // @listener.phase is for trigger animation callbacks
            // @@listener is for animation builder callbacks
            if (name.charAt(0) != ANIMATION_PREFIX) {
                [name, phase] = parseTriggerCallbackName(name);
            }
            return this.engine.listen(this.namespaceId, element, name, phase, event => {
                const countId = event['_data'] || -1;
                this.factory.scheduleListenerCallback(countId, callback, event);
            });
        }
        return this.delegate.listen(target, eventName, callback);
    }
}
function resolveElementFromTarget(target) {
    switch (target) {
        case 'body':
            return document.body;
        case 'document':
            return document;
        case 'window':
            return window;
        default:
            return target;
    }
}
function parseTriggerCallbackName(triggerName) {
    const dotIndex = triggerName.indexOf('.');
    const trigger = triggerName.substring(0, dotIndex);
    const phase = triggerName.substr(dotIndex + 1);
    return [trigger, phase];
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let InjectableAnimationEngine = class InjectableAnimationEngine extends ɵAnimationEngine {
    constructor(doc, driver, normalizer) {
        super(doc.body, driver, normalizer);
    }
};
InjectableAnimationEngine = __decorate([
    Injectable(),
    __param(0, Inject(DOCUMENT$1)),
    __metadata("design:paramtypes", [Object, AnimationDriver, ɵAnimationStyleNormalizer])
], InjectableAnimationEngine);
function instantiateSupportedAnimationDriver() {
    return ɵsupportsWebAnimations() ? new ɵWebAnimationsDriver() : new ɵCssKeyframesDriver();
}
function instantiateDefaultStyleNormalizer() {
    return new ɵWebAnimationsStyleNormalizer();
}
function instantiateRendererFactory(renderer, engine, zone) {
    return new AnimationRendererFactory(renderer, engine, zone);
}
/**
 * @experimental Animation support is experimental.
 */
const ANIMATION_MODULE_TYPE = new InjectionToken('AnimationModuleType');
const SHARED_ANIMATION_PROVIDERS = [
    { provide: AnimationBuilder, useClass: BrowserAnimationBuilder },
    { provide: ɵAnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer },
    { provide: ɵAnimationEngine, useClass: InjectableAnimationEngine }, {
        provide: RendererFactory2,
        useFactory: instantiateRendererFactory,
        deps: [ɵDomRendererFactory2, ɵAnimationEngine, NgZone]
    }
];
/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserModule.
 */
const BROWSER_ANIMATIONS_PROVIDERS = [
    { provide: AnimationDriver, useFactory: instantiateSupportedAnimationDriver },
    { provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations' }, ...SHARED_ANIMATION_PROVIDERS
];
/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
const BROWSER_NOOP_ANIMATIONS_PROVIDERS = [
    { provide: AnimationDriver, useClass: ɵNoopAnimationDriver },
    { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' }, ...SHARED_ANIMATION_PROVIDERS
];

/**
 * @experimental Animation support is experimental.
 */
let BrowserAnimationsModule = class BrowserAnimationsModule {
};
BrowserAnimationsModule = __decorate([
    NgModule({
        exports: [BrowserModule],
        providers: BROWSER_ANIMATIONS_PROVIDERS,
    })
], BrowserAnimationsModule);
/**
 * @experimental Animation support is experimental.
 */
let NoopAnimationsModule = class NoopAnimationsModule {
};
NoopAnimationsModule = __decorate([
    NgModule({
        exports: [BrowserModule],
        providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
    })
], NoopAnimationsModule);

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export { BrowserAnimationsModule, NoopAnimationsModule, ANIMATION_MODULE_TYPE, BrowserAnimationBuilder as ɵBrowserAnimationBuilder, BrowserAnimationFactory as ɵBrowserAnimationFactory, AnimationRenderer as ɵAnimationRenderer, AnimationRendererFactory as ɵAnimationRendererFactory };
//# sourceMappingURL=animations.js.map
