'use client';

import { useCallback, useState } from 'react';

export function useTouchFeedback() {
  const [pressed, setPressed] = useState(false);

  const onTouchStart = useCallback(() => setPressed(true), []);
  const onTouchEnd = useCallback(() => setPressed(false), []);
  const onTouchCancel = useCallback(() => setPressed(false), []);

  return {
    pressed,
    touchProps: {
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    },
    motionScale: pressed ? 0.98 : 1,
  };
}
