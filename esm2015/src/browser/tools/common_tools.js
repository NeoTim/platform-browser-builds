/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef } from '@angular/core';
import { getDOM } from '../../dom/dom_adapter';
import { window } from './browser';
export class ChangeDetectionPerfRecord {
    constructor(msPerTick, numTicks) {
        this.msPerTick = msPerTick;
        this.numTicks = numTicks;
    }
}
/**
 * Entry point for all Angular profiling-related debug tools. This object
 * corresponds to the `ng.profiler` in the dev console.
 */
export class AngularProfiler {
    constructor(ref) { this.appRef = ref.injector.get(ApplicationRef); }
    // tslint:disable:no-console
    /**
     * Exercises change detection in a loop and then prints the average amount of
     * time in milliseconds how long a single round of change detection takes for
     * the current state of the UI. It runs a minimum of 5 rounds for a minimum
     * of 500 milliseconds.
     *
     * Optionally, a user may pass a `config` parameter containing a map of
     * options. Supported options are:
     *
     * `record` (boolean) - causes the profiler to record a CPU profile while
     * it exercises the change detector. Example:
     *
     * ```
     * ng.profiler.timeChangeDetection({record: true})
     * ```
     */
    timeChangeDetection(config) {
        const record = config && config['record'];
        const profileName = 'Change Detection';
        // Profiler is not available in Android browsers, nor in IE 9 without dev tools opened
        const isProfilerAvailable = window.console.profile != null;
        if (record && isProfilerAvailable) {
            window.console.profile(profileName);
        }
        const start = getDOM().performanceNow();
        let numTicks = 0;
        while (numTicks < 5 || (getDOM().performanceNow() - start) < 500) {
            this.appRef.tick();
            numTicks++;
        }
        const end = getDOM().performanceNow();
        if (record && isProfilerAvailable) {
            // need to cast to <any> because type checker thinks there's no argument
            // while in fact there is:
            //
            // https://developer.mozilla.org/en-US/docs/Web/API/Console/profileEnd
            window.console.profileEnd(profileName);
        }
        const msPerTick = (end - start) / numTicks;
        window.console.log(`ran ${numTicks} change detection cycles`);
        window.console.log(`${msPerTick.toFixed(2)} ms per check`);
        return new ChangeDetectionPerfRecord(msPerTick, numTicks);
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3Rvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvYnJvd3Nlci90b29scy9jb21tb25fdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBZSxNQUFNLGVBQWUsQ0FBQztBQUMzRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVqQyxNQUFNLE9BQU8seUJBQXlCO0lBQ3BDLFlBQW1CLFNBQWlCLEVBQVMsUUFBZ0I7UUFBMUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQVE7SUFBRyxDQUFDO0NBQ2xFO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFHMUIsWUFBWSxHQUFzQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXZGLDRCQUE0QjtJQUM1Qjs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxtQkFBbUIsQ0FBQyxNQUFXO1FBQzdCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUM7UUFDdkMsc0ZBQXNGO1FBQ3RGLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQzNELElBQUksTUFBTSxJQUFJLG1CQUFtQixFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDeEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLGNBQWMsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25CLFFBQVEsRUFBRSxDQUFDO1NBQ1o7UUFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QyxJQUFJLE1BQU0sSUFBSSxtQkFBbUIsRUFBRTtZQUNqQyx3RUFBd0U7WUFDeEUsMEJBQTBCO1lBQzFCLEVBQUU7WUFDRixzRUFBc0U7WUFDaEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0M7UUFDRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxRQUFRLDBCQUEwQixDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUzRCxPQUFPLElBQUkseUJBQXlCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcHBsaWNhdGlvblJlZiwgQ29tcG9uZW50UmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Z2V0RE9NfSBmcm9tICcuLi8uLi9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHt3aW5kb3d9IGZyb20gJy4vYnJvd3Nlcic7XG5cbmV4cG9ydCBjbGFzcyBDaGFuZ2VEZXRlY3Rpb25QZXJmUmVjb3JkIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1zUGVyVGljazogbnVtYmVyLCBwdWJsaWMgbnVtVGlja3M6IG51bWJlcikge31cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIEFuZ3VsYXIgcHJvZmlsaW5nLXJlbGF0ZWQgZGVidWcgdG9vbHMuIFRoaXMgb2JqZWN0XG4gKiBjb3JyZXNwb25kcyB0byB0aGUgYG5nLnByb2ZpbGVyYCBpbiB0aGUgZGV2IGNvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmd1bGFyUHJvZmlsZXIge1xuICBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmO1xuXG4gIGNvbnN0cnVjdG9yKHJlZjogQ29tcG9uZW50UmVmPGFueT4pIHsgdGhpcy5hcHBSZWYgPSByZWYuaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTsgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGVcbiAgLyoqXG4gICAqIEV4ZXJjaXNlcyBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbG9vcCBhbmQgdGhlbiBwcmludHMgdGhlIGF2ZXJhZ2UgYW1vdW50IG9mXG4gICAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGhvdyBsb25nIGEgc2luZ2xlIHJvdW5kIG9mIGNoYW5nZSBkZXRlY3Rpb24gdGFrZXMgZm9yXG4gICAqIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBVSS4gSXQgcnVucyBhIG1pbmltdW0gb2YgNSByb3VuZHMgZm9yIGEgbWluaW11bVxuICAgKiBvZiA1MDAgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBPcHRpb25hbGx5LCBhIHVzZXIgbWF5IHBhc3MgYSBgY29uZmlnYCBwYXJhbWV0ZXIgY29udGFpbmluZyBhIG1hcCBvZlxuICAgKiBvcHRpb25zLiBTdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gICAqXG4gICAqIGByZWNvcmRgIChib29sZWFuKSAtIGNhdXNlcyB0aGUgcHJvZmlsZXIgdG8gcmVjb3JkIGEgQ1BVIHByb2ZpbGUgd2hpbGVcbiAgICogaXQgZXhlcmNpc2VzIHRoZSBjaGFuZ2UgZGV0ZWN0b3IuIEV4YW1wbGU6XG4gICAqXG4gICAqIGBgYFxuICAgKiBuZy5wcm9maWxlci50aW1lQ2hhbmdlRGV0ZWN0aW9uKHtyZWNvcmQ6IHRydWV9KVxuICAgKiBgYGBcbiAgICovXG4gIHRpbWVDaGFuZ2VEZXRlY3Rpb24oY29uZmlnOiBhbnkpOiBDaGFuZ2VEZXRlY3Rpb25QZXJmUmVjb3JkIHtcbiAgICBjb25zdCByZWNvcmQgPSBjb25maWcgJiYgY29uZmlnWydyZWNvcmQnXTtcbiAgICBjb25zdCBwcm9maWxlTmFtZSA9ICdDaGFuZ2UgRGV0ZWN0aW9uJztcbiAgICAvLyBQcm9maWxlciBpcyBub3QgYXZhaWxhYmxlIGluIEFuZHJvaWQgYnJvd3NlcnMsIG5vciBpbiBJRSA5IHdpdGhvdXQgZGV2IHRvb2xzIG9wZW5lZFxuICAgIGNvbnN0IGlzUHJvZmlsZXJBdmFpbGFibGUgPSB3aW5kb3cuY29uc29sZS5wcm9maWxlICE9IG51bGw7XG4gICAgaWYgKHJlY29yZCAmJiBpc1Byb2ZpbGVyQXZhaWxhYmxlKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5wcm9maWxlKHByb2ZpbGVOYW1lKTtcbiAgICB9XG4gICAgY29uc3Qgc3RhcnQgPSBnZXRET00oKS5wZXJmb3JtYW5jZU5vdygpO1xuICAgIGxldCBudW1UaWNrcyA9IDA7XG4gICAgd2hpbGUgKG51bVRpY2tzIDwgNSB8fCAoZ2V0RE9NKCkucGVyZm9ybWFuY2VOb3coKSAtIHN0YXJ0KSA8IDUwMCkge1xuICAgICAgdGhpcy5hcHBSZWYudGljaygpO1xuICAgICAgbnVtVGlja3MrKztcbiAgICB9XG4gICAgY29uc3QgZW5kID0gZ2V0RE9NKCkucGVyZm9ybWFuY2VOb3coKTtcbiAgICBpZiAocmVjb3JkICYmIGlzUHJvZmlsZXJBdmFpbGFibGUpIHtcbiAgICAgIC8vIG5lZWQgdG8gY2FzdCB0byA8YW55PiBiZWNhdXNlIHR5cGUgY2hlY2tlciB0aGlua3MgdGhlcmUncyBubyBhcmd1bWVudFxuICAgICAgLy8gd2hpbGUgaW4gZmFjdCB0aGVyZSBpczpcbiAgICAgIC8vXG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ29uc29sZS9wcm9maWxlRW5kXG4gICAgICAoPGFueT53aW5kb3cuY29uc29sZS5wcm9maWxlRW5kKShwcm9maWxlTmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IG1zUGVyVGljayA9IChlbmQgLSBzdGFydCkgLyBudW1UaWNrcztcbiAgICB3aW5kb3cuY29uc29sZS5sb2coYHJhbiAke251bVRpY2tzfSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlc2ApO1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhgJHttc1BlclRpY2sudG9GaXhlZCgyKX0gbXMgcGVyIGNoZWNrYCk7XG5cbiAgICByZXR1cm4gbmV3IENoYW5nZURldGVjdGlvblBlcmZSZWNvcmQobXNQZXJUaWNrLCBudW1UaWNrcyk7XG4gIH1cbn1cbiJdfQ==