(function () {
  function getFocusTarget(view) {
    if (!view || typeof view.querySelector !== 'function') return null;
    return view.querySelector('h1, h2, [role="heading"]') || view;
  }

  function prepareFocusTarget(target) {
    if (!target) return null;
    var naturallyFocusable = typeof target.matches === 'function' &&
      target.matches('a[href], button, input, select, textarea, [tabindex]');
    if (!naturallyFocusable && typeof target.setAttribute === 'function') {
      target.setAttribute('tabindex', '-1');
    }
    return target;
  }

  function focusView(view) {
    var target = prepareFocusTarget(getFocusTarget(view));
    if (!target || typeof target.focus !== 'function') return false;
    try {
      target.focus({ preventScroll: true });
    } catch (_) {
      target.focus();
    }
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getFocusTarget, prepareFocusTarget, focusView };
  }

  if (typeof window === 'undefined' || typeof window.go !== 'function') return;
  if (window.go.__aawzFocusManaged) return;

  var originalGo = window.go;
  function focusManagedGo(id) {
    var result = originalGo.apply(this, arguments);
    var move = function () {
      var view = document.getElementById(id);
      if (view && view.classList.contains('active')) focusView(view);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(move);
    else setTimeout(move, 0);
    return result;
  }

  focusManagedGo.__aawzFocusManaged = true;
  window.go = focusManagedGo;
})();
