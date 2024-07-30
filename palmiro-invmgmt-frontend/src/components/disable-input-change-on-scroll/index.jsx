import React, { useEffect } from "react";

function DisableInputChangeOnScroll() {
  useEffect(() => {
    const fn = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };
    document.addEventListener("wheel", fn);
    return () => {
      document.removeEventListener("wheel", fn);
    };
  }, []);
  return false;
}

export default DisableInputChangeOnScroll;
