"use client";

import { Component } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export var PPBoundary = (function () {
  function B(p) {
    Component.call(this, p);
    this.state = {
      err: null,
    };
  }
  B.prototype = Object.create(Component.prototype);
  B.prototype.constructor = B;
  B.getDerivedStateFromError = function (e) {
    return {
      err: e,
    };
  };
  B.prototype.componentDidCatch = function (e) {
    try {
      console.error("PlugPay UI error:", e);
    } catch (_) {}
  };
  B.prototype.render = function () {
    var self = this;
    if (this.state.err)
      return (
        <div
          style={{
            maxWidth: 520,
            margin: "60px auto",
            padding: 16,
          }}
        >
          <ErrorState
            title="This screen hit a snag"
            sub="The page failed to render. Your data is safe - reload to continue."
            onRetry={function () {
              self.setState({
                err: null,
              });
            }}
            retryLabel="Try again"
            backTo="/"
            backLabel="Back to home"
          />
        </div>
      );
    return this.props.children;
  };
  return B;
})();