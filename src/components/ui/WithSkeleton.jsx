"use client";

import { useEffect, useState } from "react";
import { SkeletonView } from "@/components/ui/SkeletonView";

function useLoading(ms, dep) {
  var _s = useState(true),
    loading = _s[0],
    setLoading = _s[1];
  useEffect(
    function () {
      setLoading(true);
      var t = setTimeout(function () {
        setLoading(false);
      }, ms);
      return function () {
        clearTimeout(t);
      };
    },
    [dep],
  );
  return loading;
}

export function WithSkeleton(props) {
  var loading = useLoading(props.ms || 450, props.dep);
  return loading ? <SkeletonView kind={props.kind} /> : props.children;
}