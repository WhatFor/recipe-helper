import { useEffect } from "react";

type Action = { key: string; ctrlKey?: boolean; shiftKey?: boolean };

const useKeybind = (action: Action, callback: () => void) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === action.key) {
        if (action.ctrlKey && !e.ctrlKey) return;
        if (action.shiftKey && !e.shiftKey) return;

        callback();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [action, callback]);
};

export default useKeybind;
