import * as React from "react";

export function useCombinedRefs<Element>(
  forwardRef: React.RefObject<Element> | React.Ref<Element>
) {
  const innerRef = React.useRef<Element>(null);

  React.useImperativeHandle(forwardRef, () => innerRef.current as Element);

  return innerRef;
}
