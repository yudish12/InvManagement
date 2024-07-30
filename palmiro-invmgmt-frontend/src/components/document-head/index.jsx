import React, { useEffect } from "react";

function DocumentHead({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return false;
}

export default DocumentHead;
