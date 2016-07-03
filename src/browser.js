/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var common_1 = require('@angular/common');
var core_1 = require('@angular/core');
var core_private_1 = require('../core_private');
var animation_driver_1 = require('../src/dom/animation_driver');
var web_animations_driver_1 = require('../src/dom/web_animations_driver');
var browser_adapter_1 = require('./browser/browser_adapter');
var browser_platform_location_1 = require('./browser/location/browser_platform_location');
var testability_1 = require('./browser/testability');
var ng_probe_1 = require('./dom/debug/ng_probe');
var dom_adapter_1 = require('./dom/dom_adapter');
var dom_renderer_1 = require('./dom/dom_renderer');
var dom_tokens_1 = require('./dom/dom_tokens');
var dom_events_1 = require('./dom/events/dom_events');
var event_manager_1 = require('./dom/events/event_manager');
var hammer_gestures_1 = require('./dom/events/hammer_gestures');
var key_events_1 = require('./dom/events/key_events');
var shared_styles_host_1 = require('./dom/shared_styles_host');
var lang_1 = require('./facade/lang');
var dom_sanitization_service_1 = require('./security/dom_sanitization_service');
var BROWSER_PLATFORM_MARKER = new core_1.OpaqueToken('BrowserPlatformMarker');
/**
 * A set of providers to initialize the Angular platform in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link platform}.
 *
 * @experimental API related to bootstrapping are still under review.
 */
exports.BROWSER_PLATFORM_PROVIDERS = [
    { provide: BROWSER_PLATFORM_MARKER, useValue: true }, core_1.PLATFORM_COMMON_PROVIDERS,
    { provide: core_1.PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true },
    { provide: common_1.PlatformLocation, useClass: browser_platform_location_1.BrowserPlatformLocation }
];
/**
 * @security Replacing built-in sanitization providers exposes the application to XSS risks.
 * Attacker-controlled data introduced by an unsanitized provider could expose your
 * application to XSS risks. For more detail, see the [Security Guide](http://g.co/ng/security).
 * @experimental
 */
exports.BROWSER_SANITIZATION_PROVIDERS = [
    { provide: core_1.SanitizationService, useExisting: dom_sanitization_service_1.DomSanitizationService },
    { provide: dom_sanitization_service_1.DomSanitizationService, useClass: dom_sanitization_service_1.DomSanitizationServiceImpl },
];
/**
 * A set of providers to initialize an Angular application in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
 *
 * @experimental API related to bootstrapping are still under review.
 */
exports.BROWSER_APP_PROVIDERS = [
    core_1.APPLICATION_COMMON_PROVIDERS, common_1.FORM_PROVIDERS, exports.BROWSER_SANITIZATION_PROVIDERS,
    { provide: core_1.ExceptionHandler, useFactory: _exceptionHandler, deps: [] },
    { provide: dom_tokens_1.DOCUMENT, useFactory: _document, deps: [] },
    { provide: event_manager_1.EVENT_MANAGER_PLUGINS, useClass: dom_events_1.DomEventsPlugin, multi: true },
    { provide: event_manager_1.EVENT_MANAGER_PLUGINS, useClass: key_events_1.KeyEventsPlugin, multi: true },
    { provide: event_manager_1.EVENT_MANAGER_PLUGINS, useClass: hammer_gestures_1.HammerGesturesPlugin, multi: true },
    { provide: hammer_gestures_1.HAMMER_GESTURE_CONFIG, useClass: hammer_gestures_1.HammerGestureConfig },
    { provide: dom_renderer_1.DomRootRenderer, useClass: dom_renderer_1.DomRootRenderer_ },
    { provide: core_1.RootRenderer, useExisting: dom_renderer_1.DomRootRenderer },
    { provide: shared_styles_host_1.SharedStylesHost, useExisting: shared_styles_host_1.DomSharedStylesHost },
    { provide: animation_driver_1.AnimationDriver, useFactory: _resolveDefaultAnimationDriver }, shared_styles_host_1.DomSharedStylesHost,
    core_1.Testability, event_manager_1.EventManager, ng_probe_1.ELEMENT_PROBE_PROVIDERS
];
/**
 * @experimental API related to bootstrapping are still under review.
 */
function browserPlatform() {
    if (lang_1.isBlank(core_1.getPlatform())) {
        core_1.createPlatform(core_1.ReflectiveInjector.resolveAndCreate(exports.BROWSER_PLATFORM_PROVIDERS));
    }
    return core_1.assertPlatform(BROWSER_PLATFORM_MARKER);
}
exports.browserPlatform = browserPlatform;
function initDomAdapter() {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    core_private_1.wtfInit();
    testability_1.BrowserGetTestability.init();
}
exports.initDomAdapter = initDomAdapter;
function _exceptionHandler() {
    return new core_1.ExceptionHandler(dom_adapter_1.getDOM());
}
exports._exceptionHandler = _exceptionHandler;
function _document() {
    return dom_adapter_1.getDOM().defaultDoc();
}
exports._document = _document;
function _resolveDefaultAnimationDriver() {
    if (dom_adapter_1.getDOM().supportsWebAnimation()) {
        return new web_animations_driver_1.WebAnimationsDriver();
    }
    return animation_driver_1.AnimationDriver.NOOP;
}
exports._resolveDefaultAnimationDriver = _resolveDefaultAnimationDriver;
var BrowserModule = (function () {
    function BrowserModule() {
    }
    /** @nocollapse */
    BrowserModule.decorators = [
        { type: core_1.AppModule, args: [{
                    providers: [
                        exports.BROWSER_APP_PROVIDERS,
                    ],
                    directives: common_1.COMMON_DIRECTIVES,
                    pipes: common_1.COMMON_PIPES
                },] },
    ];
    return BrowserModule;
}());
exports.BrowserModule = BrowserModule;
/**
 * Creates an instance of an `@AppModule` for the browser platform
 * for offline compilation.
 *
 * ## Simple Example
 *
 * ```typescript
 * my_module.ts:
 *
 * @AppModule({
 *   modules: [BrowserModule]
 * })
 * class MyModule {}
 *
 * main.ts:
 * import {MyModuleNgFactory} from './my_module.ngfactory';
 * import {bootstrapModuleFactory} from '@angular/platform-browser';
 *
 * let moduleRef = bootstrapModuleFactory(MyModuleNgFactory);
 * ```
 * @stable
 */
function bootstrapModuleFactory(moduleFactory) {
    var platformInjector = browserPlatform().injector;
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the AppModuleFactory.
    var ngZone = new core_1.NgZone({ enableLongStackTrace: core_1.isDevMode() });
    var ngZoneInjector = core_1.ReflectiveInjector.resolveAndCreate([{ provide: core_1.NgZone, useValue: ngZone }], platformInjector);
    return ngZone.run(function () { return moduleFactory.create(ngZoneInjector); });
}
exports.bootstrapModuleFactory = bootstrapModuleFactory;
//# sourceMappingURL=browser.js.map